import { ReactElement, ReactNode, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { PRODUCT_URL } from "@ieum/constants";
import VerifiedIcon from "@mui/icons-material/Verified";

import { Layout } from "~/components/Layout";
import { Spacing } from "~/components/Spacing";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";

export function IntroductionPage() {
  const router = useRouter();
  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    sendMessage({
      content: "이음 블라인드 안내 페이지 진입",
    });
  }, []);

  return (
    <>
      <div className="mb-10 flex flex-col gap-10 text-gray-700">
        <div className="flex flex-col gap-4">
          <h2 className="border-b border-blind-500 pb-2 text-lg font-semibold text-blind-500">
            이음은?
          </h2>
          <div className="flex flex-col gap-2">
            <Description
              icon="🔍"
              content="매니저나 시스템의 제안을 기다리지 않고 직접 짝을 찾아요."
            />
            <Description
              icon="📃"
              content="회원 목록에서 간략 프로필(출생연도, 지역, 키, 체형, 직업, 자기소개)을 보고 이성에게 호감을 보내요."
            />
            <Description
              icon="💖"
              content="다른 회원도 나의 프로필을 보고 호감을 보낼 수 있어요."
            />
            <Description
              icon="📷"
              content="간략 프로필엔 사진을 공개하지 않아요. 사진을 주고받을지는 성사 이후 당사자끼리 합의합니다."
            />
            <Description
              icon="🪪"
              content={
                <>
                  직장 등을 인증한 회원은 프로필에 인증 배지를 표시해요.{" "}
                  <VerifiedIcon className="mb-0.5 text-sm text-blind-400" />
                </>
              }
            />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="border-b border-blind-500 pb-2 text-lg font-semibold text-blind-500">
            안내사항
          </h3>
          <div className="flex flex-col gap-2">
            <Description
              icon="💰"
              content={
                <>
                  베타 기간 동안{" "}
                  <span className="font-medium text-blind-500">무료</span>로
                  운영해요. 가입, 하트 보내기, 성사 모두 비용이 발생하지 않아요.
                </>
              }
            />
            <Description
              icon="⛔️"
              content="무료 기간 무분별한 하트 발송을 방지하기 위해 하트 개수를 주 3개로 제한해요. 월요일마다 충전해드려요."
            />
          </div>
        </div>
      </div>
      <Spacing size={80} />
      <div className="fixed bottom-0 left-0 flex w-full items-center justify-center border-t border-gray-200 bg-white p-4 md:px-6">
        <div className="w-full max-w-lg px-2">
          <Link
            href="/"
            className="block w-full rounded-lg bg-blind-500 p-3 text-center text-xl font-medium text-white hover:bg-blind-600"
            onClick={() => {
              router.push("/");
            }}
          >
            시작하기
          </Link>
        </div>
      </div>
    </>
  );
}

function Description({ icon, content }: { icon: string; content: ReactNode }) {
  return (
    <div className="flex gap-2">
      <span>{icon}</span>
      <p>{content}</p>
    </div>
  );
}

IntroductionPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="이음 소개">{page}</Layout>;
};

IntroductionPage.auth = false;
