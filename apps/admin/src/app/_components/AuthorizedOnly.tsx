"use client";

import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { useSession } from "@ieum/admin-auth";
import { Role } from "@ieum/prisma";

import { AuthorizedSessionProvider } from "../_providers/AuthorizedSessionProvider";

interface Props {
  children: ReactNode;
}

export function AuthorizedOnly({ children }: Props) {
  const { data: session, status } = useSession();
  const 권한이_있는가 =
    session?.user.role === Role.APP_ADMIN ||
    session?.user.role === Role.STORE_MANAGER;

  if (status === "authenticated" && 권한이_있는가) {
    return (
      <AuthorizedSessionProvider session={session}>
        {children}
      </AuthorizedSessionProvider>
    );
  }

  if (status === "authenticated" && !권한이_있는가) {
    redirect("https://www.flatwhite.cafe/403");
  }

  if (status === "unauthenticated") {
    redirect("https://www.flatwhite.cafe/401");
  }

  return <div>loading...</div>;
}
