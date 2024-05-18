import { useState } from "react";
import type { ReactElement } from "react";
import { 상태_라벨 } from "@ieum/labels";
import { Gender, MatchStatus } from "@ieum/prisma";
import { format, subDays } from "date-fns";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { match } from "ts-pattern";

import { BasicMemberCard } from "~/components/BasicMemberCard";
import { Layout } from "~/components/Layout";
import type { BasicMatchWithMembers } from "~/domains/basic/types";
import { api } from "~/utils/api";
import { RespondField } from "../components/RespondField";

interface Form {
  statuses: { value: MatchStatus }[];
  name: string;
  from: Date;
  to: Date;
}

function formToQuery(form: Form) {
  const { statuses, name, from, to, ...fields } = form;

  return {
    ...fields,
    statuses:
      statuses.length > 0
        ? statuses.map((status) => {
            return status.value;
          })
        : undefined,
    name: name !== "" ? name : undefined,
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

export function BasicMatchHistoryPage() {
  const { control, getValues, register, handleSubmit } = useForm<Form>({
    defaultValues: {
      statuses: [{ value: "PREPARING" }],
      name: "",
      from: subDays(new Date(), 6),
      to: new Date(),
    },
  });
  const {
    fields: statusFields,
    append: appendStatus,
    remove: removeStatus,
  } = useFieldArray({
    control,
    name: "statuses",
  });
  const [queryParams, setQueryParams] = useState(formToQuery(getValues()));
  const { data: matches = [] } =
    api.basicMatchRouter.findAll.useQuery(queryParams);

  return (
    <div className="flex min-h-screen w-full flex-col items-center gap-6">
      <h1 className="text-4xl font-semibold">매칭 이력</h1>
      <form
        className="flex flex-col gap-2"
        onSubmit={handleSubmit((form) => {
          setQueryParams(formToQuery(form));
        })}
      >
        <span>필터</span>
        <div className="flex gap-2">
          {Object.values(MatchStatus).map((status) => {
            return (
              <label key={status} className="flex gap-2">
                <input
                  type="checkbox"
                  checked={statusFields.some((field) => {
                    return field.value === status;
                  })}
                  onChange={(e) => {
                    if (e.target.checked) {
                      appendStatus({ value: status });
                    } else {
                      removeStatus(
                        statusFields.findIndex((field) => {
                          return field.value === status;
                        }),
                      );
                    }
                  }}
                />
                {상태_라벨[status]}
              </label>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <span>날짜</span>
          <Controller
            control={control}
            name="from"
            render={({ field: { value, onChange } }) => {
              return (
                <input
                  type="date"
                  className="rounded-lg border border-gray-200 px-2 py-0.5"
                  value={format(value, "yyyy-MM-dd")}
                  onChange={(e) => {
                    onChange(new Date(e.target.value));
                  }}
                />
              );
            }}
          />
          <span>~</span>
          <Controller
            control={control}
            name="to"
            render={({ field: { value, onChange } }) => {
              return (
                <input
                  type="date"
                  className="rounded-lg border border-gray-200 px-2 py-0.5"
                  value={format(value, "yyyy-MM-dd")}
                  onChange={(e) => {
                    onChange(new Date(e.target.value));
                  }}
                />
              );
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <span>이름</span>
          <input
            type="text"
            className="rounded-lg border border-gray-200 px-2 py-0.5"
            {...register("name")}
          />
        </div>
        <button className="rounded-lg bg-blue-500 px-4 py-2 text-white">
          검색
        </button>
      </form>
      <span>{`${matches.length}개`}</span>
      {matches.length > 0 ? (
        <div className="flex flex-col gap-4">
          {matches.map((match) => {
            return (
              <div
                key={match.id}
                className="flex w-full flex-col items-center gap-4"
              >
                <Match match={match} />
                <div className="w-full border-b border-gray-200"></div>
              </div>
            );
          })}
        </div>
      ) : (
        "없음"
      )}
    </div>
  );
}

function Match({ match }: { match: BasicMatchWithMembers }) {
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
    ...match.pendingBy,
    ...match.rejectedBy,
    ...match.acceptedBy,
  ];

  const matchMembersSortedByGender = [...matchMembers].sort((a) => {
    return a.gender === Gender.MALE ? -1 : 1;
  });

  const disabled =
    isUpdatePending || isShiftingToPendingPending || isDeletePending;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full gap-4">
        <div className="flex flex-1 flex-col items-center gap-2">
          {matchMembersSortedByGender[0] != null ? (
            <>
              <BasicMemberCard member={matchMembersSortedByGender[0]} />
              {match.status === "PENDING" || match.status === "REJECTED" ? (
                <RespondField
                  actionMember={matchMembersSortedByGender[0]}
                  match={match}
                />
              ) : null}
            </>
          ) : (
            "회원 정보가 없습니다"
          )}
        </div>
        <div className="flex flex-1 flex-col items-center gap-2">
          {matchMembersSortedByGender[1] != null ? (
            <>
              <BasicMemberCard member={matchMembersSortedByGender[1]} />
              {match.status === "PENDING" || match.status === "REJECTED" ? (
                <RespondField
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
      </div>
    </div>
  );
}

function getStatusTextColorClassName(status: MatchStatus) {
  return match(status)
    .with("BACKLOG", () => "text-yellow-900")
    .with("PREPARING", () => "text-gray-500")
    .with("PENDING", () => "text-yellow-400")
    .with("REJECTED", () => "text-red-500")
    .with("ACCEPTED", () => "text-green-500")
    .with("BROKEN_UP", () => "text-black")
    .exhaustive();
}

function getStatusButtonBackgroundClassName(status: MatchStatus) {
  return match(status)
    .with("BACKLOG", () => {
      return "bg-yellow-900";
    })
    .with("PREPARING", () => {
      return "bg-gray-600";
    })
    .with("PENDING", () => {
      return "bg-yellow-400";
    })
    .with("REJECTED", () => {
      return "bg-red-500";
    })
    .with("ACCEPTED", () => {
      return "bg-green-500";
    })
    .with("BROKEN_UP", () => {
      return "bg-black";
    })
    .exhaustive();
}

BasicMatchHistoryPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
