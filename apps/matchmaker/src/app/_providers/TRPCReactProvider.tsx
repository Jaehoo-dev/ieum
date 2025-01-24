"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { loggerLink, unstable_httpBatchStreamLink } from "@trpc/client";
import superjson from "superjson";

import { env } from "~/env.mjs";
import { api } from "~/utils/api";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // browser should use relative url
    return "";
  }

  if (env.VERCEL_URL) {
    // SSR should use vercel url
    return env.VERCEL_URL;
  }

  // dev SSR should use localhost
  return `http://localhost:${env.PORT}`;
};

export function TRPCReactProvider(props: {
  children: React.ReactNode;
  headers?: Headers;
}) {
  const [queryClient] = useState(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: Infinity,
          refetchOnWindowFocus: false,
          refetchOnMount: false,
          suspense: true,
          retry: false,
        },
      },
    });
  });

  const [trpcClient] = useState(() => {
    return api.createClient({
      transformer: superjson,
      links: [
        loggerLink({
          enabled: (opts) => {
            return (
              process.env.NODE_ENV === "development" ||
              (opts.direction === "down" && opts.result instanceof Error)
            );
          },
        }),
        unstable_httpBatchStreamLink({
          url: `${getBaseUrl()}/api/trpc`,
          headers() {
            const headers = new Map(props.headers);
            headers.set("x-trpc-source", "nextjs-react");

            return Object.fromEntries(headers);
          },
        }),
      ],
    });
  });

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </api.Provider>
  );
}
