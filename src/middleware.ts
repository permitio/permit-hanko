import { NextResponse, NextRequest } from 'next/server';

import { jwtVerify, createRemoteJWKSet } from 'jose';
import path from 'path';

const {
    NEXT_PUBLIC_HANKO_API_URL: hankoApiUrl,
    PERMIT_API_KEY: permitApiKey,

} = process.env;

export async function middleware(req: NextRequest) {
    const { nextUrl: { pathname } } = req;

    const hanko = req.cookies.get('hanko')?.value;

    const JWKS = createRemoteJWKSet(
        new URL(`${hankoApiUrl}/.well-known/jwks.json`)
    );

    try {
        await jwtVerify(hanko ?? '', JWKS);
        if (pathname === '/auth/login') {
            return NextResponse.redirect(new URL('/', req.url));
        }
    } catch {
        if (pathname === '/auth/login' || pathname === '/auth/logout') {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
