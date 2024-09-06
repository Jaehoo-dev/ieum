import { assert, formatUniqueMemberName } from "@ieum/utils";

import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";
import { MatchesEmpty } from "../MatchesEmpty";
import { MegaphoneMatchAsReceiverCard } from "./MegaphoneMatchAsReceiverCard";

export function ActiveMegaphoneMatchesSectionAsReceiverResolved() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const [activeMegaphoneMatchesAsReceiver] =
    api.megaphoneMatchRouter.findActiveMatchesAsReceiverByMemberId.useSuspenseQuery(
      {
        memberId: member.id,
      },
    );

  const { sendMessage } = useSlackNotibot();

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex w-full flex-col gap-2">
        <h2 className="text-xl font-semibold text-gray-800">신규</h2>
        {activeMegaphoneMatchesAsReceiver.length > 0 ? (
          <div className="flex flex-col gap-2">
            <div className="flex w-full items-start gap-1 text-sm">
              <p className="text-gray-500">※</p>
              <p className="text-gray-500">
                {`${member.name} 님께서 상대방의 이상형 조건에 부합해 프로필을 먼저 받아본
                매칭입니다. 수락하시면 ${member.name} 님의 프로필을 상대방에게 전달합니다.`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {activeMegaphoneMatchesAsReceiver.map((match) => {
                return (
                  <MegaphoneMatchAsReceiverCard
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
          <MatchesEmpty.Receiver />
        )}
      </div>
    </div>
  );
}
