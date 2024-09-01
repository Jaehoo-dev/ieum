import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { 매치_유형 } from "@ieum/constants";
import type { BasicMatchV2 } from "@ieum/prisma";
import { Gender, MatchStatus, MemberStatus } from "@ieum/prisma";
import { assert } from "@ieum/utils";
import { differenceInCalendarDays } from "date-fns";

import { isBasicMemberWithBasicMatchesJoined } from "~/domains/basic/isBasicMemberWithBasicMatchesJoined";
import type {
  BasicMemberWithBasicMatchesJoined,
  BasicMemberWithMegaphoneMatchesJoined,
} from "~/domains/basic/types";
import { Avatar } from "../Avatar";
import { DetailedSelfFields } from "./DetailedSelfFields";
import { IdealTypeFields } from "./IdealTypeFields";
import { SimpleSelfFields } from "./SimpleSelfFields";

type Mode = "SIMPLE" | "DETAILED";

interface Props {
  member:
    | BasicMemberWithBasicMatchesJoined
    | BasicMemberWithMegaphoneMatchesJoined;
  defaultMode?: Mode;
}

export function BasicMemberCard({ member, defaultMode }: Props) {
  assert(member.idealType != null, "idealType is required");

  const router = useRouter();
  const [folded, setFolded] = useState(false);
  const [mode, setMode] = useState<Mode>(defaultMode ?? "SIMPLE");

  return (
    <div className="flex w-full max-w-3xl flex-col gap-2 rounded-lg border border-gray-200 p-3 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {member.images[0] != null ? (
            <Avatar
              image={member.images[0]}
              style={{ marginRight: "4px", cursor: "pointer" }}
              onClick={() => {
                router.push(`/basic/members/${member.id}/update`);
              }}
            />
          ) : null}
          <div className="flex flex-col gap-0.5">
            <Link
              href={`/basic/members/${member.id}/update`}
              className={`${
                member.status !== MemberStatus.ACTIVE
                  ? "text-gray-400"
                  : member.gender === Gender.MALE
                  ? "text-blue-500"
                  : "text-pink-500"
              } text-lg font-semibold`}
            >
              {`${member.name}(${member.phoneNumber.slice(-4)})`}
            </Link>
            {member.profile == null ? (
              <Link
                href={`/basic/members/${member.id}/profile/create`}
                className="text-blue-600 hover:underline"
              >
                프로필 생성
              </Link>
            ) : (
              <div className="flex flex-row gap-1">
                <Link
                  href={`/basic/members/${member.id}/profile/update`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-blue-600 hover:underline"
                >
                  프로필 수정
                </Link>
                <span>|</span>
                <Link
                  href={`/basic/members/${member.id}/profile`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-blue-600 hover:underline"
                >
                  보기
                </Link>
              </div>
            )}
            {isBasicMemberWithBasicMatchesJoined(member) ? (
              <Count member={member} />
            ) : null}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            {member.status === MemberStatus.ACTIVE ||
            member.status === MemberStatus.INACTIVE ||
            member.status === MemberStatus.PENDING ? (
              <>
                {member.isMegaphoneUser ? (
                  <>
                    <Link
                      href={`/basic/members/${member.id}/matchmaker/${매치_유형.확성기}`}
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      확성기
                    </Link>
                    <span>|</span>{" "}
                  </>
                ) : null}
                <Link
                  href={`/basic/members/${member.id}/matchmaker/${매치_유형.기본}`}
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noreferrer noopener"
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
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-3">
            {mode === "DETAILED" ? (
              <DetailedSelfFields member={member} />
            ) : (
              <SimpleSelfFields member={member} />
            )}
            <div className="min-h-fit border-l border-gray-200" />
            <IdealTypeFields idealType={member.idealType} />
          </div>
          {member.memo != null ? <div>{`메모: ${member.memo}`}</div> : null}
        </div>
      )}
    </div>
  );
}

function Count({ member }: { member: BasicMemberWithBasicMatchesJoined }) {
  const matchesCountByStatus = countMatchesByStatus([
    ...member.pendingMatches,
    ...member.rejectedMatches,
    ...member.acceptedMatches,
  ]);

  return (
    <span>{`백로그 ${matchesCountByStatus[MatchStatus.BACKLOG]} / 준비중 ${
      matchesCountByStatus[MatchStatus.PREPARING]
    } / 진행중 ${
      matchesCountByStatus[MatchStatus.PENDING] +
      matchesCountByStatus[MatchStatus.ACCEPTED]
    } / 완료 ${
      matchesCountByStatus[MatchStatus.REJECTED] +
      matchesCountByStatus[MatchStatus.BROKEN_UP]
    } / ${differenceInCalendarDays(
      new Date(),
      member.lastMatchedAt,
    )}일 전`}</span>
  );
}

function countMatchesByStatus(matches: BasicMatchV2[]) {
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
