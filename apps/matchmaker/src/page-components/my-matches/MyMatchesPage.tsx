import assert from "assert";
import { Suspense, useEffect } from "react";
import type { ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { MatchStatus } from "@prisma/client";
import type { BasicMatch } from "@prisma/client";
import { addHours, format } from "date-fns";
import { match as matchPattern } from "ts-pattern";

import { Layout } from "~/components/Layout";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";

export function MyMatchesPage() {
  return (
    <Suspense fallback={null}>
      <div className="flex w-full flex-col gap-4">
        <Link
          href="/my-profile"
          className="text-xl font-medium text-primary-500 hover:text-primary-700 hover:underline"
        >
          내 프로필 보기
        </Link>
        <hr className="w-full" />
        <Resolved />
      </div>
    </Suspense>
  );
}

function Resolved() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    void sendMessage(`${member.name} - 매칭 목록 페이지 진입`);
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
                  onClick={() => {
                    void sendMessage(
                      `${member.name} - ${match.id} 매칭 카드 클릭`,
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
            <div className="flex w-full flex-col items-center gap-4">
              {pastMatches.map((match) => {
                return (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onClick={() => {
                      void sendMessage(
                        `${member.name} - ${match.id} 매칭 카드 클릭`,
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
    </div>
  );
}

function MatchCard({
  match,
  onClick,
  disabled = false,
}: {
  match: BasicMatch;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const router = useRouter();

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
        <p className="text-xl">{`🚦 ${getStatusLabel(match)}`}</p>
      </div>
    </button>
  );
}

function Empty() {
  return (
    <div className="flex w-full flex-col items-center">
      <p className="text-2xl font-medium text-primary-500">
        이상형을 찾고 있어요 💘
      </p>
      <p className="text-2xl font-medium text-primary-500">
        잠시만 기다려주세요 🙏
      </p>
    </div>
  );
}

function getStatusLabel(match: BasicMatch) {
  return matchPattern(match.status)
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
  const expiresAt = addHours(match.updatedAt, 24);

  return Math.floor(
    (expiresAt.getTime() - new Date().getTime()) / 1000 / 60 / 60,
  );
}

MyMatchesPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="매칭 목록">{page}</Layout>;
};
