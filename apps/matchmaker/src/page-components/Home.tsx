import { Suspense, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";

import { MemberAuth } from "~/components/MemberAuth";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import heartImgSrc from "../../public/heart.webp";

export function Home() {
  const { loggedIn } = useMemberAuthContext();
  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    void sendMessage(
      `홈 진입\n${navigator.userAgent}\nreferrer: ${document.referrer}`,
    );
  }, [sendMessage]);

  return (
    <>
      <Head>
        <title>내편소</title>
        <meta name="description" content="나랑 딱 맞는 이상형 찾기, 내편소" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="내편소" />
        <meta
          property="og:image"
          content={`${process.env.NEXT_PUBLIC_DOMAIN_HOSTNAME}/heart.webp`}
        />
        <meta
          property="og:description"
          content="내가 찾던 이상형을 만나는 곳, 내편소"
        />
        <meta property="og:locale" content="ko_KR" />
      </Head>
      <div className="flex h-screen w-screen flex-col md:flex-row">
        <div className="relative h-2/5 w-full md:h-full md:w-2/3">
          <Image
            src={heartImgSrc}
            alt="이미지"
            className="h-full w-full object-cover object-center"
          />
        </div>
        <div className="mt-12 flex h-3/5 w-full justify-center p-8 md:mt-0 md:h-full md:w-1/3 md:items-center">
          <div className="flex w-full max-w-md flex-col items-center">
            <h1 className="text-4xl font-semibold text-primary-500 md:text-5xl">
              내편소
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
      <button
        className="text-lg font-light text-gray-500 underline hover:text-gray-700"
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
  return (
    <div className="mt-3 flex w-full flex-col items-center gap-4">
      <a
        className="w-full rounded-lg bg-primary-500 p-3 text-center text-xl font-medium text-white hover:bg-primary-700"
        href="https://frip.co.kr/products/176056"
      >
        가입하러 가기
      </a>
    </div>
  );
}
