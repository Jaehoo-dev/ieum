import { Suspense, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { HOMEPAGE_URL, MATCHMAKER_URL } from "@ieum/constants";

import { EventBanner } from "~/components/EventBanner";
import { HomepageTipsTabLink } from "~/components/HomepageTipsTabLink";
import { MemberAuth } from "~/components/MemberAuth";
import { Spacing } from "~/components/Spacing";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";

export function Home() {
  const { loggedIn } = useMemberAuthContext();

  return (
    <>
      <Head>
        <title>이음</title>
        <meta name="description" content="나만을 위한 맞춤 소개, 이음" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="이음" />
        <meta property="og:image" content={`${MATCHMAKER_URL}/heart.webp`} />
        <meta property="og:description" content="나만을 위한 맞춤 소개, 이음" />
        <meta property="og:locale" content="ko_KR" />
        <meta property="og:url" content={MATCHMAKER_URL} />
        <meta
          property="keywords"
          content="소개팅,소개팅앱,소개팅어플,소개팅사이트,카톡소개팅,이음,소개팅서비스,직장인소개팅"
        />
        <meta
          name="google-site-verification"
          content="HRlaMCw3qEkNsohFD2phsygDAqpqyd86sig2CoDlXCY"
        />
      </Head>
      <div className="flex h-screen w-screen flex-col md:flex-row">
        <div className="relative h-2/5 w-full md:h-full md:w-2/3">
          <img
            src="/heart.webp"
            width={1920}
            height={1080}
            alt="이미지"
            className="h-full w-full object-cover object-center"
          />
        </div>
        <div className="mt-6 flex h-3/5 w-full justify-center p-8 md:mt-0 md:h-full md:w-1/3 md:items-center">
          <div className="flex w-full max-w-md flex-col items-center">
            <EventBanner />
            <Spacing size={24} />
            <h1 className="mb-2 text-4xl font-semibold text-primary-500 md:text-5xl">
              이음
            </h1>
            {loggedIn ? (
              <Suspense fallback={null}>
                <LoggedIn />
              </Suspense>
            ) : (
              <MemberAuth />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

Home.auth = false;

function LoggedIn() {
  const { registered } = useMemberAuthContext();

  return registered ? <Registered /> : <Unregistered />;
}

function Registered() {
  const router = useRouter();
  const { member, signOut } = useMemberAuthContext();
  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    void sendMessage(`${member?.name} - 홈 진입`);
  }, [member?.name, sendMessage]);

  return (
    <div className="mt-3 flex w-full flex-col items-center gap-4">
      <Link
        href="/my-matches"
        className="w-full rounded-lg border border-primary-500 bg-primary-500 p-3 text-center text-xl font-medium text-white hover:border-primary-700 hover:bg-primary-700"
        onClick={() => {
          void sendMessage(`${member?.name} - 매칭 목록 보기 클릭`);
        }}
      >
        매칭 목록 보기
      </Link>
      <Link
        href="/my-profile"
        className="w-full rounded-lg border border-gray-600 p-3 text-center text-xl font-medium text-gray-600 hover:border-gray-800 hover:text-gray-800"
        onClick={() => {
          void sendMessage(`${member?.name} - 내 프로필 보기 클릭`);
        }}
      >
        내 프로필 보기
      </Link>
      <Link
        href="/my-ideal-type"
        className="w-full rounded-lg border border-gray-600 p-3 text-center text-xl font-medium text-gray-600 hover:border-gray-800 hover:text-gray-800"
        onClick={() => {
          void sendMessage(`${member?.name} - 내 이상형 조건 클릭`);
        }}
      >
        내 이상형 조건 (베타)
      </Link>
      <HomepageTipsTabLink rel="noopener" />
      <button
        className="font-light text-gray-500 underline hover:text-gray-700"
        onClick={() => {
          void sendMessage(`${member?.name} - 로그아웃 클릭`);
          void signOut();
        }}
      >
        로그아웃
      </button>
    </div>
  );
}

function Unregistered() {
  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    void sendMessage(`미가입자 - 홈 진입`);
  }, [sendMessage]);

  return (
    <div className="mt-3 flex w-full flex-col items-center gap-4">
      <Link
        href={HOMEPAGE_URL}
        className="w-full rounded-lg bg-primary-500 p-3 text-center text-xl font-medium text-white hover:bg-primary-700"
      >
        알아보기
      </Link>
      <HomepageTipsTabLink rel="noopener" />
    </div>
  );
}
