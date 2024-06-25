import { ReactElement } from "react";
import { MATCHMAKER_URL } from "@ieum/constants";
import { isEmptyStringOrNil } from "@ieum/utils";
import { useFieldArray, useForm } from "react-hook-form";

import { Layout } from "~/components/Layout";
import { TextareaInput } from "~/components/TextareaInput";
import { TextInput } from "~/components/TextInput";
import { api } from "~/utils/api";

const 제목_기본값 = "이음 매칭 안내";
const 내용_기본값 = `안녕하세요! 이음 호스트입니다. 매칭 제안드려요 :)

아래 사이트에서 상대방 프로필을 확인하시고 *24시간 안에* 수락 여부를 결정해주세요.
${MATCHMAKER_URL}

양쪽 모두 수락하시면 소개가 성사되며 호스트가 연락을 드립니다.

감사합니다!

자주 묻는 질문
https://ieum.love/faq`;

interface Form {
  subject: string;
  text: string;
  targets: Array<{
    value: {
      name: string;
      phoneNumber: string; // "01012345678"
    };
  }>;
}

export function MessagingPage() {
  const {
    register,
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<Form>({
    defaultValues: {
      subject: 제목_기본값,
      text: 내용_기본값,
      targets: [],
    },
  });
  const {
    fields: targetFields,
    remove: removeTarget,
    replace: replaceTargets,
  } = useFieldArray({
    control,
    name: "targets",
  });
  const { mutateAsync: sendMessages } =
    api.adminMessageRouter.sendMessages.useMutation();
  const utils = api.useUtils();

  return (
    <div className="flex min-h-screen flex-col items-center gap-6">
      <h1 className="text-4xl font-semibold">메시지 보내기</h1>
      <form
        className="flex min-w-[480px] flex-col gap-6"
        onSubmit={handleSubmit(async ({ targets, subject, text }) => {
          const confirmed = confirm("정말 보내시겠습니까?");

          if (!confirmed) {
            return;
          }

          const payload = targets.map((target) => {
            return {
              to: target.value.phoneNumber,
              subject: !isEmptyStringOrNil(subject) ? subject : undefined,
              text: text,
            };
          });

          await sendMessages(payload);

          alert("발송 완료!");
        })}
      >
        <TextInput label="제목" {...register("subject")} />
        <TextareaInput label="내용" rows={10} {...register("text")} />
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
                      {...register(`targets.${index}.value.name`)}
                    />
                    <TextInput
                      readOnly={true}
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

MessagingPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
