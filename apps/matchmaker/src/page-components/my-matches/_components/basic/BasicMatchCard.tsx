import { useRouter } from "next/router";
import { BASIC_MATCH_DURATION_HOURS } from "@ieum/constants";
import type { BasicMatchV2 } from "@ieum/prisma";
import { assert } from "@ieum/utils";
import { format } from "date-fns";

import { Member } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";
import { calculateRemainingHours } from "../../_utils/calculateRemainingHours";
import { getStatusLabel } from "../../_utils/getStatusLabel";

interface Props {
  match: Pick<BasicMatchV2, "id" | "sentAt" | "status">;
  selfMember: Member;
  showLabel: boolean;
  disabled: boolean;
  onClick?: () => void;
}

export function BasicMatchCard({
  match,
  selfMember,
  showLabel,
  onClick,
  disabled,
}: Props) {
  const router = useRouter();
  const { data: displayStatus } =
    api.basicMatchRouter.getDisplayStatus.useQuery(
      {
        matchId: match.id,
        memberId: selfMember.id,
      },
      { enabled: showLabel },
    );

  assert(match.sentAt != null, "Match should have sentAt");

  const 남은_시간 = calculateRemainingHours({
    sentAt: match.sentAt,
    durationHours: BASIC_MATCH_DURATION_HOURS,
  });

  return (
    <button
      className="flex w-full rounded-lg bg-gray-100 p-4 shadow hover:bg-primary-300 disabled:cursor-not-allowed disabled:bg-gray-100"
      onClick={() => {
        onClick?.();
        void router.push(`/my-matches/basic/${match.id}`);
      }}
      disabled={disabled}
    >
      <div className="flex flex-col items-start gap-1">
        <p className="font-semibold text-gray-800">
          {`💌 ${format(match.sentAt, "M월d일")}`}
        </p>
        <p className="text-gray-600">{`⏰ ${남은_시간}시간 남음`}</p>
        {showLabel && displayStatus != null ? (
          <p>{`🚦 ${getStatusLabel(displayStatus)}`}</p>
        ) : null}
      </div>
    </button>
  );
}
