import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/router";

import { useMemberAuthContext } from "../providers/MemberAuthProvider";

interface Props {
  children: ReactNode;
}

export function AuthGuard({ children }: Props) {
  const router = useRouter();
  const { member, loading, signOut, loggedIn, registered, preRegistered } =
    useMemberAuthContext();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!loggedIn) {
      signOut();
      router.push("/");

      return;
    }

    if (!preRegistered) {
      signOut();
      router.push("/pre-register");

      return;
    }

    if (!registered) {
      signOut();
      router.push("/register");
    }
  }, [loading, registered, router, signOut]);

  if (loading || member == null) {
    return null;
  }

  return <>{children}</>;
}
