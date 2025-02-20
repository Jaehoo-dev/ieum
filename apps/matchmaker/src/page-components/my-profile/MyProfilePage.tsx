import { Suspense, useEffect } from "react";
import type { ReactElement } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Profile } from "@ieum/profile";
import { assert, formatUniqueMemberName } from "@ieum/utils";

import { Layout } from "~/components/Layout";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";

export function MyProfilePage() {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      <Suspense fallback={null}>
        <Resolved />
      </Suspense>
    </>
  );
}

function Resolved() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    void sendMessage({
      content: `${formatUniqueMemberName(member)} - 내 프로필 페이지 진입`,
    });
  }, [member, member.name, sendMessage]);

  const [profile] =
    api.basicMemberProfileRouter.getProfileByMemberId.useSuspenseQuery({
      memberId: member.id,
    });

  return profile != null ? (
    <>
      <Profile
        profile={profile}
        nameWatermark="이음"
        numberWatermark="이음"
        style={{ marginBottom: "84px" }}
      />
      <EditButton />
    </>
  ) : (
    <Empty />
  );
}

function EditButton() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const router = useRouter();
  const { sendMessage } = useSlackNotibot();

  return (
    <div className="fixed bottom-0 left-0 flex w-full items-center justify-center border-t border-gray-200 bg-white p-4 md:px-6">
      <div className="w-full max-w-lg px-2">
        <button
          className="w-full rounded-lg bg-primary-500 p-3 text-xl font-medium text-white hover:bg-primary-700"
          onClick={() => {
            sendMessage({
              content: `${formatUniqueMemberName(member)} - 프로필 수정 클릭`,
            });
            router.push("/my-profile/edit");
          }}
        >
          수정
        </button>
      </div>
    </div>
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
