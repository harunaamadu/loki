import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/generated/prisma/client";

const SIGNED_IN_ONLY = ["/account", "/checkout", "/orders", "/wishlist"];

export default {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const path = nextUrl.pathname;
      if (path.startsWith("/admin")) return auth?.user?.role === "ADMIN";
      if (SIGNED_IN_ONLY.some((p) => path.startsWith(p))) return !!auth?.user;
      return true;
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if ("id" in token && typeof token.id === "string") {
        session.user.id = token.id;
      }

      session.user.role = ((typeof token.role === "string" ? token.role : "USER") as Role) ?? "USER";
      session.user.verified = token.verified === true;
      return session;
    },
  },
} satisfies NextAuthConfig;
