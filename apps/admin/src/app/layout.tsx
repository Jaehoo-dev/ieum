import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "~/styles/globals.css";

import type { ReactNode } from "react";
import { headers } from "next/headers";
import { SessionProvider } from "@ieum/admin-auth";

import { AuthorizedOnly } from "./_components/AuthorizedOnly";
import { TRPCReactProvider } from "./_providers/TRPCReactProvider";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "플랫화이트 상점관리",
};

/**
 * Since we're passing `headers()` to the `TRPCReactProvider` we need to
 * make the entire app dynamic. You can move the `TRPCReactProvider` further
 * down the tree (e.g. /dashboard and onwards) to make part of the app statically rendered.
 */
export const dynamic = "force-dynamic";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className={["font-sans", fontSans.variable].join(" ")}>
        <SessionProvider>
          <TRPCReactProvider headers={headers()}>
            <AuthorizedOnly>{children}</AuthorizedOnly>
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
