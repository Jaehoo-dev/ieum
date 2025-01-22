import type { ButtonHTMLAttributes } from "react";
import { MatchStatus } from "@ieum/prisma";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";

import { api } from "~/utils/api";

const 매치_상태 = [MatchStatus.BACKLOG, MatchStatus.PREPARING] as const;

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  payload: {
    senderId: string;
    receiverId: string;
    targetStatus: (typeof 매치_상태)[number];
  };
}

export function CreateMegaphoneButton({
  payload: { senderId, receiverId, targetStatus },
  disabled,
  ...props
}: Props) {
  const utils = api.useUtils();
  const { mutateAsync: createMegaphoneMatch, isPending } =
    api.megaphoneMatchRouter.create.useMutation({
      onSuccess: () => {
        return Promise.all([
          utils.basicMemberRouter.invalidate(),
          utils.megaphoneMatchRouter.invalidate(),
        ]);
      },
    });

  return (
    <button
      className={`rounded-lg ${
        targetStatus === MatchStatus.BACKLOG ? "bg-yellow-400" : "bg-green-500"
      } p-1.5 text-white`}
      onClick={async () => {
        await createMegaphoneMatch({
          senderId,
          receiverId,
          initialStatus: targetStatus,
        });
      }}
      disabled={disabled ?? isPending}
      {...props}
    >
      <CampaignRoundedIcon fontSize="small" />
    </button>
  );
}
