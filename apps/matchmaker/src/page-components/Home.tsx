import { Suspense, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { HOMEPAGE_URL, MATCHMAKER_URL } from "@ieum/constants";
import { MemberStatus } from "@ieum/prisma";
import { assert } from "@ieum/utils";

import { FeedbackButton } from "~/components/FeedbackButton";
import { Loader } from "~/components/Loader";
import { MemberAuth } from "~/components/MemberAuth";
import { Spacing } from "~/components/Spacing";
import { TipsMenuLink } from "~/components/TipsMenuLink";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";
import { formatUniqueMemberName } from "~/utils/formatUniqueMemberName";

export function Home() {
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
        <div className="flex h-3/5 w-full justify-center p-8 md:mt-0 md:h-full md:w-1/3 md:items-center">
          <div className="flex w-full max-w-md flex-col items-center gap-4">
            <h1 className="mt-4 text-3xl font-semibold text-primary-700 md:text-4xl">
              이음
            </h1>
            <Suspense fallback={<Loader />}>
              <Resolved />
            </Suspense>
          </div>
        </div>
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
  const { registered } = useMemberAuthContext();

  return registered ? <Registered /> : <Unregistered />;
}

function Registered() {
  const { member, signOut } = useMemberAuthContext();

  assert(member != null, "member should be defined");

  const [status] = api.basicMemberRouter.getStatus.useSuspenseQuery({
    memberId: member.id,
  });
  const { sendMessage } = useSlackNotibot();
  const router = useRouter();

  useEffect(() => {
    void sendMessage({
      content: `${formatUniqueMemberName(member)} - 홈 진입\n${
        navigator.userAgent
      }`,
    });
  }, [member]);

  useEffect(() => {
    if (status === MemberStatus.INACTIVE) {
      router.push("/settings");
    }
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-2.5 pb-10 md:gap-3">
      <Link
        href="/referral"
        className="w-full rounded-lg border border-primary-500 p-2 text-center font-medium text-primary-700 hover:border-primary-700 hover:text-primary-700 md:p-2.5 md:text-lg"
        onClick={() => {
          void sendMessage({
            content: `${formatUniqueMemberName(
              member,
            )} - 10,000원 캐시백 받기 클릭`,
          });
        }}
      >
        1만 원 캐시백 받기
      </Link>
      <Link
        href="/my-matches"
        className="w-full rounded-lg border border-primary-500 bg-primary-500 p-2 text-center font-medium text-white hover:border-primary-700 hover:bg-primary-700 md:p-2.5 md:text-lg"
        onClick={() => {
          void sendMessage({
            content: `${formatUniqueMemberName(member)} - 매칭 목록 보기 클릭`,
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
            content: `${formatUniqueMemberName(member)} - 내 프로필 보기 클릭`,
          });
        }}
      >
        내 프로필 보기
      </Link>
      <Link
        href="/my-ideal-type"
        className="w-full rounded-lg border border-gray-600 p-2 text-center font-medium text-gray-600 hover:border-gray-800 hover:text-gray-800 md:p-2.5 md:text-lg"
        onClick={() => {
          void sendMessage({
            content: `${formatUniqueMemberName(member)} - 내 이상형 조건 클릭`,
          });
        }}
      >
        내 이상형 조건
      </Link>
      <Link
        href="/settings"
        className="w-full rounded-lg border border-gray-600 p-2 text-center font-medium text-gray-600 hover:border-gray-800 hover:text-gray-800 md:p-2.5 md:text-lg"
        onClick={() => {
          void sendMessage({
            content: `${formatUniqueMemberName(member)} - 설정 클릭`,
          });
        }}
      >
        설정
      </Link>
      <TipsMenuLink style={{ marginTop: "4px" }} />
      <button
        className="text-sm font-light text-gray-500 underline hover:text-gray-700"
        onClick={() => {
          void sendMessage({
            content: `${formatUniqueMemberName(member)} - 로그아웃 클릭`,
          });
          void signOut();
        }}
      >
        로그아웃
      </button>
      <FeedbackButton />
    </div>
  );
}

function Unregistered() {
  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    void sendMessage({ content: `미가입자 - 홈 진입` });
  }, [sendMessage]);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <Link
        href={HOMEPAGE_URL}
        className="w-full rounded-lg bg-primary-500 p-3 text-center text-xl font-medium text-white hover:bg-primary-700"
      >
        알아보기
      </Link>
      <TipsMenuLink />
    </div>
  );
}
