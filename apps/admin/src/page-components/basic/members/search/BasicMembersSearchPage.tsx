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
        <div className="flex w-full justify-center">
          {members?.map((member) => {
            return (
              <div
                key={member.id}
                className="flex w-full flex-row justify-center gap-2"
              >
                <BasicMemberCard member={member} defaultMode="DETAILED" />
                <div className="flex flex-col gap-2">
                  <span>{`회원 상태: ${getStatusLabel(member.status)}`}</span>
                  <button
                    className="rounded-md bg-gray-500 px-4 py-2 text-white"
                    onClick={() => inactivate({ id: member.id })}
                    disabled={isInAction}
                  >
                    Inactivate
                  </button>
                  <button
                    className="rounded-md bg-yellow-500 px-4 py-2 text-white"
                    onClick={() => softDelete({ id: member.id })}
                    disabled={isInAction}
                  >
                    Soft Delete
                  </button>
                  <button
                    className="rounded-md bg-red-500 px-4 py-2 text-white"
                    onClick={async () => {
                      const confirmed =
                        confirm("정말로 하드 삭제하시겠습니까?");

                      if (confirmed) {
                        await hardDelete({ id: member.id });
                      }
                    }}
                    disabled={isInAction}
                  >
                    Hard Delete
                  </button>
                </div>
              </div>
            );
          })}
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
