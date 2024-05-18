import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import type { AppProps, AppType } from "next/app";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import "~/styles/globals.css";

import { AuthGuard } from "~/components/AuthGuard";
import { api } from "~/utils/api";

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

const App: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) => {
  const getLayout = Component.getLayout ?? ((page) => page);

  return getLayout(
    <SessionProvider session={session}>
      {Component.auth === false ? (
        <Component {...pageProps} />
      ) : (
        <AuthGuard>
          <Component {...pageProps} />
        </AuthGuard>
      )}
    </SessionProvider>,
  );
};

export default api.withTRPC(App);
