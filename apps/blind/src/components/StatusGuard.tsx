import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { MemberStatus } from "@ieum/prisma";
import { assert } from "@ieum/utils";

import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";

interface Props {
  children: ReactNode;
}

export function StatusGuard({ children }: Props) {
  const router = useRouter();
  const { member } = useMemberAuthContext();

  assert(member != null, "Hook should be used within MemberAuthGuard");

  const { data: memberStatus } = api.blindMemberRouter.getStatus.useQuery({
    memberId: member.id,
  });

  useEffect(() => {
    if (memberStatus == null) {
      return;
    }

    if (memberStatus !== MemberStatus.ACTIVE) {
      router.replace("/settings");
    }
  }, [memberStatus, router]);

  return memberStatus === MemberStatus.ACTIVE ? <>{children}</> : null;
}
