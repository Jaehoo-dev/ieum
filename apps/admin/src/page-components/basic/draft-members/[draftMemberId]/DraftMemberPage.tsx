import { ReactElement, Suspense } from "react";
import { useRouter } from "next/router";

import { Layout } from "~/components/Layout";
import { api } from "~/utils/api";

export function DraftMemberPage() {
  return (
    <div className="flex min-h-screen flex-col items-center gap-4 py-2">
      <h1 className="text-2xl font-semibold">신규 가입 회원 목록</h1>
      <Suspense>
        <Resolved />
      </Suspense>
    </div>
  );
}

function Resolved() {
  const router = useRouter();
  const draftMemberId = router.query.draftMemberId as string;

  if (draftMemberId == null) {
    return null;
  }

  const [draftMember] = api.draftBasicMemberRouter.findOne.useSuspenseQuery({
    id: draftMemberId,
  });

  return <div>{JSON.stringify(draftMember)}</div>;
}

DraftMemberPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
