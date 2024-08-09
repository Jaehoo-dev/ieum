import { useEffect } from "react";
import type { ReactElement } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { MATCHMAKER_URL } from "@ieum/constants";

import { Layout } from "~/components/Layout";
import { Spacing } from "~/components/Spacing";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";

export function DemoEntryPage() {
  const router = useRouter();
  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    void sendMessage({
      content: `체험 - 선택 페이지 진입\n${navigator.userAgent}\nfrom: ${router.query.from}\nreferrer: ${document.referrer}`,
    });
  }, [router.query.from, sendMessage]);

  return (
    <>
      <Head>
        <meta name="description" content="이음 매칭 체험" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="매칭 체험 | 이음" />
        <meta property="og:image" content={`${MATCHMAKER_URL}/heart.webp`} />
        <meta property="og:description" content="이음 매칭 체험" />
        <meta property="og:locale" content="ko_KR" />
      </Head>
      <div className="flex w-full flex-col">
        <h2 className="mt-2 text-center text-2xl font-semibold text-gray-700">
          본인의 성별을 선택해주세요
        </h2>
        <Spacing size={24} />
        <div className="flex flex-row gap-2">
          <Link
            href="/demo/match?my-gender=male"
            className="block w-full rounded-lg bg-blue-500 p-3 text-center text-xl font-medium text-white hover:bg-blue-600"
            onClick={() => {
              void sendMessage({ content: "체험 - 남성 선택" });
            }}
          >
            남성
          </Link>
          <Link
            href="/demo/match?my-gender=female"
            className="block w-full rounded-lg bg-pink-500 p-3 text-center text-xl font-medium text-white hover:bg-pink-600"
            onClick={() => {
              void sendMessage({ content: "체험 - 여성 선택" });
            }}
          >
            여성
          </Link>
        </div>
        <Spacing size={32} />
        <Link
          href="/tips?from=demo-entry"
          className="text-center text-lg text-gray-600 underline hover:text-gray-800"
          onClick={() => {
            void sendMessage({ content: "체험 - 소개팅 꿀팁 보러 가기 클릭" });
          }}
        >
          소개팅 꿀팁 보러 가기
        </Link>
      </div>
    </>
  );
}

DemoEntryPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="상대방 프로필 예시">{page}</Layout>;
};

DemoEntryPage.auth = false;
