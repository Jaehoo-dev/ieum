import { ReactElement, ReactNode } from "react";
import Link from "next/link";
import {
  BASIC_PROFILE_DEMO_URL,
  BASIC_REGISTER_DEMO_URL,
  PRICING_URL,
  PRODUCT_URL,
} from "@ieum/constants";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

import { Layout } from "~/components/Layout";

export function BasicPromotionPage() {
  return (
    <>
      <div className="mb-24 flex flex-col gap-10 text-gray-700">
        <div className="flex flex-col gap-4">
          <h2 className="border-b border-primary-500 pb-2 text-lg font-semibold text-primary-500">
            이음 베이직이란?
          </h2>
          <div className="flex flex-col gap-2">
            <Description
              icon="🔍"
              content={
                <>
                  <span>
                    약 80개 설문을 기반으로 이음 매니저가 직접 이상형을
                    찾아드려요.{" "}
                  </span>
                  <ExternalLink href={BASIC_REGISTER_DEMO_URL}>
                    설문 미리보기
                  </ExternalLink>
                </>
              }
            />
            <Description
              icon="📃"
              content={
                <>
                  <span>
                    더 자세한 프로필을 제공해요. 꼼꼼하게 따지고 결정하세요.{" "}
                  </span>
                  <ExternalLink href={BASIC_PROFILE_DEMO_URL}>
                    프로필 예시 보기
                  </ExternalLink>
                </>
              }
            />
            <Description
              icon="📷"
              content="외모까지 취향에 맞는지 미리 알고 결정하세요."
            />
            <Description
              icon="🪪"
              content="검증된 회원만으로 회원군이 이뤄져 있어요."
            />
            <Description
              icon="💸"
              content={
                <>
                  <span>
                    어떤 온라인 소개팅이나 결정사보다도 합리적이에요.{" "}
                  </span>
                  <ExternalLink href={PRICING_URL}>가격 알아보기</ExternalLink>
                </>
              }
            />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="border-b border-primary-500 pb-2 text-lg font-semibold text-primary-500">
            안내사항
          </h3>
          <div className="flex flex-col gap-2">
            <Disclaimer text="이음 베이직은 가입 심사를 거칩니다." />
            <Disclaimer text="이음 베이직은 신분과 직장, 학력 인증을 필수로 받습니다." />
            <Disclaimer text="이음 베이직과 이음 블라인드는 별도 회원 체계로 운영해요. 따라서 매칭이 겹칠 수도 있어요." />
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 flex w-full items-center justify-center border-t border-gray-200 bg-white p-4 md:px-6">
        <div className="w-full max-w-lg px-2">
          <Link
            href={PRODUCT_URL}
            className="block w-full rounded-lg bg-primary-500 p-3 text-center text-lg font-medium text-white hover:enabled:bg-primary-700  disabled:opacity-50"
            target="_blank"
            rel="noopener"
          >
            더 알아보기
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

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-primary-500 underline hover:text-primary-700"
      target="_blank"
      rel="noopener"
    >
      <span>{children}</span>
      <OpenInNewRoundedIcon className="mb-0.5 text-sm" />
    </Link>
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

BasicPromotionPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="이음 베이직이란">{page}</Layout>;
};

BasicPromotionPage.auth = false;
