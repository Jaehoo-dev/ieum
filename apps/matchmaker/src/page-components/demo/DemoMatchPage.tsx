import { useEffect } from "react";
import type { ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { HOMEPAGE_URL } from "@ieum/constants";
import { Profile } from "@ieum/profile";
import { isEmptyStringOrNil } from "@ieum/utils";

import { Layout } from "~/components/Layout";
import { Spacing } from "~/components/Spacing";
import { Warning } from "~/components/Warning";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { api } from "~/utils/api";

export function DemoMatchPage() {
  const router = useRouter();
  const genderQuery = router.query["my-gender"] as string;
  const { data: profile } =
    api.basicMemberProfileRouter.getDemoProfile.useQuery(
      { selfGender: genderQuery },
      { enabled: !isEmptyStringOrNil(genderQuery) },
    );
  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    void sendMessage({
      content: `체험 - 프로필 페이지 진입\n${navigator.userAgent}\nreferrer: ${document.referrer}`,
    });
  }, [sendMessage]);

  return (
    <div className="flex w-full flex-col">
      <Warning />
      <Spacing size={16} />
      {profile != null ? (
        <Profile
          profile={profile}
          nameWatermark="체험중"
          numberWatermark="체험중"
          defaultOpened={true}
        />
      ) : null}
      <>
        <Spacing size={108} />
        <Buttons />
      </>
    </div>
  );
}

DemoMatchPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="매칭 체험">{page}</Layout>;
};

DemoMatchPage.auth = false;

function Buttons() {
  return (
    <div className="fixed bottom-0 left-0 flex w-full flex-col gap-2 border-t border-gray-200 bg-white p-4 pt-2 md:px-6">
      <span className="text-center text-sm text-gray-600">
        ※ 24시간 이상 무응답 시 휴면회원으로 전환합니다
      </span>
      <div className="flex w-full gap-4">
        <button
          className="flex-1 rounded-lg bg-gray-500 p-3 text-lg font-medium text-white enabled:hover:bg-gray-600 disabled:cursor-not-allowed"
          onClick={async () => {
            alert("가입하시면 더 잘 맞는 분을 찾아드릴게요!");
          }}
        >
          거절
        </button>
        <Link
          className="flex-1 rounded-lg bg-primary-500 p-3 text-center text-lg font-medium text-white hover:bg-primary-700"
          href={HOMEPAGE_URL}
        >
          소개받으러 가기
        </Link>
      </div>
    </div>
  );
}
