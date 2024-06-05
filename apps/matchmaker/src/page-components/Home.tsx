import { Suspense, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { HOMEPAGE_URL, MATCHMAKER_URL } from "@ieum/constants";

import { HomepageTipsTabLink } from "~/components/HomepageTipsTabLink";
import { MemberAuth } from "~/components/MemberAuth";
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
        <meta
          name="google-site-verification"
          content="HRlaMCw3qEkNsohFD2phsygDAqpqyd86sig2CoDlXCY"
        />
      </Head>
      <div className="flex h-screen w-screen flex-col md:flex-row">
        <div className="relative h-2/5 w-full md:h-full md:w-2/3">
          <Image
            src="/heart.webp"
            width={1920}
            height={1080}
            alt="이미지"
            className="h-full w-full object-cover object-center"
          />
        </div>
        <div className="mt-12 flex h-3/5 w-full justify-center p-8 md:mt-0 md:h-full md:w-1/3 md:items-center">
          <div className="flex w-full max-w-md flex-col items-center">
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
      <button
        className="w-full rounded-lg bg-gray-400 p-3 text-xl font-medium text-white hover:bg-gray-500"
        onClick={() => {
          void sendMessage(`${member?.name} - 내 프로필 보기 클릭`);
          void router.push("/my-profile");
        }}
      >
        내 프로필 보기
      </button>
      <button
        className="w-full rounded-lg bg-primary-500 p-3 text-xl font-medium text-white hover:bg-primary-700"
        onClick={() => {
          void sendMessage(`${member?.name} - 매칭 목록 보기 클릭`);
          void router.push("/my-matches");
        }}
      >
        매칭 목록 보기
      </button>
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
