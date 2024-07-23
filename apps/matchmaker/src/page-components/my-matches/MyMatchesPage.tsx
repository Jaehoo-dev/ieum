import { Suspense, useEffect } from "react";
import type { ReactElement } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import type { BasicMatch } from "@ieum/prisma";
import { MatchStatus } from "@ieum/prisma";
import { assert } from "@ieum/utils";
import { addHours, format } from "date-fns";
import { match as matchPattern } from "ts-pattern";

import { Layout } from "~/components/Layout";
import { TipsMenuLink } from "~/components/TipsMenuLink";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { Member, useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";
import { formatUniqueMemberName } from "~/utils/formatUniqueMemberName";

export function MyMatchesPage() {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="flex w-full flex-col gap-4">
        <Description />
        <hr className="w-full" />
        <Suspense fallback={null}>
          <Resolved />
        </Suspense>
      </div>
    </>
  );
}

function Description() {
  return (
    <div className="flex flex-col gap-2 text-gray-700">
      <span className="flex flex-row items-center gap-2">
        <p>🟡</p>
        <p>응답 대기 중</p>
      </span>
      <span className="flex flex-row items-center gap-2">
        <p>🔴</p>
        <p>본인 또는 상대방이 거절</p>
      </span>
      <span className="flex flex-row items-center gap-2">
        <p>🟢</p>
        <p>소개 성사</p>
      </span>
    </div>
  );
}

function Resolved() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    void sendMessage(
      `${formatUniqueMemberName(member)} - 매칭 목록 페이지 진입`,
    );
  }, [member.name, sendMessage]);

  const [activeMatches] =
    api.basicMatchRouter.findActiveMatchesByMemberId.useSuspenseQuery({
      memberId: member.id,
    });
  const [pastMatches] =
    api.basicMatchRouter.findPastMatchesByMemberId.useSuspenseQuery({
      memberId: member.id,
    });

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex w-full flex-col gap-2">
        <h2 className="text-xl font-semibold text-gray-800">새 매칭</h2>
        <div className="flex w-full flex-col items-center gap-4">
          {activeMatches.length > 0 ? (
            activeMatches.map((match) => {
              return (
                <MatchCard
                  key={match.id}
                  match={match}
                  selfMember={member}
                  showLabel={false}
                  onClick={() => {
                    void sendMessage(
                      `${formatUniqueMemberName(member)} - ${
                        match.id
                      } 매칭 카드 클릭`,
                    );
                  }}
                />
              );
            })
          ) : (
            <Empty />
          )}
        </div>
      </div>
      {pastMatches.length > 0 ? (
        <>
          <hr className="w-full" />
          <div className="flex w-full flex-col gap-2">
            <h2 className="text-xl font-semibold text-gray-800">지난 매칭</h2>
            <div className="flex w-full items-start gap-1">
              <p className="text-md text-gray-700">※</p>
              <p className="text-md text-gray-700">
                응답 대기 중 또는 거절 프로필은 조회할 수 없습니다.
              </p>
            </div>
            <div className="flex w-full flex-col items-center gap-4">
              {pastMatches.map((match) => {
                return (
                  <MatchCard
                    key={match.id}
                    match={match}
                    selfMember={member}
                    showLabel={true}
                    onClick={() => {
                      void sendMessage(
                        `${formatUniqueMemberName(member)} - ${
                          match.id
                        } 매칭 카드 클릭`,
                      );
                    }}
                    disabled={match.status !== MatchStatus.ACCEPTED}
                  />
                );
              })}
            </div>
          </div>
        </>
      ) : null}
      <div className="mt-4 flex justify-center">
        <TipsMenuLink />
      </div>
    </div>
  );
}

function MatchCard({
  match,
  selfMember,
  showLabel,
  onClick,
  disabled = false,
}: {
  match: BasicMatch;
  selfMember: Member;
  showLabel: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const router = useRouter();
  const { data: displayStatus } =
    api.basicMatchRouter.getDisplayStatus.useQuery(
      {
        matchId: match.id,
        memberId: selfMember.id,
      },
      {
        enabled: showLabel,
      },
    );

  return (
    <button
      className="flex w-full rounded-lg bg-gray-100 p-5 shadow hover:bg-primary-300 disabled:cursor-not-allowed disabled:bg-gray-100"
      onClick={() => {
        onClick?.();
        void router.push(`/my-matches/${match.id}`);
      }}
      disabled={disabled}
    >
      <div className="flex flex-col items-start gap-2">
        <p className="text-xl font-semibold text-gray-800">{`💌 ${format(
          match.updatedAt,
          "M월 d일",
        )} 매칭`}</p>
        <p className="text-xl text-gray-600">
          {`⏰ ${calculateLeftHours(match)}시간 남음`}
        </p>
        {showLabel && displayStatus != null ? (
          <p className="text-xl">{`🚦 ${getStatusLabel(displayStatus)}`}</p>
        ) : null}
      </div>
    </button>
  );
}

function Empty() {
  return (
    <div className="mt-2 flex w-full flex-col items-center">
      <p className="text-xl font-medium text-primary-500">
        이상형을 찾고 있어요 💘
      </p>
      <p className="text-xl font-medium text-primary-500">
        잠시만 기다려주세요 🙏
      </p>
    </div>
  );
}

function getStatusLabel(status: MatchStatus) {
  return matchPattern(status)
    .with(MatchStatus.PENDING, () => "🟡")
    .with(MatchStatus.REJECTED, () => "🔴")
    .with(MatchStatus.ACCEPTED, () => "🟢")
    .with(
      MatchStatus.BACKLOG,
      MatchStatus.PREPARING,
      MatchStatus.BROKEN_UP,
      () => {
        throw new Error("Invalid status");
      },
    )
    .exhaustive();
}

function calculateLeftHours(match: BasicMatch) {
  assert(match.sentAt != null, "Match should have sentAt");

  const expiresAt = addHours(match.sentAt, 24);

  const result = Math.floor(
    (expiresAt.getTime() - new Date().getTime()) / 1000 / 60 / 60,
  );

  return result < 0 ? 0 : result;
}

MyMatchesPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="매칭 목록">{page}</Layout>;
};
