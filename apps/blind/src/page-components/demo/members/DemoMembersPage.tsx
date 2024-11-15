import { ReactElement, Suspense } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Gender } from "@ieum/prisma";
import { match } from "ts-pattern";

import { GenderTabs } from "~/components/GenderTabs";
import { Layout } from "~/components/Layout";
import { Loader } from "~/components/Loader";
import { MembersTable } from "~/components/MembersTable";
import { api } from "~/utils/api";

export function DemoMembersPage() {
  const router = useRouter();
  const myGender = (router.query["my-gender"] as Gender) ?? Gender.MALE;
  const 이성 = match(myGender)
    .with(Gender.MALE, () => Gender.FEMALE)
    .with(Gender.FEMALE, () => Gender.MALE)
    .exhaustive();
  const genderQuery = (router.query["target-gender"] as Gender) ?? 이성;

  return (
    <>
      <Head>
        <meta name="description" content="직접 찾는 내 인연, 이음" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="이음" />
        <meta property="og:description" content="직접 찾는 내 인연, 이음" />
        <meta property="og:locale" content="ko_KR" />
        <meta
          property="keywords"
          content="소개팅,소개팅앱,소개팅어플,소개팅사이트,카톡소개팅,이음블라인드,소개팅서비스,직장인소개팅,셀프소개팅,셀소,블라인드소개팅"
        />
      </Head>
      <div className="mb-10 flex flex-col gap-6">
        <div className="flex w-full items-start gap-1">
          <p className="text-sm text-gray-700">※</p>
          <p className="text-sm text-gray-700">
            이음 체험용 페이지입니다.{" "}
            <Link
              href="/"
              className="text-blind-500 underline hover:text-blind-700"
            >
              회원가입
            </Link>
          </p>
        </div>
        <div className="flex w-full justify-center">
          <GenderTabs
            value={genderQuery}
            onChange={(newGender) => {
              router.replace({
                query: {
                  ...router.query,
                  "target-gender": newGender,
                },
              });
            }}
          />
        </div>
        <Suspense
          fallback={
            <div className="mt-10 flex items-center justify-center">
              <Loader />
            </div>
          }
        >
          <DemoMembersTableResolved
            myGender={myGender}
            targetGender={genderQuery}
          />
        </Suspense>
        <Link href="/" className="text-center text-gray-700">
          <span className="text-blind-500 underline hover:text-blind-700">
            회원가입
          </span>
          하고 인연을 만나세요.
        </Link>
      </div>
    </>
  );
}

function DemoMembersTableResolved({
  myGender,
  targetGender,
}: {
  myGender: Gender;
  targetGender: Gender;
}) {
  const [members] = api.blindMemberRouter.getDemoMembers.useSuspenseQuery({
    gender: targetGender,
  });

  return (
    <MembersTable
      selfGender={myGender}
      members={members}
      isFetching={false}
      hasNextPage={true}
      isFetchingNextPage={false}
      onFetchNextPage={() => {
        alert("회원가입하고 더 많은 회원을 만나보세요.");
      }}
      onRowClick={(rowMember) => {
        if (rowMember.gender === myGender) {
          alert("동성 회원의 프로필은 조회할 수 없습니다.");

          return;
        }

        alert("회원가입하고 상대방의 프로필을 확인해보세요.");
      }}
    />
  );
}

DemoMembersPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout title="회원 목록" width="lg" bottomNav={true}>
      {page}
    </Layout>
  );
};

DemoMembersPage.auth = false;
