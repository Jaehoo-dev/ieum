import { ComponentPropsWithoutRef } from "react";
import { 지역_라벨 } from "@ieum/constants";
import { BlindMember, Gender } from "@ieum/prisma";

import { Loader } from "./Loader";

type TableMember = Pick<
  BlindMember,
  | "id"
  | "gender"
  | "nickname"
  | "region"
  | "birthYear"
  | "height"
  | "bodyShape"
  | "job"
>;

export function MembersTable({
  selfGender,
  members,
  isFetching,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage,
  onRowClick,
}: {
  selfGender: Gender;
  members: TableMember[];
  isFetching: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onFetchNextPage: () => void;
  onRowClick: (member: TableMember) => void;
}) {
  return (
    <div className="flex w-full flex-col border-b">
      <div className="border-b border-b-gray-300 p-1 pt-0 text-center text-sm font-medium text-gray-800">
        <div className="flex">
          <div className="w-1/3">닉네임</div>
          <div className="w-1/3">지역</div>
          <div className="w-1/3">키(cm)</div>
        </div>
        <div className="flex">
          <div className="w-1/3">직업</div>
          <div className="w-1/3">출생연도</div>
          <div className="w-1/3">체형</div>
        </div>
      </div>
      <div className="divide-y">
        {members.map((member, index) => {
          const 동성인가 = selfGender === member.gender;

          return (
            <div
              key={member.id}
              className={`p-2 text-center text-gray-700 ${
                동성인가
                  ? "bg-gray-100"
                  : `cursor-pointer hover:bg-blind-100 ${
                      index % 2 === 0 ? "bg-blind-100 bg-opacity-50" : ""
                    }`
              }`}
              onClick={() => {
                onRowClick(member);
              }}
              aria-disabled={selfGender === member.gender}
            >
              <div className="flex">
                <div className="w-1/3 truncate">{member.nickname}</div>
                <div className="w-1/3 truncate">{지역_라벨[member.region]}</div>
                <div className="w-1/3 truncate">{member.height}</div>
              </div>
              <div className="flex">
                <div className="w-1/3 truncate">{member.job}</div>
                <div className="w-1/3 truncate">{member.birthYear}</div>
                <div className="w-1/3 truncate">{member.bodyShape}</div>
              </div>
            </div>
          );
        })}
        <div className="flex justify-center p-3">
          {hasNextPage ? (
            <FetchMoreButton
              loading={isFetchingNextPage}
              onClick={onFetchNextPage}
              disabled={isFetching}
            />
          ) : (
            <span className="text-gray-600">-</span>
          )}
        </div>
      </div>
    </div>
  );
}

function FetchMoreButton({
  loading,
  ...props
}: ComponentPropsWithoutRef<"button"> & { loading: boolean }) {
  return (
    <button
      className="rounded-md bg-blind-500 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    >
      {loading ? <Loader size={6} color="white" /> : "더 보기"}
    </button>
  );
}
