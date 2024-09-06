import { assert, formatUniqueMemberName } from "@ieum/utils";

import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";
import { MatchesEmpty } from "../MatchesEmpty";
import { MegaphoneMatchAsSenderCard } from "./MegaphoneMatchAsSenderCard";

export function ActiveMegaphoneMatchesSectionAsSenderResolved() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const [activeMegaphoneMatchesAsSender] =
    api.megaphoneMatchRouter.findActiveMatchesAsSenderByMemberId.useSuspenseQuery(
      {
        memberId: member.id,
      },
    );

  const { sendMessage } = useSlackNotibot();

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex w-full flex-col gap-2">
        <h2 className="text-xl font-semibold text-gray-800">신규</h2>
        {activeMegaphoneMatchesAsSender.length > 0 ? (
          <div className="flex flex-col gap-2">
            <div className="flex w-full items-start gap-1 text-sm">
              <p className="text-gray-500">※</p>
              <p className="text-gray-500">
                상대방이 프로필을 먼저 받고 수락한 매칭입니다. 수락하시면 바로
                성사됩니다.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {activeMegaphoneMatchesAsSender.map((match) => {
                return (
                  <MegaphoneMatchAsSenderCard
                    key={match.id}
                    match={match}
                    showRemainingHours={true}
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
          <MatchesEmpty.Sender />
        )}
      </div>
    </div>
  );
}
