import { MatchStatus } from "@ieum/prisma";
import { assert, formatUniqueMemberName } from "@ieum/utils";

import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";
import { MegaphoneMatchAsSenderCard } from "./MegaphoneMatchAsSenderCard";

export function PastMegaphoneMatchesAsSenderSectionResolved() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const [pastRespondedMegaphoneMatchesAsSender] =
    api.megaphoneMatchRouter.findRespondedPastMatchesAsSenderByMemberId.useSuspenseQuery(
      { memberId: member.id },
    );
  const [pastRejectedMegaphoneMatchesAsSender] =
    api.megaphoneMatchRouter.findRejectedPastMatchesAsSenderByMemberId.useSuspenseQuery(
      { memberId: member.id },
    );

  return pastRespondedMegaphoneMatchesAsSender.length > 0 ||
    pastRejectedMegaphoneMatchesAsSender.length > 0 ? (
    <>
      <RespondedResolved />
      <RejectedResolved />
    </>
  ) : null;
}

function RespondedResolved() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const [pastRespondedMegaphoneMatchesAsSender] =
    api.megaphoneMatchRouter.findRespondedPastMatchesAsSenderByMemberId.useSuspenseQuery(
      { memberId: member.id },
    );
  const { sendMessage } = useSlackNotibot();

  return pastRespondedMegaphoneMatchesAsSender.length > 0 ? (
    <div className="flex w-full flex-col gap-2">
      <h2 className="text-xl font-semibold text-gray-800">응답 완료</h2>
      <div className="flex w-full items-start gap-1 text-sm">
        <p className="text-gray-500">※</p>
        <p className="text-gray-500">성사된 프로필만 다시 볼 수 있습니다.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {pastRespondedMegaphoneMatchesAsSender.map((match) => {
          return (
            <MegaphoneMatchAsSenderCard
              key={match.id}
              match={match}
              showRemainingHours={false}
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
  ) : null;
}

function RejectedResolved() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const [pastRejectedMegaphoneMatchesAsSender] =
    api.megaphoneMatchRouter.findRejectedPastMatchesAsSenderByMemberId.useSuspenseQuery(
      { memberId: member.id },
    );

  return pastRejectedMegaphoneMatchesAsSender.length > 0 ? (
    <div className="flex w-full flex-col gap-2">
      <h2 className="text-xl font-semibold text-gray-800">상대방 거절</h2>
      <div className="grid grid-cols-2 gap-3">
        {pastRejectedMegaphoneMatchesAsSender.map((match) => {
          return (
            <MegaphoneMatchAsSenderCard
              key={match.id}
              match={match}
              showRemainingHours={false}
              showLabel={true}
              disabled={false}
            />
          );
        })}
      </div>
    </div>
  ) : null;
}
