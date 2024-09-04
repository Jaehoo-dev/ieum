import { ReactElement } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { Layout } from "~/components/Layout";
import { TextInput } from "~/components/TextInput";
import { api } from "~/utils/api";

interface Form {
  targets: Array<{
    value: {
      name: string;
      phoneNumber: string; // "01012345678"
    };
  }>;
}

export function AlimtalkPage() {
  const {
    register,
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<Form>({
    defaultValues: { targets: [] },
  });
  const {
    fields: targetFields,
    remove: removeTarget,
    replace: replaceTargets,
  } = useFieldArray({
    control,
    name: "targets",
  });
  const { mutateAsync: sendAlimtalks } =
    api.adminMessageRouter.sendMatchAlimtalks.useMutation();
  const utils = api.useUtils();

  return (
    <div className="flex min-h-screen flex-col items-center gap-6">
      <h1 className="mt-2 text-2xl font-semibold">알림톡 보내기</h1>
      <form
        className="flex min-w-[480px] flex-col gap-6"
        onSubmit={handleSubmit(async ({ targets }) => {
          const confirmed = confirm("정말 보내시겠습니까?");

          if (!confirmed) {
            return;
          }

          const payload = targets.map((target) => {
            return {
              name: target.value.name,
              phoneNumber: target.value.phoneNumber,
            };
          });

          await sendAlimtalks(payload);

          alert("발송 완료!");
        })}
      >
        <button
          type="button"
          className="w-full rounded bg-gray-300 py-2"
          onClick={async () => {
            const members =
              await utils.basicMatchRouter.getPendingMatchMembers.fetch(
                undefined,
                { staleTime: 0 },
              );

            replaceTargets(
              members.map((member) => {
                return {
                  value: {
                    name: member.name,
                    phoneNumber: member.phoneNumber,
                  },
                };
              }),
            );
          }}
        >
          대기중 회원 불러오기
        </button>
        <div className="flex flex-col gap-2">
          <p>발송 목록</p>
          {targetFields.length > 0
            ? targetFields.map((field, index) => {
                return (
                  <div key={field.id} className="flex flex-row gap-2">
                    <TextInput
                      readOnly={true}
                      disabled={true}
                      {...register(`targets.${index}.value.name`)}
                    />
                    <TextInput
                      readOnly={true}
                      disabled={true}
                      error={
                        errors.targets?.[index]?.value?.phoneNumber != null
                      }
                      {...register(`targets.${index}.value.phoneNumber`, {
                        pattern: /^010[0-9]{8}$/,
                      })}
                    />
                    <button
                      type="button"
                      className="rounded bg-red-500 px-2 py-1 text-white"
                      onClick={() => {
                        removeTarget(index);
                      }}
                    >
                      삭제
                    </button>
                  </div>
                );
              })
            : "-"}
        </div>
        <button
          type="submit"
          className={`w-full rounded bg-blue-600 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50`}
          disabled={targetFields.length === 0 || isSubmitting}
        >
          {isSubmitting ? "발송 중.." : "보내기"}
        </button>
      </form>
    </div>
  );
}

AlimtalkPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
