import { 상태_라벨 } from "@ieum/constants";
import { MatchStatus, MegaphoneMatchMemberStatus } from "@ieum/prisma";
import { assert } from "@ieum/utils";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { format } from "date-fns";

import { BasicMemberCard } from "~/components/BasicMemberCard";
import type { MegaphoneMatchWithMembers } from "~/domains/basic/types";
import { api } from "~/utils/api";
import { getStatusButtonBackgroundClassName } from "../utils/getStatusButtonBackgroundClassName";
import { getStatusTextColorClassName } from "../utils/getStatusTextColorClassName";

interface Props {
  match: MegaphoneMatchWithMembers;
}

export function MegaphoneMatchField({ match }: Props) {
  const {
    id: matchId,
    sender,
    receiver,
    senderStatus,
    receiverStatus,
    sentToSenderAt,
    sentToReceiverAt,
    status: matchStatus,
  } = match;

  assert(sentToReceiverAt == null || receiverStatus != null);
  assert(sentToSenderAt == null || senderStatus != null);

  const utils = api.useUtils();
  const { mutateAsync: updateSenderStatus } =
    api.megaphoneMatchRouter.updateSenderStatus.useMutation({
      onSuccess: () => {
        return utils.megaphoneMatchRouter.invalidate();
      },
    });
  const { mutateAsync: updateReceiverStatus } =
    api.megaphoneMatchRouter.updateReceiverStatus.useMutation({
      onSuccess: () => {
        return utils.megaphoneMatchRouter.invalidate();
      },
    });
  const { mutateAsync: initiateSender } =
    api.megaphoneMatchRouter.initiateSender.useMutation({
      onSuccess: () => {
        return utils.megaphoneMatchRouter.invalidate();
      },
    });
  const { mutateAsync: initiateReceiver } =
    api.megaphoneMatchRouter.initiateReceiver.useMutation({
      onSuccess: () => {
        return utils.megaphoneMatchRouter.invalidate();
      },
    });
  const { mutateAsync: updateMatchStatus } =
    api.megaphoneMatchRouter.updateMatchStatus.useMutation({
      onSuccess: () => {
        return utils.megaphoneMatchRouter.invalidate();
      },
    });
  const { mutateAsync: deleteMatch } =
    api.megaphoneMatchRouter.delete.useMutation({
      onSuccess: () => {
        return utils.megaphoneMatchRouter.invalidate();
      },
    });

  return (
    <div className="flex w-full flex-col gap-2 text-sm">
      <div className="flex w-full gap-2">
        <div className="flex flex-1 flex-col items-center gap-1.5">
          <BasicMemberCard member={sender} />
          {sentToSenderAt != null ? (
            <div className="flex flex-row items-center gap-2">
              <MegaphoneMatchMemberStatusSelect
                value={senderStatus!}
                onChange={(status) => {
                  updateSenderStatus({ matchId, status });
                }}
              />
              <span>sentAt: {format(sentToSenderAt, "yyyy-MM-dd HH:mm")}</span>
            </div>
          ) : receiverStatus === MegaphoneMatchMemberStatus.ACCEPTED ? (
            <button
              className={`rounded-lg px-4 py-2 text-white ${getStatusButtonBackgroundClassName(
                MatchStatus.PENDING,
              )}`}
              onClick={async () => {
                await initiateSender({ matchId });
              }}
            >
              대기중
            </button>
          ) : null}
        </div>
        <div className="flex items-center">
          <ArrowForwardIcon fontSize="large" className="text-gray-500" />
        </div>
        <div className="flex flex-1 flex-col items-center gap-1.5">
          <BasicMemberCard member={receiver} />
          {sentToReceiverAt != null ? (
            <div className="flex flex-row items-center gap-2">
              <MegaphoneMatchMemberStatusSelect
                value={receiverStatus!}
                onChange={(status) => {
                  updateReceiverStatus({ matchId, status });
                }}
              />
              <span>
                sentAt: {format(sentToReceiverAt, "yyyy-MM-dd HH:mm")}
              </span>
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex items-center justify-center gap-2">
        <div className="flex gap-1">
          <span>상태:</span>
          <span className={`${getStatusTextColorClassName(match.status)}`}>
            {상태_라벨[matchStatus]}
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
                onClick={async () => {
                  if (status === MatchStatus.PENDING) {
                    await initiateReceiver({ matchId });

                    return;
                  }

                  await updateMatchStatus({
                    matchId,
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
          onClick={() => {
            const confirmed = window.confirm("정말 삭제하시겠습니까?");

            if (confirmed) {
              void deleteMatch({ matchId });
            }
          }}
        >
          삭제
        </button>
      </div>
    </div>
  );
}

function MegaphoneMatchMemberStatusSelect({
  value,
  onChange,
}: {
  value: MegaphoneMatchMemberStatus;
  onChange: (value: MegaphoneMatchMemberStatus) => void;
}) {
  return (
    <select
      className="rounded-lg border border-gray-200 p-1"
      value={value}
      onChange={({ target: { value } }) => {
        onChange(value as MegaphoneMatchMemberStatus);
      }}
    >
      {Object.values(MegaphoneMatchMemberStatus).map(
        (megaphoneMatchMemberStatus) => {
          return (
            <option
              key={megaphoneMatchMemberStatus}
              value={megaphoneMatchMemberStatus}
            >
              {megaphoneMatchMemberStatus}
            </option>
          );
        },
      )}
    </select>
  );
}
