import { useState } from "react";
import Link from "next/link";
import type { BasicMatch } from "@ieum/prisma";
import { Gender, MatchStatus, MemberStatus } from "@ieum/prisma";

import type { BasicMemberWithMatches } from "~/domains/basic/types";
import { DetailedSelfFields } from "./DetailedSelfFields";
import { IdealTypeFields } from "./IdealTypeFields";
import { SimpleSelfFields } from "./SimpleSelfFields";

type Mode = "SIMPLE" | "DETAILED";

interface Props {
  member: BasicMemberWithMatches;
  defaultMode?: Mode;
}

export function BasicMemberCard({ member, defaultMode }: Props) {
  const [folded, setFolded] = useState(false);
  const [mode, setMode] = useState<Mode>(defaultMode ?? "SIMPLE");

  const matchesCountByStatus = countMatchesByStatus([
    ...member.pendingMatches,
    ...member.rejectedMatches,
    ...member.acceptedMatches,
  ]);

  return (
    <div className="w-full max-w-3xl rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className={`${
                member.status !== MemberStatus.ACTIVE
                  ? "text-gray-400"
                  : member.gender === Gender.MALE
                  ? "text-blue-500"
                  : "text-pink-500"
              } text-lg font-semibold`}
            >
              {member.name}
            </span>
            <span>|</span>
            {member.profile == null ? (
              <Link
                href={`/basic/members/${member.id}/profile/create`}
                className="text-blue-600 hover:underline"
              >
                프로필 생성
              </Link>
            ) : (
              <Link
                href={`/basic/members/${member.id}/profile`}
                className="text-blue-600 hover:underline"
              >
                프로필
              </Link>
            )}
          </div>
          <span>{`백로그 ${
            matchesCountByStatus[MatchStatus.BACKLOG]
          } / 준비중 ${matchesCountByStatus[MatchStatus.PREPARING]} / 진행중 ${
            matchesCountByStatus[MatchStatus.PENDING] +
            matchesCountByStatus[MatchStatus.ACCEPTED]
          } / 완료 ${
            matchesCountByStatus[MatchStatus.REJECTED] +
            matchesCountByStatus[MatchStatus.BROKEN_UP]
          }`}</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            {member.status === MemberStatus.ACTIVE ? (
              <>
                <Link
                  href={`/basic/members/${member.id}/matchmaker`}
                  className="text-blue-600 hover:underline"
                >
                  매치
                </Link>
                <span>|</span>
              </>
            ) : null}
            <Link
              href={`/basic/members/${member.id}/matches`}
              className="text-blue-600 hover:underline"
            >
              이력
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {folded ? null : (
              <>
                <button
                  onClick={() => {
                    setMode(mode === "DETAILED" ? "SIMPLE" : "DETAILED");
                  }}
                >
                  {mode === "DETAILED" ? "간략 보기" : "상세 보기"}
                </button>
                <span>|</span>
              </>
            )}
            <button
              onClick={() => {
                setFolded(!folded);
              }}
            >
              {folded ? "펼치기" : "접기"}
            </button>
          </div>
        </div>
      </div>
      {folded ? null : (
        <div className="flex flex-col gap-2">
          <div className="mt-2 flex gap-4">
            {mode === "DETAILED" ? (
              <DetailedSelfFields member={member} />
            ) : (
              <SimpleSelfFields member={member} />
            )}
            <div className="min-h-fit border-l border-gray-200" />
            <IdealTypeFields member={member} />
          </div>
          {member.memo != null ? <div>{`메모: ${member.memo}`}</div> : null}
        </div>
      )}
    </div>
  );
}

function countMatchesByStatus(matches: BasicMatch[]) {
  const result = {
    [MatchStatus.BACKLOG]: 0,
    [MatchStatus.PREPARING]: 0,
    [MatchStatus.PENDING]: 0,
    [MatchStatus.REJECTED]: 0,
    [MatchStatus.ACCEPTED]: 0,
    [MatchStatus.BROKEN_UP]: 0,
  };

  for (const match of matches) {
    result[match.status] += 1;
  }

  return result;
}
