import { Suspense } from "react";
import type { ReactElement } from "react";
import { useRouter } from "next/router";
import { assert } from "@ieum/utils";

import { KakaoBrowserOnly } from "~/components/KakaoBrowserOnly";
import { Layout } from "~/components/Layout";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { KakaoBrowserFallback } from "../../components/KakaoBrowserFallback";

export function MegaphoneMatchPage() {
  return (
    <KakaoBrowserOnly fallback={<KakaoBrowserFallback />}>
      <Suspense fallback={null}>
        <Resolved />
      </Suspense>
    </KakaoBrowserOnly>
  );
}

function Resolved() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const router = useRouter();

  if (router.query.megaphoneMatchId == null) {
    return null;
  }

  const matchId = router.query.megaphoneMatchId as string;

  return null;
}

MegaphoneMatchPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="상대방 프로필">{page}</Layout>;
};
