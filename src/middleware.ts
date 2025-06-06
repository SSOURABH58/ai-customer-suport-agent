import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.headers.get("Authorization")?.split(" ")[1];
  console.log("token", token);

  if (!token) {
    // No token, redirect to login
    return NextResponse.redirect(new URL("/auth", request.url));
  }
  try {
    // Verify the token using Web Crypto
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    console.log(
      "payload",
      Object.keys(payload).map((key) => `${key}: ${payload[key]}`)
    );

    // Optionally pass user info via headers
    const res = NextResponse.next();
    res.headers.set("x-user-id", payload.id as string);
    // res.userId.set()
    return res;
  } catch {
    // Invalid token
    return NextResponse.redirect(new URL("/auth", request.url));
  }
}

export const config = {
  matcher: ["/api/chat/:path*", "/api/chat"],
};
