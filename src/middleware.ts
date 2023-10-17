import { NextResponse, NextRequest } from "next/server";

import { jwtVerify, createRemoteJWKSet, decodeJwt } from "jose";
import { IResource, IUser } from "permitio";

const {
  NEXT_PUBLIC_HANKO_API_URL: hankoApiUrl,
  PERMIT_API_KEY: permitApiKey,
  PERMIT_PDP_URL: pdpUrl = "https://cloudpdp.api.permit.io",
} = process.env;

const NO_AUTHZ_ROUTES = ["/api/permit"];

const LOGIN_URL = "/auth/login";

// Authenticate user using Hanko
const authenticateUser = async (req: NextRequest): Promise<string> => {
  if (!hankoApiUrl) {
    return "";
  }

  // Get Hanko token from cookie
  const hanko = req.cookies.get("hanko")?.value;

  // Fetch JWKS from Hanko API
  const JWKS = createRemoteJWKSet(
    new URL(`${hankoApiUrl}/.well-known/jwks.json`)
  );

  try {
    // Verify Hanko token
    await jwtVerify(hanko ?? "", JWKS);
    const { sub } = decodeJwt(hanko ?? "");
    // Return Hanko token subject as user ID
    return sub as string;
  } catch {
    // Return empty string if Hanko token is invalid
    return "";
  }
};

// Check if user is authorized to perform an action on resource using Permit
const isAuthorized = async (
  user: IUser,
  action: string,
  resource: IResource
): Promise<boolean> => {
  if (!permitApiKey) {
    return true;
  }
  let allowed = false;

  try {
    // Call Permit PDP to check if a request is authorized
    const response = await fetch(`${pdpUrl}/allowed`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${permitApiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        user: user,
        action,
        resource: resource,
        context: {},
      }),
    });
    // Throw error if Permit PDP returns an unexpected status code
    if (response.status !== 200) {
      throw new Error(`Permit.check() got an unexpected status code: ${response.status}, please check your SDK init and make sure the PDP sidecar is configured correctly. \n\
          Read more about setting up the PDP at https://docs.permit.io`);
    }
    const decision = await response.json();
    allowed =
      ("allow" in decision ? decision.allow : decision.result.allow) || false;
  } catch (error) {
    console.error(error);
  }
  return allowed;
};

// Get body from request with fallback to empty object
const getBody = async (req: NextRequest) => {
  try {
    return await new Response(req.body).json();
  } catch {
    return {};
  }
};

// Parse resource string into IResource for GET requests
const resourceFromString = (resource: string): IResource => {
  const parts = resource
    .split("/")
    .slice(resource.indexOf("api") === -1 ? 1 : 2);
  if (parts.length < 1 || parts.length > 2) {
    throw Error(`permit.check() got invalid resource string: '${resource}'`);
  }
  return {
    type: parts[0],
    key: parts.length > 1 ? parts[1] : undefined,
    tenant: "default",
  };
};

const getResourceFromRequest = async (req: NextRequest): Promise<IResource> => {
  const {
    nextUrl: { pathname },
    method,
  } = req;

  if (method === "GET") {
    return resourceFromString(pathname);
  }
  return {
    type: pathname.split("/").slice(2).join(":"),
    attributes: await getBody(req),
    tenant: "default",
  };
};

export async function middleware(req: NextRequest) {
  const {
    nextUrl: { pathname },
    method,
  } = req;

  const urlToRedirect = req.nextUrl.clone();

  // Skip auth for login page
  if (pathname === LOGIN_URL) {
    return NextResponse.next();
  }

  // Authenticate user using Hanko
  const user = await authenticateUser(req);

  // Redirect to login page if user is not authenticated
  if (!user) {
    urlToRedirect.pathname = LOGIN_URL;
    return NextResponse.rewrite(urlToRedirect);
  }

  // Redirect to home page if user is authenticated and tries to access login page
  if (user && pathname === LOGIN_URL) {
    urlToRedirect.pathname = "/";
    return NextResponse.rewrite(urlToRedirect);
  }

  // Check if user is authorized to access resource using Permit
  const authorized = await isAuthorized(
    { key: user },
    method.toLowerCase(),
    await getResourceFromRequest(req)
  );

  // Return error if user is not authorized to access resource and resource requires authorization
  if (!authorized && !NO_AUTHZ_ROUTES.includes(pathname)) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message: "You are not allowed to access this resource.",
      },
      {
        status: 403,
      }
    );
  }

  // Return next response only if user is authenticated and authorized
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
