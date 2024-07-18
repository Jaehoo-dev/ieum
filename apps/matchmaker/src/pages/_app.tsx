import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import Head from "next/head";
import { GoogleAnalytics } from "@next/third-parties/google";

import { api } from "~/utils/api";

import "~/styles/globals.css";

import { AuthGuard } from "~/components/AuthGuard";
import { MemberAuthProvider } from "~/providers/MemberAuthProvider";

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
  auth?: boolean;
};

interface AppPropsWithLayout extends AppProps {
  Component: NextPageWithLayout;
}

const MyApp = ({ Component, pageProps }: AppPropsWithLayout) => {
  const getLayout = Component.getLayout ?? ((page) => page);

  return getLayout(
    <>
      <Head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2182485735586891"
          crossOrigin="anonymous"
        />
      </Head>
      <MemberAuthProvider>
        {Component.auth === false ? (
          <Component {...pageProps} />
        ) : (
          <AuthGuard>
            <Component {...pageProps} />
          </AuthGuard>
        )}
      </MemberAuthProvider>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_MATCH_GA_ID!} />
    </>,
  );
};

export default api.withTRPC(MyApp);
