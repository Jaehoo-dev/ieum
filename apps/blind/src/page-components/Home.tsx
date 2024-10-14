import { Suspense, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { MATCHMAKER_URL } from "@ieum/constants";
import { assert } from "@ieum/utils";

import { KakaotalkChatButton } from "~/components/KakaotalkChatButton";
import { Loader } from "~/components/Loader";
import { MemberAuth } from "~/components/MemberAuth";
import { Spacing } from "~/components/Spacing";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";

export function Home() {
  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    sendMessage({
      content: "이음 블라인드 홈 진입",
    });
  }, []);

  return (
    <>
      <Head>
        <title>이음 블라인드</title>
        <meta name="description" content="직접 찾는 내 인연, 이음 블라인드" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="이음 블라인드" />
        <meta property="og:image" content={`${MATCHMAKER_URL}/heart.webp`} />
        <meta
          property="og:description"
          content="직접 찾는 내 인연, 이음 블라인드"
        />
        <meta property="og:locale" content="ko_KR" />
        <meta property="og:url" content={MATCHMAKER_URL} />
        <meta
          property="keywords"
          content="소개팅,소개팅앱,소개팅어플,소개팅사이트,카톡소개팅,이음블라인드,소개팅서비스,직장인소개팅"
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
        <div className="flex h-3/5 w-full justify-center p-8 md:mt-0 md:h-full md:w-1/3 md:items-center">
          <div className="flex w-full max-w-md flex-col items-center gap-4">
            <h1 className="mt-4 text-3xl font-semibold text-blind-500 md:text-4xl">
              이음 블라인드 🚧
            </h1>
            <Suspense fallback={<Loader />}>
              <Resolved />
            </Suspense>
          </div>
        </div>
        <KakaotalkChatButton />
      </div>
    </>
  );
}

Home.auth = false;

function Resolved() {
  const { loading, loggedIn } = useMemberAuthContext();

  return loading ? (
    <Loading />
  ) : loggedIn ? (
    <Suspense fallback={<Loader />}>
      <LoggedIn />
    </Suspense>
  ) : (
    <MemberAuth />
  );
}

function Loading() {
  return (
    <div className="flex w-full flex-col items-center justify-center">
      <Loader />
      <Spacing size={354} />
    </div>
  );
}

function LoggedIn() {
  const router = useRouter();
  const { registered } = useMemberAuthContext();

  useEffect(() => {
    if (!registered) {
      router.push("/register");
    }
  }, [registered, router]);

  return registered ? <Registered /> : null;
}

function Registered() {
  const { member, signOut } = useMemberAuthContext();

  assert(member != null, "member should be defined");
  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    void sendMessage({
      content: `${member.id} - 홈 진입\n${navigator.userAgent}`,
    });
  }, [member]);

  return (
    <div className="flex w-full flex-col items-center gap-2.5 pb-20 md:gap-3">
      <Link
        href="/basic"
        className="w-full rounded-lg border border-primary-500 bg-primary-500 p-2 text-center font-medium text-white hover:border-primary-700 hover:bg-primary-700 md:p-2.5 md:text-lg"
      >
        이음 베이직 알아보기
      </Link>
      <Link
        href="/members"
        className="w-full rounded-lg border border-blind-500 bg-blind-500 p-2 text-center font-medium text-white hover:border-blind-700 hover:bg-blind-700 md:p-2.5 md:text-lg"
        onClick={() => {
          void sendMessage({
            content: `${member.id} - 회원 목록 보기 클릭`,
          });
        }}
      >
        회원 목록 보기
      </Link>
      <Link
        href="/matches"
        className="w-full rounded-lg border border-blind-500 p-2 text-center font-medium text-blind-500 hover:border-blind-600 hover:text-blind-600 md:p-2.5 md:text-lg"
        onClick={() => {
          void sendMessage({
            content: `${member.id} - 회원 목록 보기 클릭`,
          });
        }}
      >
        매칭 목록 보기
      </Link>
      <Link
        href="/my-profile"
        className="w-full rounded-lg border border-gray-600 p-2 text-center font-medium text-gray-600 hover:border-gray-800 hover:text-gray-800 md:p-2.5 md:text-lg"
        onClick={() => {
          void sendMessage({
            content: `${member.id} - 내 프로필 보기 클릭`,
          });
        }}
      >
        내 프로필 보기
      </Link>
      <Link
        href="/settings"
        className="w-full rounded-lg border border-gray-600 p-2 text-center font-medium text-gray-600 hover:border-gray-800 hover:text-gray-800 md:p-2.5 md:text-lg"
        onClick={() => {
          void sendMessage({
            content: `${member.id} - 설정 클릭`,
          });
        }}
      >
        설정
      </Link>
      <button
        className="mt-1 text-sm font-light text-gray-500 underline hover:text-gray-700"
        onClick={() => {
          void sendMessage({
            content: `${member.id} - 로그아웃 클릭`,
          });
          void signOut();
        }}
      >
        로그아웃
      </button>
    </div>
  );
}
