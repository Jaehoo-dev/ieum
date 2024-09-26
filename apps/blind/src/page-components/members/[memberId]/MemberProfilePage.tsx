import { ReactElement, Suspense, useEffect } from "react";
import { useRouter } from "next/router";
import { BlindProfile } from "@ieum/profile";
import { assert, formatUniqueMemberName } from "@ieum/utils";

import { Layout } from "~/components/Layout";
import { Loader } from "~/components/Loader";
import { Spacing } from "~/components/Spacing";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";

export function MemberProfilePage() {
  const router = useRouter();
  const memberId = router.query.memberId;

  return memberId != null ? (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <Loader />
        </div>
      }
    >
      <Resolved memberId={memberId as string} />
    </Suspense>
  ) : null;
}

function Resolved({ memberId }: { memberId: string }) {
  const { member: self } = useMemberAuthContext();

  assert(self != null, "Component should be used within MemberAuthGuard");

  const [profile] = api.blindMemberRouter.getProfile.useSuspenseQuery({
    memberId,
  });

  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    void sendMessage({
      content: `${formatUniqueMemberName(self)} - ${profile.id} 프로필 조회`,
    });
  }, [self, profile.id, sendMessage]);

  return (
    <div className="flex w-full flex-col">
      <BlindProfile profile={profile} />
      <Spacing size={108} />
    </div>
  );
}

MemberProfilePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="회원 프로필">{page}</Layout>;
};
