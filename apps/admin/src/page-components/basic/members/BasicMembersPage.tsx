import type { ReactElement } from "react";
import { Gender } from "@ieum/prisma";

import { BasicMemberCard } from "~/components/BasicMemberCard";
import { Layout } from "~/components/Layout";
import { api } from "~/utils/api";

export function BasicMembersPage() {
  const {
    data: maleMemberPages,
    isFetchingNextPage: isFetchingNextMalePage,
    hasNextPage: hasNextMalePage,
    fetchNextPage: fetchNextMalePage,
  } = api.basicMemberRouter.infiniteFindByGender.useInfiniteQuery(
    { gender: Gender.MALE },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor;
      },
    },
  );
  const {
    data: femaleMemberPages,
    isFetchingNextPage: isFetchingNextFemalePage,
    hasNextPage: hasNextFemalePage,
    fetchNextPage: fetchNextFemalePage,
  } = api.basicMemberRouter.infiniteFindByGender.useInfiniteQuery(
    { gender: Gender.FEMALE },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor;
      },
    },
  );

  return (
    <div className="mt-6 flex min-h-screen flex-col items-center gap-6 py-2">
      <h1 className="text-4xl font-semibold">베이직 회원 목록</h1>
      <div
        className="flex w-full justify-center gap-10"
        style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
      >
        <div className="flex w-5/12 flex-col items-center gap-4">
          <h1 className="text-2xl font-semibold">남성</h1>
          {maleMemberPages?.pages.map(({ members }) => {
            return members.map((member) => {
              return <BasicMemberCard key={member.id} member={member} />;
            });
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
          {femaleMemberPages?.pages.map(({ members }) => {
            return members.map((member) => {
              return <BasicMemberCard key={member.id} member={member} />;
            });
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
