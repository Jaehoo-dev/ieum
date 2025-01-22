import { Suspense } from "react";
import type { ReactElement } from "react";
import { useRouter } from "next/router";
import { 매치_유형, 지역_쿼리 } from "@ieum/constants";
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
  const regionQuery = (router.query.region ?? 지역_쿼리.전체) as 지역_쿼리;
  const statusQuery = (router.query.status ??
    MemberStatus.ACTIVE) as MemberStatus;
  const sortQuery = (router.query.sort ?? 정렬.생성_최신순) as 정렬;
  const matchTypeQuery = (router.query.matchType ??
    매치_유형.기본) as 매치_유형;

  return (
    <div className="flex min-h-screen flex-col items-center gap-4 py-2">
      <h1 className="text-2xl font-semibold">베이직 회원 목록</h1>
      <Filter
        onRegionChange={(region) => {
          router.replace({
            query: {
              ...router.query,
              region,
            },
          });
        }}
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
        onMatchTypeChange={(matchType) => {
          router.replace({
            query: {
              ...router.query,
              matchType,
            },
          });
        }}
      />
      <Suspense>
        <Resolved
          region={regionQuery}
          status={statusQuery}
          sort={sortQuery}
          matchType={matchTypeQuery}
        />
      </Suspense>
    </div>
  );
}

function Filter({
  onRegionChange,
  onStatusChange,
  onSortChange,
  onMatchTypeChange,
}: {
  onRegionChange: (region: 지역_쿼리) => void;
  onStatusChange: (status: MemberStatus) => void;
  onSortChange: (sort: 정렬) => void;
  onMatchTypeChange: (matchType: 매치_유형) => void;
}) {
  const router = useRouter();
  const regionQuery = (router.query.region ?? 지역_쿼리.전체) as 지역_쿼리;
  const statusQuery = (router.query.status ??
    MemberStatus.ACTIVE) as MemberStatus;
  const sortQuery = (router.query.sort ?? 정렬.생성_최신순) as 정렬;
  const matchTypeQuery = (router.query.matchType ??
    매치_유형.기본) as 매치_유형;

  return (
    <div className="flex flex-row justify-center gap-2">
      <Select
        label="지역"
        value={regionQuery}
        onChange={({ target: { value } }) => {
          onRegionChange(value as 지역_쿼리);
        }}
        style={{ width: "100px" }}
      >
        <option value={지역_쿼리.수도권}>수도권</option>
        <option value={지역_쿼리.충청}>충청</option>
        <option value={지역_쿼리.전체}>전체</option>
      </Select>
      <Select
        label="회원 상태"
        value={statusQuery}
        onChange={({ target: { value } }) => {
          onStatusChange(value as MemberStatus);
        }}
        style={{ width: "100px" }}
      >
        <option value={MemberStatus.PENDING}>심사중</option>
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
      <Select
        label="매치 유형"
        value={matchTypeQuery}
        onChange={({ target: { value } }) => {
          onMatchTypeChange(value as 매치_유형);
        }}
        style={{ width: "100px" }}
      >
        <option value={매치_유형.기본}>기본</option>
        <option value={매치_유형.확성기}>확성기</option>
      </Select>
    </div>
  );
}

function Resolved({
  region,
  status,
  sort,
  matchType,
}: {
  region: 지역_쿼리;
  status: MemberStatus;
  sort: 정렬;
  matchType: 매치_유형;
}) {
  const [
    { pages: maleMemberPages },
    {
      isFetchingNextPage: isFetchingNextMalePage,
      hasNextPage: hasNextMalePage,
      fetchNextPage: fetchNextMalePage,
    },
  ] = api.basicMemberRouter.infiniteFindByGender.useSuspenseInfiniteQuery(
    {
      region,
      gender: Gender.MALE,
      status,
      sort,
      matchType,
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
      region,
      gender: Gender.FEMALE,
      status,
      sort,
      matchType,
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
    <div className="flex w-full justify-center gap-2">
      <div className="flex flex-col items-center gap-2">
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
      <div className="flex flex-col items-center gap-2">
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
  );
}

BasicMembersPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
