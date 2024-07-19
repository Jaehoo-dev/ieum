import type { BasicMatch, BasicMember } from "@ieum/prisma";

import type {
  BasicMatchWithMembers,
  BasicMemberWithJoined,
} from "~/domains/basic/types";
import { api } from "~/utils/api";

interface Props {
  actionMember: BasicMemberWithJoined;
  match: BasicMatchWithMembers;
}

export function RespondField({ actionMember, match }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span>{`응답: ${getMemberMatchStatusLabel(match, actionMember)}`}</span>
      <RespondButtons actionMember={actionMember} match={match} />
    </div>
  );
}

function getMemberMatchStatusLabel(
  { rejectedBy, acceptedBy }: BasicMatchWithMembers,
  member: BasicMember,
) {
  if (rejectedBy.some((rejectedMember) => rejectedMember.id === member.id)) {
    return "거절";
  }

  if (acceptedBy.some((acceptedMember) => acceptedMember.id === member.id)) {
    return "수락";
  }

  return "대기중";
}

interface RespondButtonsProps {
  actionMember: BasicMember;
  match: BasicMatch;
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
