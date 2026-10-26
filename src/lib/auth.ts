import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { passwordLoginEnabled } from "./flags";
import { prisma } from "./prisma";
import { site } from "./site";

/**
 * The passkey plugin asks for user verification as "preferred" and does not enforce it on the server,
 * so reject any key that did not verify its holder with a PIN or fingerprint.
 */
function requireUserVerification(verified: boolean | undefined) {
  if (!verified) {
    throw new APIError("UNAUTHORIZED", { message: "Your security key must confirm with its PIN or fingerprint." });
  }
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "mysql" }),
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : [],
  // The admin area is single-user, so sessions are kept short.
  session: { expiresIn: 60 * 60 * 24 * 3, updateAge: 60 * 60 * 12 },
  advanced: {
    useSecureCookies: process.env.BETTER_AUTH_URL?.startsWith("https://") ?? false,
  },
  // Admin accounts are created by `pnpm db:seed`, never through public sign-up.
  emailAndPassword: { enabled: passwordLoginEnabled, disableSignUp: true },
  plugins: [
    admin({ defaultRole: "user", adminRoles: ["admin"] }),
    passkey({
      rpID: process.env.PASSKEY_RP_ID ?? "localhost",
      rpName: site.name,
      registration: {
        afterVerification: ({ verification }) => requireUserVerification(verification.registrationInfo?.userVerified),
      },
      authentication: {
        afterVerification: ({ verification }) => requireUserVerification(verification.authenticationInfo?.userVerified),
      },
      origin: process.env.BETTER_AUTH_URL,
      authenticatorSelection: {
        // Hardware keys (YubiKey etc.) are cross-platform authenticators.
        authenticatorAttachment: "cross-platform",
        residentKey: "required",
        // The key must verify its holder (PIN or fingerprint), so a stolen key alone is not enough.
        userVerification: "required",
      },
    }),
    nextCookies(),
  ],
});
