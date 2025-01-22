import { useEffect } from "react";
import Head from "next/head";
import { MATCHMAKER_URL } from "@ieum/constants";

import { KakaotalkChatButton } from "~/components/KakaotalkChatButton";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";

export function Home() {
  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    sendMessage({
      content: "이음 블라인드 홈 진입",
    });
  }, [sendMessage]);

  return (
    <>
      <Head>
        <title>이음</title>
        <meta name="description" content="직접 찾는 내 인연, 이음" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="이음" />
        <meta property="og:image" content={`${MATCHMAKER_URL}/heart.webp`} />
        <meta property="og:description" content="직접 찾는 내 인연, 이음" />
        <meta property="og:locale" content="ko_KR" />
        <meta property="og:url" content={MATCHMAKER_URL} />
        <meta
          property="keywords"
          content="소개팅,소개팅앱,소개팅어플,소개팅사이트,카톡소개팅,이음블라인드,소개팅서비스,직장인소개팅"
        />
      </Head>
      <div className="flex h-screen w-screen flex-col md:flex-row">
        <div className="relative h-2/5 w-full md:h-full md:w-2/3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/heart.webp"
            width={1920}
            height={1080}
            alt="이미지"
            className="h-full w-full object-cover object-center"
          />
        </div>
        <div className="mt-4 flex h-3/5 w-full justify-center p-8 md:mt-10 md:h-full md:w-1/3 md:items-center">
          <div className="flex w-full max-w-md flex-col items-center gap-4">
            <h1 className="text-3xl font-semibold text-blind-500 md:text-4xl">
              이음
            </h1>
            <p className="text-center text-lg text-gray-700">
              그동안 이용해주셔서 감사합니다.
              <br />
              좋은 인연 만나시길 바라겠습니다.
            </p>
          </div>
        </div>
        <KakaotalkChatButton />
      </div>
    </>
  );
}

Home.auth = false;
