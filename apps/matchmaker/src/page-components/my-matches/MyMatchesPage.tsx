import { Suspense, useEffect } from "react";
import type { ReactElement } from "react";
import Head from "next/head";
import { MatchStatus } from "@ieum/prisma";
import { assert } from "@ieum/utils";

import { Layout } from "~/components/Layout";
import { Loader } from "~/components/Loader";
import { TipsMenuLink } from "~/components/TipsMenuLink";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";
import { formatUniqueMemberName } from "~/utils/formatUniqueMemberName";
import { BasicMatchCard } from "./components/BasicMatchCard";
import { MatchesEmpty } from "./components/MatchesEmpty";

export function MyMatchesPage() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    void sendMessage({
      content: `${formatUniqueMemberName(member)} - 매칭 목록 페이지 진입`,
    });
  }, [member.name, sendMessage]);

  return (
    <>
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="flex w-full flex-col items-center gap-4">
        <Suspense
          fallback={
            <div className="mb-10 mt-16 flex w-full justify-center">
              <Loader />
            </div>
          }
        >
          <div className="flex w-full flex-col gap-2">
            <h2 className="text-xl font-semibold text-gray-800">신규</h2>
            <ActiveMatchesSectionResolved />
          </div>
          <PastMatchesSectionResolved />
        </Suspense>
        <div className="my-4 flex justify-center">
          <TipsMenuLink />
        </div>
      </div>
    </>
  );
}

function Description() {
  return (
    <div className="flex flex-col gap-1 text-sm text-gray-600">
      <span className="flex flex-row items-center gap-2">
        <p>🟡</p>
        <p>응답 대기 중</p>
      </span>
      <span className="flex flex-row items-center gap-2">
        <p>🔴</p>
        <p>상대방 거절</p>
      </span>
      <span className="flex flex-row items-center gap-2">
        <p>🟢</p>
        <p>소개 성사 🎉</p>
      </span>
    </div>
  );
}

function ActiveMatchesSectionResolved() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const [activeBasicMatches] =
    api.basicMatchRouter.findActiveMatchesByMemberId.useSuspenseQuery({
      memberId: member.id,
    });

  const { sendMessage } = useSlackNotibot();

  return activeBasicMatches.length > 0 ? (
    <div className="flex flex-col gap-2">
      <div className="flex w-full items-start gap-1 text-sm">
        <p className="text-gray-500">※</p>
        <p className="text-gray-500">
          응답 전엔 상대방의 응답 여부나 수락 여부를 알 수 없습니다.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {activeBasicMatches.map((match) => {
          return (
            <BasicMatchCard
              key={match.id}
              match={match}
              selfMember={member}
              showLabel={false}
              disabled={false}
              onClick={() => {
                void sendMessage({
                  content: `${formatUniqueMemberName(member)} - ${
                    match.id
                  } 매칭 카드 클릭`,
                });
              }}
            />
          );
        })}
      </div>
    </div>
  ) : (
    <MatchesEmpty />
  );
}

function PastMatchesSectionResolved() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const [{ acceptedByMember: 수락한_매칭들, rejectedByMember: 거절한_매칭들 }] =
    api.basicMatchRouter.findPastMatchesByMemberId.useSuspenseQuery({
      memberId: member.id,
    });
  const { sendMessage } = useSlackNotibot();

  return 수락한_매칭들.length > 0 || 거절한_매칭들.length > 0 ? (
    <div className="flex w-full flex-col gap-2">
      <h2 className="text-xl font-semibold text-gray-800">응답 완료</h2>
      <div className="flex w-full items-start gap-1 text-sm">
        <p className="text-gray-500">※</p>
        <p className="text-gray-500">성사된 프로필만 다시 볼 수 있습니다.</p>
      </div>
      <div className="mt-2 flex flex-col gap-6">
        {수락한_매칭들.length > 0 ? (
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-gray-800">
              내가 수락한 매칭
            </h3>
            <Description />
            <div className="flex w-full flex-col items-center gap-4">
              {수락한_매칭들.map((match) => {
                return (
                  <BasicMatchCard
                    key={match.id}
                    match={match}
                    selfMember={member}
                    showLabel={true}
                    onClick={() => {
                      void sendMessage({
                        content: `${formatUniqueMemberName(member)} - ${
                          match.id
                        } 매칭 카드 클릭`,
                      });
                    }}
                    disabled={match.status !== MatchStatus.ACCEPTED}
                  />
                );
              })}
            </div>
          </div>
        ) : null}
        {거절한_매칭들.length > 0 ? (
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-gray-800">
              내가 거절한 매칭
            </h3>
            <div className="flex w-full flex-col items-center gap-4">
              {거절한_매칭들.map((match) => {
                return (
                  <BasicMatchCard
                    key={match.id}
                    match={match}
                    selfMember={member}
                    showLabel={false}
                    disabled={true}
                  />
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  ) : null;
}

MyMatchesPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="매칭 목록">{page}</Layout>;
};
