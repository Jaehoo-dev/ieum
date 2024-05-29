import type { ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { 상태_라벨 } from "@ieum/constants";
import type { BlindMatch } from "@ieum/prisma";
import { Gender, MatchStatus } from "@ieum/prisma";
import { assert } from "@ieum/utils";
import { match } from "ts-pattern";

import { BlindMemberCard } from "~/components/blind/BlindMemberCard";
import { Layout } from "~/components/Layout";
import { copyBlindMemberProfile } from "~/domains/blind/copyBlindMemberProfile";
import { api } from "~/utils/api";

export function BlindMemberMatchesPage() {
  const router = useRouter();
  const blindMemberId = Number(router.query.blindMemberId);
  const { data: blindMember } = api.blindMemberRouter.findById.useQuery(
    blindMemberId,
    { enabled: !isNaN(blindMemberId) },
  );
  const { data: matches = [] } = api.blindMatchRouter.findByMemberId.useQuery(
    blindMemberId,
    {
      enabled: !isNaN(blindMemberId),
    },
  );

  return (
    <div className="flex min-h-screen w-full flex-col items-center gap-6">
      <div className="flex items-center gap-4">
        <h1 className="text-4xl font-semibold">
          {blindMember != null ? (
            <span
              className={`${
                blindMember.gender === Gender.MALE
                  ? "text-blue-500"
                  : "text-pink-500"
              }`}
            >
              {blindMember.nickname}
            </span>
          ) : null}
          <span>{" 님의 매칭 이력"}</span>
        </h1>
        <button
          onClick={async () => {
            assert(blindMember != null, "blindMember must not be null");
            await copyBlindMemberProfile(blindMember);
            alert(`${blindMember.nickname} 님의 프로필을 복사했어요.`);
          }}
        >
          프로필 복사
        </button>
        <Link
          href={`/blind/members/${blindMemberId}/matchmaker`}
          className="text-blue-600 hover:underline"
        >
          {"매칭 >"}
        </Link>
      </div>
      <div
        className="flex w-full gap-10"
        style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
      >
        <div className="flex w-full flex-col items-center gap-4">
          {matches.map((match) => {
            const [member1, member2] = match.members;

            assert(
              member1 != null && member2 != null,
              "members must not be null",
            );

            const matchedMember =
              member1.id === blindMemberId ? member2 : member1;

            return (
              <div
                key={matchedMember.id}
                className="flex w-full justify-center gap-4"
              >
                <BlindMemberCard member={matchedMember} />
                <div className="flex flex-col gap-2">
                  <div className="flex gap-1">
                    <span>상태:</span>
                    <span
                      className={`${getStatusTextColorClassName(match.status)}`}
                    >
                      {상태_라벨[match.status]}
                    </span>
                  </div>
                  <StatusButtons match={match} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatusButtons({ match }: { match: BlindMatch }) {
  const utils = api.useUtils();
  const { mutateAsync: updateStatus } =
    api.blindMatchRouter.updateStatus.useMutation({
      onSuccess: () => {
        return utils.blindMatchRouter.invalidate();
      },
    });

  return (
    <div className="flex flex-col gap-2">
      {Object.values(MatchStatus).map((status) => {
        const disabled = match.status === status;

        return (
          <button
            key={`${match.id}-${status}`}
            className={`rounded-lg px-4 py-2 text-white ${getStatusButtonBackgroundClassName(
              status,
              disabled,
            )}`}
            onClick={() => {
              void updateStatus({
                id: match.id,
                status,
              });
            }}
            disabled={disabled}
          >
            {상태_라벨[status]}
          </button>
        );
      })}
    </div>
  );
}

function getStatusTextColorClassName(status: MatchStatus) {
  return match(status)
    .with("BACKLOG", () => "text-yellow-900")
    .with("PREPARING", () => "text-gray-500")
    .with("PENDING", () => "text-yellow-500")
    .with("REJECTED", () => "text-red-500")
    .with("ACCEPTED", () => "text-green-500")
    .with("BROKEN_UP", () => "text-white")
    .exhaustive();
}

function getStatusButtonBackgroundClassName(
  status: MatchStatus,
  disabled: boolean,
) {
  return match(status)
    .with("BACKLOG", () => {
      return disabled ? "bg-yellow-900" : "bg-yellow-600";
    })
    .with("PREPARING", () => {
      return disabled ? "bg-gray-200" : "bg-gray-600";
    })
    .with("PENDING", () => {
      return disabled ? "bg-yellow-200" : "bg-yellow-400";
    })
    .with("REJECTED", () => {
      return disabled ? "bg-red-200" : "bg-red-500";
    })
    .with("ACCEPTED", () => {
      return disabled ? "bg-green-200" : "bg-green-500";
    })
    .with("BROKEN_UP", () => {
      return disabled ? "bg-gray-700" : "bg-black";
    })
    .exhaustive();
}

BlindMemberMatchesPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
