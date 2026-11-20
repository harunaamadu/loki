import NextAuth from "next-auth";
import authConfig from "@/auth.config";

// Edge-safe Auth.js instance (no DB adapter) that guards the routes below.
// The rules live in `authorized()` in src/auth.config.ts.
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/wishlist/:path*",
  ],
};
