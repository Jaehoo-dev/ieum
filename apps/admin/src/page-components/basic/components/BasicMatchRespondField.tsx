import type { BasicMatchV2, BasicMemberV2 } from "@ieum/prisma";

import type {
  BasicMatchWithMembers,
  BasicMemberWithBasicMatchesJoined,
} from "~/domains/basic/types";
import { api } from "~/utils/api";

interface Props {
  actionMember: BasicMemberWithBasicMatchesJoined;
  match: BasicMatchWithMembers;
}

export function BasicMatchRespondField({ actionMember, match }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span>{`응답: ${getMemberMatchStatusLabel(match, actionMember)}`}</span>
      <RespondButtons actionMember={actionMember} match={match} />
    </div>
  );
}

function getMemberMatchStatusLabel(
  { rejectedByV2, acceptedByV2 }: BasicMatchWithMembers,
  member: BasicMemberV2,
) {
  if (rejectedByV2.some((rejectedMember) => rejectedMember.id === member.id)) {
    return "거절";
  }

  if (acceptedByV2.some((acceptedMember) => acceptedMember.id === member.id)) {
    return "수락";
  }

  return "대기중";
}

interface RespondButtonsProps {
  actionMember: BasicMemberV2;
  match: BasicMatchV2;
}

function RespondButtons({ actionMember, match }: RespondButtonsProps) {
  const utils = api.useUtils();
  const { mutateAsync: rejectBy } = api.basicMatchRouter.rejectBy.useMutation({
    onSuccess: () => {
      return Promise.all([
        utils.basicMatchRouter.invalidate(),
        utils.basicMemberRouter.invalidate(),
      ]);
    },
  });
  const { mutateAsync: acceptBy } = api.basicMatchRouter.acceptBy.useMutation({
    onSuccess: () => {
      return Promise.all([
        utils.basicMatchRouter.invalidate(),
        utils.basicMemberRouter.invalidate(),
      ]);
    },
  });

  return (
    <div className="flex gap-2">
      <button
        className="rounded-lg bg-red-500 px-3 py-1.5 text-white"
        onClick={async () => {
          await rejectBy({
            actionMemberId: actionMember.id,
            matchId: match.id,
          });
        }}
      >
        거절
      </button>
      <button
        className="rounded-lg bg-green-500 px-3 py-1.5 text-white"
        onClick={async () => {
          await acceptBy({
            actionMemberId: actionMember.id,
            matchId: match.id,
          });
        }}
      >
        수락
      </button>
    </div>
  );
}
