import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/router";

import { useMemberAuthContext } from "./MemberAuthProvider";

interface Props {
  children: ReactNode;
}

export function AuthGuard({ children }: Props) {
  const router = useRouter();
  const { member, loading, signOut } = useMemberAuthContext();

  useEffect(() => {
    if (!loading && member == null) {
      void signOut();
      void router.push("/");
    }
  }, [loading, member, router, signOut]);

  if (loading || member == null) {
    return null;
  }

  return <>{children}</>;
}
