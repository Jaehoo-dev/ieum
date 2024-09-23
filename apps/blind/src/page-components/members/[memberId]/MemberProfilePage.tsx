import { ReactElement, Suspense, useEffect } from "react";
import { useRouter } from "next/router";
import { BlindProfile } from "@ieum/profile";
import { assert, formatUniqueMemberName } from "@ieum/utils";

import { Layout } from "~/components/Layout";
import { Spacing } from "~/components/Spacing";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";

export function MemberProfilePage() {
  return (
    <Suspense fallback={null}>
      <Resolved />
    </Suspense>
  );
}

function Resolved() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const router = useRouter();

  if (router.query.memberId == null) {
    return null;
  }

  const memberId = router.query.memberId as string;

  const [profile] = api.blindMemberRouter.getProfile.useSuspenseQuery({
    memberId,
  });

  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    void sendMessage({
      content: `${formatUniqueMemberName(member)} - ${profile.id} 프로필 조회`,
    });
  }, [member, profile.id, sendMessage]);

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
