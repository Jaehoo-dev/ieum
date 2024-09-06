import { MatchStatus } from "@ieum/prisma";
import { assert, formatUniqueMemberName } from "@ieum/utils";

import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";
import { StatusLabelDescription } from "../StatusLabelDescription";
import { BasicMatchCard } from "./BasicMatchCard";

export function PastBasicMatchesSectionResolved() {
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
            <StatusLabelDescription.Basic />
            <div className="grid grid-cols-2 gap-3">
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
            <div className="grid grid-cols-2 gap-3">
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
