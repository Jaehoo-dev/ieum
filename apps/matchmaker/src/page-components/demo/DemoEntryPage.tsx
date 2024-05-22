import { useEffect } from "react";
import type { ReactElement } from "react";
import Link from "next/link";

import { Layout } from "~/components/Layout";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";

export function DemoEntryPage() {
  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    void sendMessage(
      `체험 - 선택 페이지 진입\n${navigator.userAgent}\nreferrer: ${document.referrer}`,
    );
  }, [sendMessage]);

  return (
    <div className="flex w-full flex-col gap-6">
      <h1 className="mt-2 text-center text-2xl font-semibold text-gray-700">
        본인의 성별을 선택해주세요
      </h1>
      <div className="flex flex-row gap-2">
        <Link
          href="/demo/match?my-gender=male"
          className="block w-full rounded-full bg-blue-500 p-3 text-center text-xl font-medium text-white hover:bg-blue-600"
        >
          남성
        </Link>
        <Link
          href="/demo/match?my-gender=female"
          className="block w-full rounded-full bg-pink-500 p-3 text-center text-xl font-medium text-white hover:bg-pink-600"
        >
          여성
        </Link>
      </div>
    </div>
  );
}

DemoEntryPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="매칭 체험">{page}</Layout>;
};

DemoEntryPage.auth = false;
