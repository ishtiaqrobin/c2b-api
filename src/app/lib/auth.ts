import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { UserType } from "../../generated/prisma/enums";
import { bearer, emailOTP } from "better-auth/plugins";
import { sendEmail } from "../utils/email";
import { env } from "../../app/config/env";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  trustedOrigins: [
    env.FRONTEND_URL,
    env.BETTER_AUTH_URL,
    "http://localhost:5000",
    "http://localhost:3000",
  ],

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,

      // New Google sign-ups are always storefront customers.
      mapProfileToUser: () => {
        return {
          userType: UserType.CUSTOMER,
          emailVerified: true,
          isDeleted: false,
          deletedAt: null,
        };
      },
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },

  user: {
    additionalFields: {
      // Matches User.userType (CUSTOMER / STAFF) in the Prisma schema.
      userType: {
        type: "string",
        required: true,
        defaultValue: UserType.CUSTOMER,
        input: false, // cannot be set by the client during sign-up
      },
      isDeleted: {
        type: "boolean",
        required: true,
        defaultValue: false,
        input: false,
      },
      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null,
        input: false,
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        // Hard-enforce safe defaults so no one can self-register as STAFF.
        before: async (user) => {
          return {
            data: {
              ...user,
              userType: UserType.CUSTOMER,
              isDeleted: false,
              deletedAt: null,
            },
          };
        },
      },
    },
  },

  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (user && !user.emailVerified) {
            sendEmail({
              to: email,
              subject: "Verify your email",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp,
              },
            });
          }
        } else if (type === "forget-password") {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            sendEmail({
              to: email,
              subject: "Reset your password",
              templateName: "reset-otp",
              templateData: {
                name: user.name,
                otp,
              },
            });
          }
        }
      },

      expiresIn: 2 * 60, // 2 minutes
      otpLength: 6,
    }),
  ],

  session: {
    expiresIn: 60 * 60 * 24, // 1 day in seconds
    updateAge: 60 * 60 * 24, // refresh once per day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24,
    },
  },

  redirectURLs: {
    signIn: `${env.BETTER_AUTH_URL}/api/v1/auth/google/success`,
  },

  advanced: {
    // Use useSecureCookies + secure:true only over HTTPS in production.
    useSecureCookies: false,
    cookies: {
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/",
        },
      },
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/",
        },
      },
    },
  },
});
