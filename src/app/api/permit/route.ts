import { cookies } from "next/headers";
import * as jose from "jose";

import { NextRequest, NextResponse } from "next/server";
import { Permit } from "permitio";

const permit = new Permit({
  token: process.env.PERMIT_API_KEY,
});

const getCurrent = async () => {
  const token = cookies().get("hanko")?.value;
  const payload = jose.decodeJwt(token ?? "");

  const key = payload.sub || "";
  return { key };
};

export const POST = async (req: NextRequest) => {
  const { key } = await getCurrent();
  const { email } = await req.json();
  try {
    const user = await permit.api.getUser(key);
    return NextResponse.json(user);
  } catch (e) {
    console.log("user not found");
  }

  console.log("syncing user", key, email);

  const response = await permit.api.syncUser({
    key,
    email,
    attributes: {
      roles: ["user"],
    },
  });

  await permit.api.roleAssignments.assign({
    role: "user",
    tenant: "default",
    user: key,
  });

  return NextResponse.json(response);
};
