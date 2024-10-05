import type { GetServerSidePropsContext } from "next";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma, UserType } from "@ieum/prisma";
import NextAuth, { getServerSession } from "next-auth";
import type { DefaultSession, NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";

export type { Session } from "next-auth";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      phoneNumber: string;
      type: UserType;
    };
  }

  interface User {
    phoneNumber: string;
    type: UserType;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    jwt: ({ token, user }) => {
      if (user == null) {
        return token;
      }

      return {
        ...token,
        id: user.id,
        phoneNumber: user.phoneNumber,
        type: user.type,
      };
    },
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          phoneNumber: token.phoneNumber,
          type: token.type,
        },
      };
    },
  },
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    CredentialsProvider({
      credentials: {
        verificationId: { type: "text" },
        phoneNumber: { type: "text" },
        otp: { type: "text" },
      },
      authorize: async (credentials) => {
        if (credentials == null) {
          return null;
        }

        const isOtpValid = await verifyOtp({
          verificationId: credentials.verificationId,
          phoneNumber: credentials.phoneNumber,
          code: credentials.otp,
        });

        if (!isOtpValid) {
          return null;
        }

        const existingUser = await prisma.user.findUnique({
          where: {
            phoneNumber_type: {
              phoneNumber: credentials.phoneNumber,
              type: UserType.BLIND_MEMBER,
            },
          },
          select: {
            id: true,
            phoneNumber: true,
            type: true,
          },
        });

        if (existingUser != null) {
          await setOtpUsed(credentials.verificationId);

          return {
            id: existingUser.id,
            phoneNumber: existingUser.phoneNumber,
            type: existingUser.type,
          };
        }

        const [newUser] = await prisma.$transaction([
          prisma.user.create({
            data: {
              phoneNumber: credentials.phoneNumber,
              type: UserType.BLIND_MEMBER,
            },
            select: {
              id: true,
              phoneNumber: true,
              type: true,
            },
          }),
          setOtpUsed(credentials.verificationId),
        ]);

        return {
          id: newUser.id,
          phoneNumber: newUser.phoneNumber,
          type: newUser.type,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

async function verifyOtp({
  verificationId,
  phoneNumber,
  code,
}: {
  verificationId: string;
  phoneNumber: string;
  code: string;
}) {
  const otp = await prisma.otp.findUnique({
    where: {
      id: verificationId,
      phoneNumber_code_type: {
        phoneNumber,
        code,
        type: UserType.BLIND_MEMBER,
      },
      isUsed: false,
      expiresAt: {
        gte: new Date(),
      },
    },
  });

  return otp != null;
}

function setOtpUsed(verificationId: string) {
  return prisma.otp.update({
    where: {
      id: verificationId,
    },
    data: {
      isUsed: true,
    },
  });
}

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = async (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);

  if (
    session?.user.type === UserType.BLIND_MEMBER ||
    session?.user.type === UserType.ADMIN
  ) {
    return session;
  }

  return null;
};

export const BlindNextAuth = NextAuth(authOptions);

export * from "next-auth/react";
