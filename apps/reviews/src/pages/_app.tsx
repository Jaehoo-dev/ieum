import type { AppProps } from "next/app";

import "~/styles/globals.css";

import { api } from "~/utils/api";

function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default api.withTRPC(App);
