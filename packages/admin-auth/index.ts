import type { GetServerSidePropsContext } from "next";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma, UserType } from "@ieum/prisma";
import { format } from "date-fns";
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
      username: string | null;
      phoneNumber: string;
      type: UserType;
    };
  }

  interface User {
    username: string | null;
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
        username: user.username,
        phoneNumber: user.phoneNumber,
        type: user.type,
      };
    },
    session: ({ session, token }) => {
      if (token.type !== UserType.ADMIN) {
        return null as any;
      }

      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          username: token.username,
          phoneNumber: token.phoneNumber,
          type: token.type,
        },
      };
    },
  },
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Username",
          type: "text",
        },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (credentials == null) {
          return null;
        }

        const [_password, secret] = credentials.password.split("-");
        const currentMinute = format(new Date(), "mm");

        const user = await prisma.user.findUnique({
          where: {
            username: credentials.username,
            password: _password,
            type: UserType.ADMIN,
          },
        });

        if (user == null || secret !== currentMinute) {
          return null;
        }

        return {
          id: user.id,
          username: user.username,
          phoneNumber: user.phoneNumber,
          type: user.type,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

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

  if (session?.user.type !== UserType.ADMIN) {
    return null;
  }

  return session;
};

export const AdminNextAuth = NextAuth(authOptions);

export * from "next-auth/react";
