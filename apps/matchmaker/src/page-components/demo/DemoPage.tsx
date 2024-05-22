import { Suspense, useEffect } from "react";
import type { ReactElement } from "react";

import { Layout } from "~/components/Layout";
import { Profile } from "~/components/Profile";
import { Spacing } from "~/components/Spacing";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { api } from "~/utils/api";

export function DemoPage() {
  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    void sendMessage(
      `데모 페이지 진입\n${navigator.userAgent}\nreferrer: ${document.referrer}`,
    );
  }, [sendMessage]);

  return (
    <div className="flex w-full flex-col">
      <Suspense fallback={null}>
        <Resolved />
      </Suspense>
      <Spacing size={108} />
      <Buttons />
    </div>
  );
}

function Resolved() {
  const [profile] = api.basicMemberRouter.getDemoProfile.useSuspenseQuery();

  return <Profile profile={profile} watermarkText="홍길동" />;
}

DemoPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="상대방 프로필 예시">{page}</Layout>;
};

DemoPage.auth = false;

function Buttons() {
  return (
    <div className="fixed bottom-0 left-0 flex w-full flex-col gap-2 border-t border-gray-200 bg-white p-4 pt-2 md:px-6">
      <span className="text-center text-sm text-gray-600">
        ※ 24시간 이상 무응답 시 휴면회원으로 전환합니다
      </span>
      <div className="flex w-full gap-4">
        <button
          className="flex-1 rounded-lg bg-gray-500 p-3 text-xl font-medium text-white enabled:hover:bg-gray-600 disabled:cursor-not-allowed"
          onClick={async () => {
            alert("가입하시면 더 잘 맞는 분을 찾아드릴게요!");
          }}
        >
          거절
        </button>
        <button
          className="flex-1 rounded-lg bg-primary-500 p-3 text-xl font-medium text-white enabled:hover:bg-primary-700 disabled:cursor-not-allowed"
          onClick={async () => {
            alert("가입하시고 이상형을 소개받으세요!");
          }}
        >
          수락
        </button>
      </div>
    </div>
  );
}
