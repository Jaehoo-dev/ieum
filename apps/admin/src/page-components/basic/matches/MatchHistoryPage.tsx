import { useEffect } from "react";
import type { ReactElement } from "react";
import { useRouter } from "next/router";
import { 매치_유형, 상태_라벨, 지역_쿼리 } from "@ieum/constants";
import { MatchStatus } from "@ieum/prisma";
import { format, subDays } from "date-fns";
import { Controller, useForm } from "react-hook-form";

import { Layout } from "~/components/Layout";
import { api } from "~/utils/api";
import { BasicMatchField } from "./components/BasicMatchField";
import { MegaphoneMatchField } from "./components/MegaphoneMatchField";

interface Form {
  matchType: 매치_유형;
  region: 지역_쿼리;
  statuses: MatchStatus[];
  name: string;
  from: Date;
  to: Date;
}

function formToParams(form: Form) {
  const { statuses, name, from, to, ...fields } = form;

  return {
    ...fields,
    statuses: statuses.join(","),
    name: name !== "" ? name : undefined,
    from: format(from, "yyyy-MM-dd"),
    to: format(to, "yyyy-MM-dd"),
  };
}

function formToPayload(form: Form) {
  const { region, statuses, name, from, to, ...fields } = form;

  return {
    ...fields,
    region,
    statuses,
    name: name !== "" ? name : undefined,
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

export function MatchHistoryPage() {
  const router = useRouter();

  useEffect(() => {
    if (router.query.statuses == null) {
      router.replace({
        query: {
          ...router.query,
          region: 지역_쿼리.전체,
          matchType: 매치_유형.기본,
          statuses: MatchStatus.PENDING,
          from: format(subDays(new Date(), 1), "yyyy-MM-dd"),
          to: format(new Date(), "yyyy-MM-dd"),
        },
      });
    }
  }, [router, router.query.statuses]);

  const { control, getValues, register, handleSubmit } = useForm<Form>({
    defaultValues: {
      region: (router.query.region ?? 지역_쿼리.전체) as 지역_쿼리,
      matchType: (router.query.matchType ?? 매치_유형.기본) as 매치_유형,
      statuses:
        router.query.statuses != null
          ? ((router.query.statuses as string).split(",") as MatchStatus[])
          : [MatchStatus.PENDING],
      from: new Date((router.query.from as string) ?? subDays(new Date(), 1)),
      to: new Date((router.query.to as string) ?? new Date()),
      name: (router.query.name as string) ?? "",
    },
  });

  const { data: basicMatches = [] } = api.basicMatchRouter.findAll.useQuery(
    formToPayload(getValues()),
    {
      enabled:
        router.query.statuses != null &&
        router.query.matchType === 매치_유형.기본,
    },
  );
  const { data: megaphoneMatches = [] } =
    api.megaphoneMatchRouter.find.useQuery(formToPayload(getValues()), {
      enabled:
        router.query.statuses != null &&
        router.query.matchType === 매치_유형.확성기,
    });

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
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span>유형</span>
            <Controller
              control={control}
              name="matchType"
              render={({ field: { value, onChange } }) => {
                return (
                  <select
                    className="rounded-lg border border-gray-200 px-1.5 py-1"
                    value={value}
                    onChange={(e) => {
                      onChange(e.target.value as 매치_유형);
                    }}
                  >
                    {Object.values(매치_유형).map((matchType) => {
                      return (
                        <option key={matchType} value={matchType}>
                          {matchType}
                        </option>
                      );
                    })}
                  </select>
                );
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span>지역</span>
            <Controller
              control={control}
              name="region"
              render={({ field: { value, onChange } }) => {
                return (
                  <select
                    className="rounded-lg border border-gray-200 px-1.5 py-1"
                    value={value}
                    onChange={(e) => {
                      onChange(e.target.value as 매치_유형);
                    }}
                  >
                    <option value={지역_쿼리.전체}>전체</option>
                    <option value={지역_쿼리.수도권}>수도권</option>
                    <option value={지역_쿼리.충청}>충청</option>
                  </select>
                );
              }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>상태</span>
          <Controller
            control={control}
            name="statuses"
            render={({ field: { value, onChange } }) => {
              return (
                <div className="flex gap-2">
                  {Object.values(MatchStatus).map((status) => {
                    return (
                      <label key={status} className="flex gap-2">
                        <input
                          type="checkbox"
                          defaultChecked={value.includes(status)}
                          onChange={(e) => {
                            const { checked } = e.target;
                            onChange(
                              checked
                                ? [...value, status]
                                : value.filter((s) => s !== status),
                            );
                          }}
                        />
                        {상태_라벨[status]}
                      </label>
                    );
                  })}
                </div>
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
      {router.query.matchType === 매치_유형.확성기 ? (
        <>
          <span>{`${megaphoneMatches.length}개`}</span>
          {megaphoneMatches.length > 0 ? (
            <div className="flex flex-col gap-3">
              {megaphoneMatches.map((match) => {
                return (
                  <div
                    key={match.id}
                    className="flex w-full flex-col items-center gap-3"
                  >
                    <MegaphoneMatchField match={match} />
                    <div className="w-full border-b border-gray-200" />
                  </div>
                );
              })}
            </div>
          ) : (
            "없음"
          )}
        </>
      ) : (
        <>
          <span>{`${basicMatches.length}개`}</span>
          {basicMatches.length > 0 ? (
            <div className="flex flex-col gap-3">
              {basicMatches.map((match) => {
                return (
                  <div
                    key={match.id}
                    className="flex w-full flex-col items-center gap-3"
                  >
                    <BasicMatchField match={match} />
                    <div className="w-full border-b border-gray-200" />
                  </div>
                );
              })}
            </div>
          ) : (
            "없음"
          )}
        </>
      )}
    </div>
  );
}

MatchHistoryPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
