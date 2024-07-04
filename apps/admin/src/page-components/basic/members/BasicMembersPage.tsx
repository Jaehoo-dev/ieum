import { Suspense, type ReactElement } from "react";
import { useRouter } from "next/router";
import { Gender, MemberStatus } from "@ieum/prisma";

import { BasicMemberCard } from "~/components/BasicMemberCard";
import { Layout } from "~/components/Layout";
import { Select } from "~/components/Select";
import { api } from "~/utils/api";

const 정렬 = {
  생성_최신순: "desc",
  생성_오래된_순: "asc",
  제안_오래된_순: "lastMatchedAt",
} as const;

type 정렬 = (typeof 정렬)[keyof typeof 정렬];

export function BasicMembersPage() {
  const router = useRouter();
  const statusQuery = (router.query.status ??
    MemberStatus.ACTIVE) as MemberStatus;
  const sortQuery = (router.query.sort ?? 정렬.생성_최신순) as 정렬;

  return (
    <div className="mt-6 flex min-h-screen flex-col items-center gap-6 py-2">
      <h1 className="text-4xl font-semibold">베이직 회원 목록</h1>
      <Filter
        onStatusChange={(status) => {
          router.replace({
            query: {
              ...router.query,
              status,
            },
          });
        }}
        onSortChange={(sort) => {
          router.replace({
            query: {
              ...router.query,
              sort,
            },
          });
        }}
      />
      <Suspense>
        <Resolved status={statusQuery} sort={sortQuery} />
      </Suspense>
    </div>
  );
}

function Filter({
  onStatusChange,
  onSortChange,
}: {
  onStatusChange: (status: MemberStatus) => void;
  onSortChange: (sort: 정렬) => void;
}) {
  const router = useRouter();
  const statusQuery = (router.query.status ??
    MemberStatus.ACTIVE) as MemberStatus;
  const sortQuery = (router.query.sort ?? 정렬.생성_최신순) as 정렬;

  return (
    <div className="flex flex-row justify-center gap-2">
      <Select
        label="회원 상태"
        value={statusQuery}
        onChange={({ target: { value } }) => {
          onStatusChange(value as MemberStatus);
        }}
        style={{ width: "120px" }}
      >
        <option value={MemberStatus.ACTIVE}>활동중</option>
        <option value={MemberStatus.INACTIVE}>휴면</option>
      </Select>
      <Select
        label="정렬"
        value={sortQuery}
        onChange={({ target: { value } }) => {
          onSortChange(value as 정렬);
        }}
        style={{ width: "140px" }}
      >
        <option value={정렬.생성_최신순}>생성 최신순</option>
        <option value={정렬.생성_오래된_순}>생성 오래된 순</option>
        <option value={정렬.제안_오래된_순}>제안 오래된 순</option>
      </Select>
    </div>
  );
}

function Resolved({ status, sort }: { status: MemberStatus; sort: 정렬 }) {
  const [
    { pages: maleMemberPages },
    {
      isFetchingNextPage: isFetchingNextMalePage,
      hasNextPage: hasNextMalePage,
      fetchNextPage: fetchNextMalePage,
    },
  ] = api.basicMemberRouter.infiniteFindByGender.useSuspenseInfiniteQuery(
    {
      gender: Gender.MALE,
      status,
      sort,
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor;
      },
    },
  );
  const [
    { pages: femaleMemberPages },
    {
      isFetchingNextPage: isFetchingNextFemalePage,
      hasNextPage: hasNextFemalePage,
      fetchNextPage: fetchNextFemalePage,
    },
  ] = api.basicMemberRouter.infiniteFindByGender.useSuspenseInfiniteQuery(
    {
      gender: Gender.FEMALE,
      status,
      sort,
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor;
      },
    },
  );
  const maleMembers = maleMemberPages.flatMap(({ members }) => members);
  const femaleMembers = femaleMemberPages.flatMap(({ members }) => members);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex w-full justify-center gap-6">
        <div className="flex w-5/12 flex-col items-center gap-4">
          <h1 className="text-2xl font-semibold">남성</h1>
          {maleMembers.map((member) => {
            return <BasicMemberCard key={member.id} member={member} />;
          })}
          {isFetchingNextMalePage ? (
            "..."
          ) : hasNextMalePage ? (
            <button
              className="rounded-md bg-blue-500 px-4 py-2 text-white"
              onClick={() => fetchNextMalePage()}
            >
              더보기
            </button>
          ) : (
            <p className="text-lg text-gray-800">끝</p>
          )}
        </div>
        <div className="flex w-5/12 flex-col items-center gap-4">
          <h1 className="text-2xl font-semibold">여성</h1>
          {femaleMembers.map((member) => {
            return <BasicMemberCard key={member.id} member={member} />;
          })}
          {isFetchingNextFemalePage ? (
            "..."
          ) : hasNextFemalePage ? (
            <button
              className="rounded-md bg-blue-500 px-4 py-2 text-white"
              onClick={() => fetchNextFemalePage()}
            >
              더보기
            </button>
          ) : (
            <p className="text-lg text-gray-800">끝</p>
          )}
        </div>
      </div>
    </div>
  );
}

BasicMembersPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
