import type { ReactElement } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { MATCHMAKER_URL } from "@ieum/constants";
import { Gender } from "@ieum/prisma";

import { Layout } from "~/components/Layout";
import { Spacing } from "~/components/Spacing";

export function DemoEntryPage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <meta name="description" content="이음 체험" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="이음 체험" />
        <meta property="og:image" content={`${MATCHMAKER_URL}/heart.webp`} />
        <meta property="og:description" content="이음 체험" />
        <meta property="og:locale" content="ko_KR" />
      </Head>
      <div className="flex w-full flex-col">
        <h2 className="mt-2 text-center text-2xl font-semibold text-gray-700">
          본인의 성별을 선택해주세요
        </h2>
        <Spacing size={24} />
        <div className="flex flex-row gap-2">
          <Link
            href={`/demo/members?my-gender=${Gender.MALE}`}
            className="block w-full rounded-lg bg-blue-500 p-3 text-center text-xl font-medium text-white hover:bg-blue-600"
          >
            남성
          </Link>
          <Link
            href={`/demo/members?my-gender=${Gender.FEMALE}`}
            className="block w-full rounded-lg bg-pink-500 p-3 text-center text-xl font-medium text-white hover:bg-pink-600"
          >
            여성
          </Link>
        </div>
      </div>
    </>
  );
}

DemoEntryPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="이음 미리보기">{page}</Layout>;
};

DemoEntryPage.auth = false;
