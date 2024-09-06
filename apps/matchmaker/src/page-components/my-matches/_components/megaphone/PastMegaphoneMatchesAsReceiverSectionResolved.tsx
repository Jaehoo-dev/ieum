import { MatchStatus } from "@ieum/prisma";
import { assert, formatUniqueMemberName } from "@ieum/utils";

import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";
import { StatusLabelDescription } from "../StatusLabelDescription";
import { MegaphoneMatchAsReceiverCard } from "./MegaphoneMatchAsReceiverCard";

export function PastMegaphoneMatchesAsReceiverSectionResolved() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const [pastMegaphoneMatchesAsReceiver] =
    api.megaphoneMatchRouter.findPastMatchesAsReceiverByMemberId.useSuspenseQuery(
      {
        memberId: member.id,
      },
    );
  const { sendMessage } = useSlackNotibot();

  return pastMegaphoneMatchesAsReceiver.length > 0 ? (
    <div className="flex w-full flex-col gap-2">
      <h2 className="text-xl font-semibold text-gray-800">응답 완료</h2>
      <div className="flex w-full items-start gap-1 text-sm">
        <p className="text-gray-500">※</p>
        <p className="text-gray-500">성사된 프로필만 다시 볼 수 있습니다.</p>
      </div>
      <div className="flex flex-col gap-2">
        <StatusLabelDescription.Receiver />
        <div className="grid grid-cols-2 gap-3">
          {pastMegaphoneMatchesAsReceiver.map((match) => {
            return (
              <MegaphoneMatchAsReceiverCard
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
    </div>
  ) : null;
}
