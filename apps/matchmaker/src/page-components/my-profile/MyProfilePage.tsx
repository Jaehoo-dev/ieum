import { Suspense, useEffect } from "react";
import type { ReactElement } from "react";
import { assert } from "@ieum/utils";

import { Layout } from "~/components/Layout";
import { Profile } from "~/components/Profile";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";

export function MyProfilePage() {
  return (
    <Suspense fallback={null}>
      <Resolved />
    </Suspense>
  );
}

function Resolved() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    void sendMessage(`${member.name} - 내 프로필 페이지 진입`);
  }, [member.name, sendMessage]);

  const [profile] = api.basicMemberRouter.getProfileById.useSuspenseQuery({
    id: member.id,
  });

  return profile != null ? (
    <Profile profile={profile} watermarkText="이음" />
  ) : (
    <Empty />
  );
}

function Empty() {
  return (
    <div className="mt-4 flex flex-col items-center">
      <p className="text-4xl">📃</p>
      <p className="text-lg text-primary-500">프로필이 없습니다.</p>
      <p className="text-lg text-primary-500">
        호스트에게 프로필 생성을 요청하세요.
      </p>
    </div>
  );
}

MyProfilePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="내 프로필">{page}</Layout>;
};
