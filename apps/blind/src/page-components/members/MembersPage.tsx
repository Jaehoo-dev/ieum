import { ReactElement } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Gender } from "@ieum/prisma";
import { assert } from "@ieum/utils";
import { match } from "ts-pattern";

import { GenderTabs } from "~/components/GenderTabs";
import { Layout } from "~/components/Layout";
import { Loader } from "~/components/Loader";
import { MembersTable } from "~/components/MembersTable";
import { StatusGuard } from "~/components/StatusGuard";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";

export function MembersPage() {
  const router = useRouter();
  const { member: self } = useMemberAuthContext();

  assert(self != null, "Component should be used within MemberAuthGuard");

  const 이성 = match(self.gender)
    .with(Gender.MALE, () => Gender.FEMALE)
    .with(Gender.FEMALE, () => Gender.MALE)
    .exhaustive();
  const genderQuery = (router.query.gender as Gender) ?? 이성;

  const {
    data,
    isPending,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetching,
  } = api.blindMemberRouter.getInfiniteCandidates.useInfiniteQuery(
    {
      selfMemberId: self.id,
      gender: genderQuery,
      take: 15,
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor;
      },
    },
  );

  return (
    <>
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      <StatusGuard>
        <div className="mb-10 flex flex-col gap-6">
          <div className="flex w-full justify-center">
            <GenderTabs
              value={genderQuery}
              onChange={(newGender) => {
                router.replace({
                  query: {
                    ...router.query,
                    gender: newGender,
                  },
                });
              }}
            />
          </div>
          {isPending || data == null ? (
            <div className="mt-10 flex items-center justify-center">
              <Loader />
            </div>
          ) : (
            <MembersTable
              selfGender={self.gender}
              members={data.pages.flatMap((page) => {
                return page.members;
              })}
              isFetching={isFetching}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onFetchNextPage={fetchNextPage}
              onRowClick={(rowMember) => {
                if (self.gender === rowMember.gender) {
                  alert("동성 회원의 프로필은 조회할 수 없습니다.");

                  return;
                }

                router.push(`/members/${rowMember.id}`);
              }}
            />
          )}
          <BasicPromotion />
        </div>
      </StatusGuard>
    </>
  );
}

function BasicPromotion() {
  return (
    <div className="text-center text-gray-700">
      <p>
        더 꼼꼼한 조건으로
        <br />
        이상형을 소개받고 싶다면?
      </p>
      <Link
        href="/basic"
        className="text-primary-500 underline hover:text-primary-700"
      >
        이음 베이직 알아보기
      </Link>
    </div>
  );
}

MembersPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout title="회원 목록" width="lg" bottomNav={true}>
      {page}
    </Layout>
  );
};
