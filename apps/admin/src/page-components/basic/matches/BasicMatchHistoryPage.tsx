import { useEffect, type ReactElement } from "react";
import { useRouter } from "next/router";
import { 상태_라벨 } from "@ieum/constants";
import { Gender, MatchStatus } from "@ieum/prisma";
import { format, subDays } from "date-fns";
import { Controller, useForm } from "react-hook-form";
import { match } from "ts-pattern";

import { BasicMemberCard } from "~/components/BasicMemberCard";
import { Layout } from "~/components/Layout";
import type { BasicMatchWithMembers } from "~/domains/basic/types";
import { api } from "~/utils/api";
import { RespondField } from "../components/RespondField";

interface Form {
  status: MatchStatus;
  name: string;
  from: Date;
  to: Date;
}

function formToParams(form: Form) {
  const { status, name, from, to, ...fields } = form;

  return {
    ...fields,
    status,
    name: name !== "" ? name : undefined,
    from: format(from, "yyyy-MM-dd"),
    to: format(to, "yyyy-MM-dd"),
  };
}

export function BasicMatchHistoryPage() {
  const router = useRouter();

  useEffect(() => {
    if (router.query.status == null) {
      router.replace({
        query: {
          ...router.query,
          status: MatchStatus.PENDING,
          from: format(subDays(new Date(), 1), "yyyy-MM-dd"),
          to: format(new Date(), "yyyy-MM-dd"),
        },
      });
    }
  }, [router.query.status]);

  const { control, getValues, register, handleSubmit } = useForm<Form>({
    values: {
      status: (router.query.status ?? MatchStatus.PENDING) as MatchStatus,
      from: new Date((router.query.from as string) ?? subDays(new Date(), 1)),
      to: new Date((router.query.to as string) ?? new Date()),
      name: (router.query.name as string) ?? "",
    },
  });

  const { data: matches = [] } = api.basicMatchRouter.findAll.useQuery(
    formToParams(getValues()),
    { enabled: router.query.status != null },
  );

  return (
    <div className="flex min-h-screen w-full flex-col items-center gap-4 py-2">
      <h1 className="text-2xl font-semibold">매칭 이력</h1>
      <form
        className="flex flex-col gap-2"
        onSubmit={handleSubmit((form) => {
          router.push({
            query: formToParams(form),
          });
        })}
      >
        <div className="flex items-center gap-2">
          <span>상태</span>
          <Controller
            control={control}
            name="status"
            render={({ field: { value, onChange } }) => {
              return (
                <select
                  className="rounded-lg border border-gray-200 px-1.5 py-1"
                  value={value}
                  onChange={(e) => {
                    onChange(e.target.value as MatchStatus);
                  }}
                >
                  {Object.values(MatchStatus).map((status) => {
                    return (
                      <option key={status} value={status}>
                        {상태_라벨[status]}
                      </option>
                    );
                  })}
                </select>
              );
            }}
          />
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
        <div className="flex flex-col gap-3">
          {matches.map((match) => {
            return (
              <div
                key={match.id}
                className="flex w-full flex-col items-center gap-3"
              >
                <Match match={match} />
                <div className="w-full border-b border-gray-200" />
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
        <div className="flex flex-1 flex-col items-center gap-1.5">
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
        {match.sentAt != null
          ? `제안: ${format(match.sentAt, "yyyy-MM-dd")}`
          : null}
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
