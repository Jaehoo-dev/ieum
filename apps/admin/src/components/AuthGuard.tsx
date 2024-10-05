import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/router";
import { signOut, useSession } from "@ieum/admin-auth";
import { UserType } from "@ieum/prisma";
import { match } from "ts-pattern";

interface Props {
  children: ReactNode;
}

export function AuthGuard({ children }: Props) {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated: () => {
      router.push("/login");
    },
  });

  useEffect(() => {
    if (status !== "loading" && session.user.type !== UserType.ADMIN) {
      signOut();
      router.push("/login");
    }
  }, [status, session?.user.type]);

  return match(status)
    .with("loading", () => null)
    .with("authenticated", () => <>{children}</>)
    .exhaustive();
}
