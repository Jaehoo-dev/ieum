import { ComponentPropsWithoutRef, ReactElement, useEffect } from "react";
import { useRouter } from "next/router";
import { Gender } from "@ieum/prisma";
import { assert } from "@ieum/utils";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import { Layout } from "~/components/Layout";
import { Loader } from "~/components/Loader";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";

export function MembersPage() {
  const router = useRouter();
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const gender = router.query.gender as Gender | undefined;

  useEffect(() => {
    if (router.query.gender == null) {
      router.replace({
        query: {
          ...router.query,
          gender: member.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE,
        },
      });
    }
  }, [router.query.gender]);

  if (gender == null) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <GenderTabs
        value={gender}
        onChange={(value) => {
          router.replace({
            query: {
              ...router.query,
              gender: value,
            },
          });
        }}
      />
      <Members gender={gender} />
    </div>
  );
}

function Members({ gender }: { gender: Gender }) {
  const {
    data,
    isPending,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetching,
  } = api.blindMemberRouter.getInfiniteMembers.useInfiniteQuery(
    {
      gender,
      take: 20,
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor;
      },
    },
  );

  if (isPending || data == null) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-2 overflow-x-auto">
      <div className="w-[740px]">
        <div className="sticky top-0 z-10 grid grid-cols-[1.5fr_1fr_2fr_1fr_2fr_2fr] gap-2 border-b bg-white p-2">
          <div className="font-medium text-gray-900">닉네임</div>
          <div className="font-medium text-gray-900">출생연도</div>
          <div className="font-medium text-gray-900">거주지</div>
          <div className="font-medium text-gray-900">키</div>
          <div className="font-medium text-gray-900">체형</div>
          <div className="font-medium text-gray-900">직업</div>
        </div>
        <div className="max-h-[calc(100vh-220px)] divide-y overflow-y-auto">
          {data.pages
            .flatMap((page) => {
              return page.members;
            })
            .map((member, index) => (
              <div
                key={member.id + index}
                className={`grid cursor-pointer grid-cols-[1.5fr_1fr_2fr_1fr_2fr_2fr] gap-2 p-2 text-gray-700 hover:bg-blind-100 ${
                  index % 2 === 0 ? "bg-blind-100 bg-opacity-50" : ""
                }`}
              >
                <div className="truncate">{member.nickname}</div>
                <div className="truncate">{member.birthYear}</div>
                <div className="truncate">{member.residence}</div>
                <div className="truncate">{member.height}</div>
                <div className="truncate">{member.bodyShape}</div>
                <div className="truncate">{member.job}</div>
              </div>
            ))}
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

function GenderTabs({
  value,
  onChange,
}: {
  value: Gender;
  onChange: (value: Gender) => void;
}) {
  return (
    <ToggleButtonGroup
      color="primary"
      value={value}
      exclusive={true}
      fullWidth={true}
      size="small"
      onChange={(_, value) => {
        if (value == null) {
          return;
        }

        onChange(value);
      }}
    >
      <ToggleButton value={Gender.MALE} disableRipple={true}>
        <span className="text-sm">남성</span>
      </ToggleButton>
      <ToggleButton value={Gender.FEMALE} disableRipple={true}>
        <span className="text-sm">여성</span>
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

MembersPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="회원 목록">{page}</Layout>;
};
