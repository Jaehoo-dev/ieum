import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/router";

import { useMemberAuthContext } from "../providers/MemberAuthProvider";

interface Props {
  children: ReactNode;
}

export function AuthGuard({ children }: Props) {
  const router = useRouter();
  const { member, loading, signOut, registered } = useMemberAuthContext();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!registered) {
      void signOut();
      void router.push("/");
    }
  }, [loading, registered, router, signOut]);

  if (loading || member == null) {
    return null;
  }

  return <>{children}</>;
}
