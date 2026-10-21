import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { prisma } from "./prisma";
import { site } from "./site";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "mysql" }),
  baseURL: process.env.BETTER_AUTH_URL,
  // Admin accounts are created by `pnpm db:seed`, never through public sign-up.
  emailAndPassword: { enabled: true, disableSignUp: true },
  plugins: [
    admin({ defaultRole: "user", adminRoles: ["admin"] }),
    passkey({
      rpID: process.env.PASSKEY_RP_ID ?? "localhost",
      rpName: site.name,
      origin: process.env.BETTER_AUTH_URL,
      authenticatorSelection: {
        // Hardware keys (YubiKey etc.) are cross-platform authenticators.
        authenticatorAttachment: "cross-platform",
        residentKey: "required",
        userVerification: "preferred",
      },
    }),
    nextCookies(),
  ],
});
