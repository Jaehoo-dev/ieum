import { ReactElement, Suspense, useEffect } from "react";
import { assert, formatUniqueMemberName } from "@ieum/utils";

import { Layout } from "~/components/Layout";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { ResolvedPreRegisterSection } from "./_components/ResolvedPreRegisterButton";

export function BlindPreRegisterPage() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    sendMessage({
      content: `${formatUniqueMemberName(
        member,
      )} - 이음 블라인드 사전 신청 페이지 진입`,
    });
  }, []);

  return (
    <div className="mb-10 flex flex-col gap-10 text-gray-700">
      <div className="flex flex-col gap-4">
        <h2 className="border-b border-blind-500 pb-2 text-lg font-semibold text-blind-500">
          이음 블라인드란?
        </h2>
        <div className="flex flex-col gap-2">
          <Description
            icon="🎊"
            text="이음 블라인드는 기존 이음(이음 베이직)과 별개로 운영하는 새로운 서비스예요."
          />
          <Description
            icon="🔍"
            text="이음 매니저의 제안을 기다리지 않고 직접 짝을 찾습니다."
          />
          <Description
            icon="📃"
            text="회원 목록에서 간략 프로필(출생연도, 지역, 키, 체형, 직업, 자기소개)을 보고 이성에게 호감을 보내요."
          />
          <Description
            icon="💖"
            text="다른 회원도 나의 프로필을 보고 호감을 보낼 수 있어요."
          />
          <Description
            icon="📷"
            text="간략 프로필엔 사진을 공개하지 않아요. 사진을 주고받을지는 성사 이후 당사자끼리 합의합니다."
          />
          <Description
            icon="💸"
            text="기존 회원님들껜 가입비를 면제해드려요. 호감 표시와 성사 비용도 무료로 시작하려고 해요."
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="border-b border-blind-500 pb-2 text-lg font-semibold text-blind-500">
          안내사항
        </h3>
        <div className="flex flex-col gap-2">
          <Disclaimer text="이음 블라인드는 이음 베이직과 별도 회원 체계로 운영해요. 따라서 매칭이 겹칠 수도 있어요." />
          <Disclaimer text="추후 유료화할 수 있어요. 미리 고지할 테니 걱정마세요!" />
        </div>
      </div>
      <Suspense>
        <ResolvedPreRegisterSection />
      </Suspense>
    </div>
  );
}

function Description({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex gap-2">
      <span>{icon}</span>
      <p>{text}</p>
    </div>
  );
}

function Disclaimer({ text }: { text: string }) {
  return (
    <div className="flex gap-2">
      <span>⚠️</span>
      <p>{text}</p>
    </div>
  );
}

BlindPreRegisterPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="이음 블라인드 사전 신청">{page}</Layout>;
};
