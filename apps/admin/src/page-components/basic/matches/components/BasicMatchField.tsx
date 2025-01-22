import { 상태_라벨 } from "@ieum/constants";
import { Gender, MatchStatus } from "@ieum/prisma";
import { format } from "date-fns";

import { BasicMemberCard } from "~/components/BasicMemberCard";
import type { BasicMatchWithMembers } from "~/domains/basic/types";
import { api } from "~/utils/api";
import { BasicMatchRespondField } from "../../components/BasicMatchRespondField";
import { getStatusButtonBackgroundClassName } from "../utils/getStatusButtonBackgroundClassName";
import { getStatusTextColorClassName } from "../utils/getStatusTextColorClassName";

export function BasicMatchField({ match }: { match: BasicMatchWithMembers }) {
  const utils = api.useUtils();
  const { mutateAsync: updateStatus, isPending: isUpdatePending } =
    api.basicMatchRouter.updateStatus.useMutation({
      onSuccess: () => {
        return utils.basicMatchRouter.invalidate();
      },
    });
  const { mutateAsync: shiftToPending, isPending: isShiftingToPendingPending } =
    api.basicMatchRouter.shiftToPending.useMutation({
      onSuccess: () => {
        return Promise.all([
          utils.basicMatchRouter.invalidate(),
          utils.basicMemberRouter.invalidate(),
        ]);
      },
    });
  const { mutateAsync: deleteMatch, isPending: isDeletePending } =
    api.basicMatchRouter.delete.useMutation({
      onSuccess: () => {
        return utils.basicMatchRouter.invalidate();
      },
    });
  const matchMembers = [
    ...match.pendingByV2,
    ...match.rejectedByV2,
    ...match.acceptedByV2,
  ];

  const matchMembersSortedByGender = [...matchMembers].sort((a) => {
    return a.gender === Gender.MALE ? -1 : 1;
  });

  const disabled =
    isUpdatePending || isShiftingToPendingPending || isDeletePending;

  return (
    <div className="flex w-full flex-col gap-2 text-sm">
      <div className="flex w-full gap-3">
        <div className="flex flex-1 flex-col items-center gap-1.5">
          {matchMembersSortedByGender[0] != null ? (
            <>
              <BasicMemberCard member={matchMembersSortedByGender[0]} />
              {match.status === "PENDING" || match.status === "REJECTED" ? (
                <BasicMatchRespondField
                  actionMember={matchMembersSortedByGender[0]}
                  match={match}
                />
              ) : null}
            </>
          ) : (
            "회원 정보가 없습니다"
          )}
        </div>
        <div className="flex flex-1 flex-col items-center gap-1.5">
          {matchMembersSortedByGender[1] != null ? (
            <>
              <BasicMemberCard member={matchMembersSortedByGender[1]} />
              {match.status === "PENDING" || match.status === "REJECTED" ? (
                <BasicMatchRespondField
                  actionMember={matchMembersSortedByGender[1]}
                  match={match}
                />
              ) : null}
            </>
          ) : (
            "회원 정보가 없습니다"
          )}
        </div>
      </div>
      <div className="flex items-center justify-center gap-2">
        <div className="flex gap-1">
          <span>상태:</span>
          <span className={`${getStatusTextColorClassName(match.status)}`}>
            {상태_라벨[match.status]}
          </span>
        </div>
        {[
          MatchStatus.BACKLOG,
          MatchStatus.PREPARING,
          MatchStatus.PENDING,
          MatchStatus.BROKEN_UP,
        ]
          .filter((status) => status !== match.status)
          .map((status) => {
            return (
              <button
                key={status}
                className={`rounded-lg px-4 py-2 text-white ${getStatusButtonBackgroundClassName(
                  status,
                )}`}
                disabled={disabled}
                onClick={async () => {
                  if (status === MatchStatus.PENDING) {
                    await shiftToPending({ id: match.id });

                    return;
                  }

                  void updateStatus({
                    id: match.id,
                    status,
                  });
                }}
              >
                {상태_라벨[status]}
              </button>
            );
          })}
        <button
          className="rounded-lg bg-red-500 px-4 py-2 text-white"
          disabled={disabled}
          onClick={() => {
            const confirmed = window.confirm("정말 삭제하시겠습니까?");

            if (confirmed) {
              void deleteMatch({
                id: match.id,
              });
            }
          }}
        >
          삭제
        </button>
        {match.sentAt != null
          ? `제안: ${format(match.sentAt, "yyyy-MM-dd HH:mm")}`
          : null}
      </div>
    </div>
  );
}
