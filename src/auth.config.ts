import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/generated/prisma/client";

const PROTECTED = ["/account", "/checkout", "/orders"];

export default {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const path = nextUrl.pathname;
      if (path.startsWith("/admin")) return auth?.user?.role === "ADMIN";
      if (PROTECTED.some((p) => path.startsWith(p))) return !!auth?.user;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "USER";
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id;
      if (token.role) session.user.role = token.role as Role;
      return session;
    },
  },
} satisfies NextAuthConfig;
