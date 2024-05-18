import type { ReactNode } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

interface Props {
  children: ReactNode;
}

export function AuthGuard({ children }: Props) {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      void router.push("/login");
    },
  });

  if (status === "loading") {
    return null;
  }

  return <>{children}</>;
}
