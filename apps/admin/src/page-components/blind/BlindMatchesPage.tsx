import { useState } from "react";
import type { ReactElement } from "react";
import { 상태_라벨 } from "@ieum/constants";
import type { BlindMatch, BlindMember } from "@ieum/prisma";
import { MatchStatus } from "@ieum/prisma";
import { assert } from "@ieum/utils";
import { format } from "date-fns";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { match } from "ts-pattern";

import { BlindMemberCard } from "~/components/blind/BlindMemberCard";
import { Layout } from "~/components/Layout";
import { api } from "~/utils/api";

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

export function BlindMatchesPage() {
  const { control, getValues, register, handleSubmit } = useForm<Form>({
    defaultValues: {
      statuses: [{ value: "PREPARING" }, { value: "PENDING" }],
      name: "",
      from: new Date(),
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
    api.blindMatchRouter.findAll.useQuery(queryParams);

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

type BlindMatchWithMembers = BlindMatch & {
  members: BlindMember[];
};

function Match({ match }: { match: BlindMatchWithMembers }) {
  const utils = api.useUtils();
  const { mutateAsync: updateStatus } =
    api.blindMatchRouter.updateStatus.useMutation({
      onSuccess: () => {
        return utils.blindMatchRouter.invalidate();
      },
    });

  assert(
    match.members.length === 2 &&
      match.members[0] != null &&
      match.members[1] != null,
    "match.members.length must be 2",
  );

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full gap-4">
        <BlindMemberCard member={match.members[0]} />
        <BlindMemberCard member={match.members[1]} />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <span>상태:</span>
          <span className={`${getStatusTextColorClassName(match.status)}`}>
            {상태_라벨[match.status]}
          </span>
        </div>
        {Object.values(MatchStatus).map((status) => {
          return (
            <button
              key={status}
              className={`rounded-lg px-4 py-2 text-white ${getStatusButtonBackgroundClassName(
                status,
                status === match.status,
              )}`}
              disabled={status === match.status}
              onClick={async () => {
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

function getStatusButtonBackgroundClassName(
  status: MatchStatus,
  disabled: boolean,
) {
  return match(status)
    .with("BACKLOG", () => {
      return disabled ? "bg-yellow-900" : "bg-yellow-600";
    })
    .with("PREPARING", () => {
      return disabled ? "bg-gray-200" : "bg-gray-600";
    })
    .with("PENDING", () => {
      return disabled ? "bg-yellow-200" : "bg-yellow-400";
    })
    .with("REJECTED", () => {
      return disabled ? "bg-red-200" : "bg-red-500";
    })
    .with("ACCEPTED", () => {
      return disabled ? "bg-green-200" : "bg-green-500";
    })
    .with("BROKEN_UP", () => {
      return disabled ? "bg-gray-700" : "bg-black";
    })
    .exhaustive();
}

BlindMatchesPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
