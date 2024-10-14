import { ComponentPropsWithoutRef, Fragment, ReactElement } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { 성별_라벨, 지역_라벨 } from "@ieum/constants";
import { BlindMember, Gender } from "@ieum/prisma";
import { assert } from "@ieum/utils";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { match } from "ts-pattern";

// import { ResponsiveDisplayAd } from "~/components/adsense/ResponsiveDisplayAd";
import { Layout } from "~/components/Layout";
import { Loader } from "~/components/Loader";
import { StatusGuard } from "~/components/StatusGuard";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";

export function MembersPage() {
  const router = useRouter();
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const 이성 = match(member.gender)
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
      selfMemberId: member.id,
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
              members={data.pages.flatMap((page) => {
                return page.members;
              })}
              isFetching={isFetching}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onFetchNextPage={fetchNextPage}
            />
          )}
          <BasicPromotion />
          {/* <ResponsiveDisplayAd /> */}
        </div>
      </StatusGuard>
    </>
  );
}

function GenderTabs({
  value,
  onChange,
}: {
  value: Gender;
  onChange: (gender: Gender) => void;
}) {
  return (
    <div className="w-full max-w-xs">
      <ToggleButtonGroup
        value={value}
        onChange={(_, value) => {
          if (value == null) {
            return;
          }

          onChange(value);
        }}
        color="primary"
        exclusive={true}
        fullWidth={true}
        size="small"
      >
        <ToggleButton value={Gender.MALE} disableRipple={true}>
          <span className="text-sm">{성별_라벨[Gender.MALE]}</span>
        </ToggleButton>
        <ToggleButton value={Gender.FEMALE} disableRipple={true}>
          <span className="text-sm">{성별_라벨[Gender.FEMALE]}</span>
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
}

function MembersTable({
  members,
  isFetching,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage,
}: {
  members: Array<
    Pick<
      BlindMember,
      | "id"
      | "gender"
      | "nickname"
      | "region"
      | "birthYear"
      | "height"
      | "bodyShape"
      | "job"
    >
  >;
  isFetching: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
}) {
  const router = useRouter();
  const { member: self } = useMemberAuthContext();

  assert(self != null, "Component should be used within MemberAuthGuard");

  return (
    <div className="flex flex-col gap-2 overflow-x-auto border-b">
      <div className="w-[680px]">
        <div className="grid grid-cols-[1fr_0.7fr_0.8fr_0.6fr_1fr_1.6fr] gap-2 border-b border-b-gray-300 bg-white p-2 pt-0">
          <div className="font-medium text-gray-800">닉네임</div>
          <div className="font-medium text-gray-800">지역</div>
          <div className="font-medium text-gray-800">출생연도</div>
          <div className="font-medium text-gray-800">키</div>
          <div className="font-medium text-gray-800">체형</div>
          <div className="font-medium text-gray-800">직업</div>
        </div>
        <div className="max-h-[calc(100vh-252px)] divide-y overflow-y-auto overflow-x-hidden">
          {members.map((member, index) => {
            const 동성인가 = self.gender === member.gender;

            return (
              <Fragment key={member.id}>
                {/* {index % 20 === 0 ? (
                <div>
                  <HorizontalInfeedAd />
                </div>
              ) : null} */}
                <div
                  key={member.id}
                  className={`grid ${
                    동성인가 ? "" : "cursor-pointer"
                  } grid-cols-[1fr_0.7fr_0.8fr_0.6fr_1fr_1.6fr] gap-2 px-2 py-5 text-gray-700 ${
                    동성인가 ? "" : "hover:bg-blind-100"
                  } ${
                    !동성인가 && index % 2 === 0
                      ? "bg-blind-100 bg-opacity-50"
                      : ""
                  } ${동성인가 ? "bg-gray-100" : ""}`}
                  onClick={() => {
                    if (self.gender === member.gender) {
                      alert("동성 회원의 프로필은 조회할 수 없습니다.");

                      return;
                    }

                    router.push(`/members/${member.id}`);
                  }}
                  aria-disabled={self.gender === member.gender}
                >
                  <div className="truncate">{member.nickname}</div>
                  <div className="truncate">{지역_라벨[member.region]}</div>
                  <div className="truncate">{member.birthYear}년생</div>
                  <div className="truncate">{member.height}cm</div>
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
                  onClick={onFetchNextPage}
                  disabled={isFetching}
                />
                <FetchMoreButton
                  loading={isFetchingNextPage}
                  onClick={onFetchNextPage}
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

function BasicPromotion() {
  return (
    <div className="text-center">
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
    <Layout title="이성 회원 목록" width="lg" bottomNav={true}>
      {page}
    </Layout>
  );
};
