import { ButtonHTMLAttributes } from "react";
import { MatchStatus } from "@ieum/prisma";
import { match } from "ts-pattern";

import { api } from "~/utils/api";

const 매치_상태 = [MatchStatus.BACKLOG, MatchStatus.PREPARING] as const;

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  payload: {
    member1Id: string;
    member2Id: string;
    targetStatus: (typeof 매치_상태)[number];
  };
}

export function CreateBasicMatchButton({
  payload: { member1Id, member2Id, targetStatus },
  disabled,
  ...props
}: Props) {
  const utils = api.useUtils();
  const { mutateAsync: createMatch, isPending } =
    api.basicMatchRouter.create.useMutation({
      onSuccess: () => {
        return utils.basicMemberRouter.invalidate();
      },
    });

  return (
    <button
      className={`rounded-lg ${
        targetStatus === MatchStatus.BACKLOG ? "bg-yellow-400" : "bg-green-500"
      } px-2 py-1 text-xs font-medium text-white`}
      onClick={async () => {
        await createMatch({
          member1Id,
          member2Id,
          initialStatus: targetStatus,
        });
      }}
      disabled={disabled || isPending}
      {...props}
    >
      {match(targetStatus)
        .with(MatchStatus.BACKLOG, () => "백로그")
        .with(MatchStatus.PREPARING, () => "준비중")
        .exhaustive()}
    </button>
  );
}
