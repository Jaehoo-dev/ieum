import { ComponentPropsWithoutRef, Fragment, ReactElement } from "react";
import { useRouter } from "next/router";
import { 지역_라벨 } from "@ieum/constants";
import { assert } from "@ieum/utils";

// import { ResponsiveDisplayAd } from "~/components/adsense/ResponsiveDisplayAd";
import { Layout } from "~/components/Layout";
import { Loader } from "~/components/Loader";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";

export function MembersPage() {
  return (
    <div className="flex flex-col gap-6">
      <MembersTable />
      {/* <ResponsiveDisplayAd /> */}
    </div>
  );
}

function MembersTable() {
  const router = useRouter();
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const {
    data,
    isPending,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetching,
  } = api.blindMemberRouter.getInfiniteCandidates.useInfiniteQuery(
    {
      selfMemberId: member.id,
      take: 20,
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor;
      },
    },
  );

  if (isPending || data == null) {
    return (
      <div className="mt-10 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  const members = data.pages.flatMap((page) => {
    return page.members;
  });

  return (
    <div className="flex flex-col gap-2 overflow-x-auto">
      <div className="w-[740px]">
        <div className="grid grid-cols-[1fr_0.8fr_0.8fr_0.6fr_1fr_2fr] gap-2 border-b border-b-gray-300 bg-white p-2">
          <div className="font-medium text-gray-800">닉네임</div>
          <div className="font-medium text-gray-800">지역</div>
          <div className="font-medium text-gray-800">출생연도</div>
          <div className="font-medium text-gray-800">키</div>
          <div className="font-medium text-gray-800">체형</div>
          <div className="font-medium text-gray-800">직업</div>
        </div>
        <div className="max-h-[calc(100vh-220px)] divide-y overflow-y-auto overflow-x-hidden">
          {members.map((member, index) => {
            return (
              <Fragment key={member.id}>
                {/* {index % 20 === 0 ? (
                <div>
                  <HorizontalInfeedAd />
                </div>
              ) : null} */}
                <div
                  className={`grid cursor-pointer grid-cols-[1fr_0.8fr_0.8fr_0.6fr_1fr_2fr] gap-2 px-2 py-5 text-gray-700 hover:bg-blind-100 ${
                    index % 2 === 0 ? "bg-blind-100 bg-opacity-50" : ""
                  }`}
                  onClick={() => {
                    router.push(`/members/${member.id}`);
                  }}
                >
                  <div className="truncate">{member.nickname}</div>
                  <div className="truncate">{지역_라벨[member.region]}</div>
                  <div className="truncate">{member.birthYear}</div>
                  <div className="truncate">{member.height}</div>
                  <div className="truncate">{member.bodyShape}</div>
                  <div className="truncate">{member.job}</div>
                </div>
              </Fragment>
            );
          })}
          <div className="col-span-6 flex p-2">
            {hasNextPage ? (
              <div className="flex w-full justify-around py-2">
                <FetchMoreButton
                  loading={isFetchingNextPage}
                  onClick={() => {
                    fetchNextPage();
                  }}
                  disabled={isFetching}
                />
                <FetchMoreButton
                  loading={isFetchingNextPage}
                  onClick={() => {
                    fetchNextPage();
                  }}
                  disabled={isFetching}
                />
              </div>
            ) : (
              <div className="flex w-full justify-around py-2">
                <span className="text-gray-600">-</span>
                <span className="text-gray-600">-</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FetchMoreButton({
  loading,
  ...props
}: ComponentPropsWithoutRef<"button"> & { loading: boolean }) {
  return (
    <button
      className="rounded-md bg-blind-500 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    >
      {loading ? <Loader size={6} color="white" /> : "더 보기"}
    </button>
  );
}

MembersPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout title="회원 목록" width="lg" bottomNav={true}>
      {page}
    </Layout>
  );
};
