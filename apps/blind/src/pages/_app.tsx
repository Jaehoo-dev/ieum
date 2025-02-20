import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import Head from "next/head";
import { GoogleAnalytics } from "@next/third-parties/google";

import { api } from "~/utils/api";

import "~/styles/globals.css";

import type { Session } from "@ieum/blind-auth";
import { SessionProvider } from "@ieum/blind-auth";
import { blind500 } from "@ieum/constants";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material";
import { ConfirmProvider } from "material-ui-confirm";

import { AuthGuard } from "~/components/AuthGuard";
import { ErrorBoundary } from "~/components/ErrorBoundary";
import { MemberAuthProvider } from "~/providers/MemberAuthProvider";

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
  auth?: boolean;
};

interface AppPropsWithLayout extends AppProps {
  Component: NextPageWithLayout;
  pageProps: {
    session: Session | null;
  };
}

const MyApp = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) => {
  const getLayout = Component.getLayout ?? ((page) => page);

  return getLayout(
    <SessionProvider session={session}>
      <ErrorBoundary>
        <Head>
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2182485735586891"
            crossOrigin="anonymous"
          />
        </Head>
        <MuiThemeProvider theme={muiTheme}>
          <ConfirmProvider>
            <MemberAuthProvider>
              {Component.auth === false ? (
                <Component {...pageProps} />
              ) : (
                <AuthGuard>
                  <Component {...pageProps} />
                </AuthGuard>
              )}
            </MemberAuthProvider>
          </ConfirmProvider>
        </MuiThemeProvider>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_MATCH_GA_ID!} />
      </ErrorBoundary>
    </SessionProvider>,
  );
};

export default api.withTRPC(MyApp);

const muiTheme = createTheme({
  palette: {
    primary: {
      main: blind500,
    },
  },
});
