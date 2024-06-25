import { useState } from "react";
import type { ReactElement } from "react";
import { MemberStatus } from "@ieum/prisma";
import { isEmptyStringOrNil } from "@ieum/utils";
import { useForm } from "react-hook-form";
import { match } from "ts-pattern";

import { BasicMemberCard } from "~/components/BasicMemberCard";
import { Layout } from "~/components/Layout";
import { TextInput } from "~/components/TextInput";
import { api } from "~/utils/api";

export function BasicMembersSearchPage() {
  const { mutateAsync: sendMatchNotiMessage } =
    api.adminMessageRouter.sendMatchNotiMessage.useMutation();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: "",
    },
  });
  const [searchValue, setSearchValue] = useState("");
  const { data: members } = api.basicMemberRouter.searchByName.useQuery(
    { name: searchValue },
    { enabled: !isEmptyStringOrNil(searchValue) },
  );
  const utils = api.useUtils();
  const { mutateAsync: activate, isPending: isActivating } =
    api.basicMemberRouter.activate.useMutation({
      onSuccess: () => {
        return utils.basicMemberRouter.invalidate();
      },
    });
  const { mutateAsync: inactivate, isPending: isInactivating } =
    api.basicMemberRouter.inactivate.useMutation({
      onSuccess: () => {
        return utils.basicMemberRouter.invalidate();
      },
    });
  const { mutateAsync: softDelete, isPending: isSoftDeleting } =
    api.basicMemberRouter.softDelete.useMutation({
      onSuccess: () => {
        return utils.basicMemberRouter.invalidate();
      },
    });
  const { mutateAsync: hardDelete, isPending: isHardDeleting } =
    api.basicMemberRouter.hardDelete.useMutation({
      onSuccess: () => {
        return utils.basicMemberRouter.invalidate();
      },
    });

  const isInAction = isInactivating || isSoftDeleting || isHardDeleting;

  return (
    <div className="mt-6 flex min-h-screen flex-col items-center gap-6 py-2">
      <h1 className="text-4xl font-semibold">베이직 회원 검색</h1>
      <div className="flex w-full flex-col items-center gap-8">
        <form
          className="flex items-end gap-2"
          onSubmit={handleSubmit(({ name }) => {
            setSearchValue(name);
          })}
        >
          <TextInput
            label="이름"
            {...register("name", {
              required: true,
            })}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={true}
          />
          <button className="rounded-md bg-blue-500 px-4 py-2 text-white">
            검색
          </button>
        </form>
        <div className="flex w-full flex-col items-center gap-4">
          {members != null && members.length > 0
            ? members.map((member) => {
                return (
                  <div
                    key={member.id}
                    className="flex w-full flex-row justify-center gap-2"
                  >
                    <div className="flex flex-col gap-2">
                      <span>
                        {`회원 상태: ${getStatusLabel(member.status)}`}
                      </span>
                      <button
                        className="rounded-md bg-blue-500 px-4 py-2 text-white"
                        onClick={async () => {
                          await activate({ id: member.id });
                        }}
                        disabled={isInAction}
                      >
                        Activate
                      </button>
                      <button
                        className="rounded-md bg-gray-500 px-4 py-2 text-white"
                        onClick={async () => {
                          await inactivate({ id: member.id });
                          alert("휴면 처리 완료");
                        }}
                        disabled={isInAction}
                      >
                        Inactivate
                      </button>
                      <button
                        className="rounded-md bg-yellow-500 px-4 py-2 text-white"
                        onClick={async () => {
                          const confirmed =
                            confirm("정말로 탈퇴 처리하시겠습니까?");

                          if (confirmed) {
                            await softDelete({ id: member.id });
                            alert("탈퇴 처리 완료");
                          }
                        }}
                        disabled={isInAction}
                      >
                        Soft Delete
                      </button>
                      <button
                        className="rounded-md bg-red-500 px-4 py-2 text-white"
                        onClick={async () => {
                          const confirmed = confirm("정말로 삭제하시겠습니까?");

                          if (confirmed) {
                            await hardDelete({ id: member.id });
                            alert("데이터 삭제 완료");
                          }
                        }}
                        disabled={isInAction}
                      >
                        Hard Delete
                      </button>
                    </div>
                    <BasicMemberCard member={member} defaultMode="DETAILED" />
                    {member.status === MemberStatus.ACTIVE ? (
                      <div>
                        <button
                          className="rounded-md bg-blue-500 px-4 py-2 text-white"
                          onClick={async () => {
                            await sendMatchNotiMessage({ memberId: member.id });

                            alert("문자를 보냈습니다.");
                          }}
                        >
                          문자 보내기
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              })
            : "검색 결과가 없습니다."}
        </div>
      </div>
    </div>
  );
}

function getStatusLabel(status: MemberStatus) {
  return match(status)
    .with(MemberStatus.ACTIVE, () => "활동중")
    .with(MemberStatus.INACTIVE, () => "휴면")
    .with(MemberStatus.DELETED, () => "탈퇴")
    .exhaustive();
}

BasicMembersSearchPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
