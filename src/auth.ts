import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import authConfig from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validations";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    // Safe because signIn() below only accepts Google emails Google has verified.
    // This lets migrated Firebase Google users sign in to their existing record.
    Google({ allowDangerousEmailAccountLinking: true }),
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw, request) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          "unknown";
        const allowed =
          (await rateLimit(`login:ip:${ip}`, 20, 900)) &&
          (await rateLimit(`login:email:${parsed.data.email}`, 8, 900));
        if (!allowed) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user?.passwordHash) return null;
        if (!(await bcrypt.compare(parsed.data.password, user.passwordHash)))
          return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ account, profile }) {
      if (account?.provider === "google")
        return profile?.email_verified === true;
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      const userId = typeof token.id === "string" ? token.id : null;
      if (!userId) return token;

      const db = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          role: true,
          email: true,
          emailVerified: true,
          passwordChangedAt: true,
        },
      });
      if (!db) return null;

      // Sessions issued before a password reset are no longer valid
      if (
        db.passwordChangedAt &&
        token.iat &&
        token.iat * 1000 < db.passwordChangedAt.getTime()
      ) {
        return null;
      }

      let role = db.role;
      if (
        db.emailVerified &&
        role !== "ADMIN" &&
        ADMIN_EMAILS.includes(db.email.toLowerCase())
      ) {
        await prisma.user.update({
          where: { id: userId },
          data: { role: "ADMIN" },
        });
        role = "ADMIN";
      }
      token.role = role;
      token.verified = !!db.emailVerified;
      return token;
    },
  },
  events: {
    async linkAccount({ user, account }) {
      if (account.provider === "google" && user.id) {
        await prisma.user.updateMany({
          where: { id: user.id, emailVerified: null },
          data: { emailVerified: new Date() },
        });
      }
    },
  },
});
