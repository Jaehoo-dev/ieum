import { useState } from "react";
import type { ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { 상태_라벨 } from "@ieum/constants";
import type { BasicMatchV2 } from "@ieum/prisma";
import { Gender, MatchStatus } from "@ieum/prisma";
import { assert, isEmptyStringOrNil } from "@ieum/utils";
import { format, subDays } from "date-fns";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { match } from "ts-pattern";

import { BasicMemberCard } from "~/components/BasicMemberCard";
import { Layout } from "~/components/Layout";
import { api } from "~/utils/api";
import { RespondField } from "../../components/RespondField";

interface Form {
  statuses: { value: MatchStatus }[];
  from: Date;
  to: Date;
}

function formToQuery(form: Form) {
  const { statuses, from, to, ...fields } = form;

  return {
    ...fields,
    statuses:
      statuses.length > 0
        ? statuses.map((status) => {
            return status.value;
          })
        : undefined,
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

export function BasicMemberMatchHistoryPage() {
  const router = useRouter();
  const basicMemberId = router.query.basicMemberId as string;
  const { data: basicMember } = api.basicMemberRouter.findById.useQuery(
    { id: basicMemberId },
    { enabled: !isEmptyStringOrNil(basicMemberId) },
  );
  const { control, getValues, handleSubmit } = useForm<Form>({
    defaultValues: {
      statuses: [
        { value: "BACKLOG" },
        { value: "PREPARING" },
        { value: "PENDING" },
      ],
      from: subDays(new Date(), 13),
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
  const { data: matches = [] } = api.basicMatchRouter.findByMemberId.useQuery(
    { memberId: basicMemberId, params: queryParams },
    { enabled: !isEmptyStringOrNil(basicMemberId) },
  );

  return (
    <div className="flex min-h-screen w-full flex-col items-center gap-4 py-2">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold">
          {basicMember != null ? (
            <span
              className={`${
                basicMember.gender === Gender.MALE
                  ? "text-blue-500"
                  : "text-pink-500"
              }`}
            >
              {basicMember.name}
            </span>
          ) : null}
          <span>{" 님의 매칭 이력"}</span>
        </h1>
        <Link
          href={`/basic/members/${basicMemberId}/matchmaker`}
          className="text-blue-600 hover:underline"
        >
          {"매칭 >"}
        </Link>
      </div>
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
        <button className="rounded-lg bg-blue-500 px-4 py-2 text-white">
          검색
        </button>
      </form>
      <div className="grid w-full grid-cols-2 gap-3">
        <div className="flex justify-end">
          {basicMember == null ? (
            "loading"
          ) : (
            <BasicMemberCard member={basicMember} defaultMode="DETAILED" />
          )}
        </div>
        <div className="flex h-[calc(100vh-240px)] flex-1 flex-col items-center gap-3 overflow-y-auto ">
          {matches.map((match) => {
            const [member1, member2] = [
              ...match.pendingByV2,
              ...match.rejectedByV2,
              ...match.acceptedByV2,
            ];

            assert(
              member1 != null && member2 != null,
              "members must not be null",
            );

            const matchedMember =
              member1.id === basicMemberId ? member2 : member1;

            return (
              <div
                key={matchedMember.id}
                className="flex w-full flex-col gap-1.5"
              >
                <div className="flex w-full gap-3">
                  <BasicMemberCard member={matchedMember} />
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-1">
                      <span>상태:</span>
                      <span
                        className={`${getStatusTextColorClassName(
                          match.status,
                        )}`}
                      >
                        {상태_라벨[match.status]}
                      </span>
                    </div>
                    <StatusButtons match={match} />
                  </div>
                </div>
                {match.status === MatchStatus.PENDING ? (
                  <div className="flex items-center gap-10">
                    <div className="flex items-center gap-1">
                      <span className="text-2xl">👈</span>
                      <RespondField actionMember={basicMember!} match={match} />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl">👆</span>
                      <RespondField
                        actionMember={matchedMember}
                        match={match}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatusButtons({ match }: { match: BasicMatchV2 }) {
  const utils = api.useUtils();
  const { mutateAsync: updateStatus, isPending: isUpdatePending } =
    api.basicMatchRouter.updateStatus.useMutation({
      onSuccess: () => {
        return Promise.all([
          utils.basicMatchRouter.invalidate(),
          utils.basicMemberRouter.invalidate(),
        ]);
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
        return Promise.all([
          utils.basicMatchRouter.invalidate(),
          utils.basicMemberRouter.invalidate(),
        ]);
      },
    });

  const disabled =
    isUpdatePending || isShiftingToPendingPending || isDeletePending;

  return (
    <div className="flex flex-col gap-2">
      {[
        MatchStatus.BACKLOG,
        MatchStatus.PREPARING,
        MatchStatus.PENDING,
        MatchStatus.BROKEN_UP,
      ]
        .filter((status) => match.status !== status)
        .map((status) => {
          return (
            <button
              key={`${match.id}-${status}`}
              className={`rounded-lg px-4 py-2 text-white ${getStatusButtonBackgroundClassName(
                status,
              )}`}
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
              disabled={disabled}
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
  );
}

function getStatusTextColorClassName(status: MatchStatus) {
  return match(status)
    .with("BACKLOG", () => "text-yellow-900")
    .with("PREPARING", () => "text-gray-500")
    .with("PENDING", () => "text-yellow-500")
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
      return "bg-gray-500";
    })
    .with("PENDING", () => {
      return "bg-yellow-400";
    })
    .with("BROKEN_UP", () => {
      return "bg-black";
    })
    .with("REJECTED", "ACCEPTED", () => {
      throw new Error("invalid status");
    })
    .exhaustive();
}

BasicMemberMatchHistoryPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
