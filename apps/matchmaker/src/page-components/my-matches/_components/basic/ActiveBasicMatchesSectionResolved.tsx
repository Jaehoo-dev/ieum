import { assert, formatUniqueMemberName } from "@ieum/utils";

import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";
import { MatchesEmpty } from "../MatchesEmpty";
import { BasicMatchCard } from "./BasicMatchCard";

export function ActiveBasicMatchesSectionResolved() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const [activeBasicMatches] =
    api.basicMatchRouter.findActiveMatchesByMemberId.useSuspenseQuery({
      memberId: member.id,
    });

  const { sendMessage } = useSlackNotibot();

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex w-full flex-col gap-2">
        <h2 className="text-xl font-semibold text-gray-800">신규</h2>
        {activeBasicMatches.length > 0 ? (
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
          <MatchesEmpty.Basic />
        )}
      </div>
    </div>
  );
}
