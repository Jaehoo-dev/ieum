import { assert, formatUniqueMemberName } from "@ieum/utils";

import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";
import { MatchesEmpty } from "../MatchesEmpty";
import { MegaphoneMatchAsSenderCard } from "./MegaphoneMatchAsSenderCard";

export function ActiveMegaphoneMatchesSectionAsSenderResolved() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const [{ pendingBySender, pendingByReceiverOrWaiting }] =
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
        {pendingBySender.length === 0 &&
        pendingByReceiverOrWaiting.length === 0 ? (
          <MatchesEmpty.Sender />
        ) : (
          <div className="flex flex-col gap-4">
            {pendingBySender.length > 0 ? (
              <div className="flex flex-col gap-2">
                <Description content="상대방이 프로필을 먼저 받고 수락한 매칭입니다. 수락하시면 바로 성사됩니다." />
                <div className="grid grid-cols-2 gap-3">
                  {pendingBySender.map((match) => {
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
            ) : null}
            {pendingByReceiverOrWaiting.length > 0 ? (
              <div className="flex flex-col gap-2">
                <Description content="상대방에게 먼저 의사를 확인하고 있습니다." />
                <div className="grid grid-cols-2 gap-3">
                  {pendingByReceiverOrWaiting.map((match) => {
                    return (
                      <MegaphoneMatchAsSenderCard
                        key={match.id}
                        match={match}
                        showRemainingHours={true}
                        showLabel={false}
                        disabled={true}
                      />
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function Description({ content }: { content: string }) {
  return (
    <div className="flex w-full items-start gap-1 text-sm">
      <p className="text-gray-500">※</p>
      <p className="text-gray-500">{content}</p>
    </div>
  );
}
