import { Suspense } from "react";
import { useRouter } from "next/router";
import { Profile } from "@ieum/profile";
import { assert } from "@ieum/utils";

import { Spacing } from "~/components/Spacing";
import { api } from "~/utils/api";

export function ProfilePreviewPage() {
  return (
    <Suspense>
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center shadow-xl">
        <header className="fixed top-0 z-10 flex h-14 w-full items-center justify-center border-b border-b-gray-200 bg-white">
          <h1 className="text-2xl font-semibold text-gray-700">
            프로필 미리보기
          </h1>
        </header>
        <main className="mt-14 w-full p-6">
          <Resolved />
        </main>
      </div>
    </Suspense>
  );
}

function Resolved() {
  const router = useRouter();
  const basicMemberId = router.query.basicMemberId as string;

  const { data: profile, isPending } =
    api.basicMemberRouter.getProfileByMemberId.useQuery(
      { memberId: basicMemberId },
      { enabled: basicMemberId != null },
    );

  if (isPending) {
    return <div>Loading...</div>;
  }

  assert(profile != null, "profile should be defined");

  return (
    <div className="flex w-full flex-col">
      <Profile
        profile={profile}
        nameWatermark="미리보기"
        numberWatermark="미리보기"
        defaultOpened={true}
      />
      <Spacing size={108} />
      <div className="fixed bottom-0 left-0 flex w-full flex-col gap-2 border-t border-gray-200 bg-white p-4 pt-2 md:px-6">
        <span className="text-center text-sm text-gray-600">
          ※ 24시간 이상 무응답 시 휴면회원으로 전환합니다
        </span>
        <button
          className="m-auto w-full max-w-md rounded-lg bg-primary-500 p-3 text-xl font-medium text-white hover:bg-primary-700"
          onClick={() => {
            router.push(`/basic/members/${basicMemberId}/profile/update`);
          }}
        >
          수정
        </button>
      </div>
    </div>
  );
}
