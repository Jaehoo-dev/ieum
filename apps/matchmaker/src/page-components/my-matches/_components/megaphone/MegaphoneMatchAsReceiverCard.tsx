import { useRouter } from "next/router";
import { MEGAPHONE_MATCH_RECEIVER_DURATION_HOURS } from "@ieum/constants";
import { MegaphoneMatch } from "@ieum/prisma";
import { assert } from "@ieum/utils";
import { format } from "date-fns";

import { calculateRemainingHours } from "../../_utils/calculateRemainingHours";
import { getStatusLabel } from "../../_utils/getStatusLabel";

interface Props {
  match: Pick<MegaphoneMatch, "id" | "status" | "sentToReceiverAt">;
  showRemainingHours: boolean;
  showLabel: boolean;
  disabled: boolean;
  onClick?: () => void;
}

export function MegaphoneMatchAsReceiverCard({
  match,
  showRemainingHours,
  showLabel,
  disabled,
  onClick,
}: Props) {
  const router = useRouter();

  assert(match.sentToReceiverAt != null, "Match should have sentToReceiverAt");

  return (
    <button
      className="flex w-full rounded-lg bg-gray-100 p-5 shadow hover:bg-primary-300 disabled:cursor-not-allowed disabled:bg-gray-100"
      onClick={() => {
        onClick?.();
        void router.push(`/my-matches/megaphone/${match.id}`);
      }}
      disabled={disabled}
    >
      <div className="flex flex-col items-start gap-1">
        <p className="font-semibold text-gray-800">
          {`💌 ${format(match.sentToReceiverAt, "M월d일")}`}
        </p>
        {showRemainingHours ? (
          <p className="text-gray-600">{`⏰ ${calculateRemainingHours({
            sentAt: match.sentToReceiverAt,
            durationHours: MEGAPHONE_MATCH_RECEIVER_DURATION_HOURS,
          })}시간 남음`}</p>
        ) : null}
        {showLabel ? <p>{`🚦 ${getStatusLabel(match.status)}`}</p> : null}
      </div>
    </button>
  );
}
