import { ReactElement, Suspense, useEffect } from "react";
import { useRouter } from "next/router";
import { assert, isEmptyStringOrNil } from "@ieum/utils";
import { useForm } from "react-hook-form";

import { Layout } from "~/components/Layout";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";
import { formatUniqueMemberName } from "~/utils/formatUniqueMemberName";

export function MyProfileEditPage() {
  return (
    <div className="flex flex-col gap-4">
      <Description />
      <Suspense>
        <Resolved />
      </Suspense>
    </div>
  );
}

function Description() {
  return (
    <div className="flex w-full items-start gap-1">
      <p className="text-sm text-gray-700">※</p>
      <p className="text-sm text-gray-700">
        인적사항과 사진은 호스트에게 수정을 요청해주세요.
      </p>
    </div>
  );
}

function Resolved() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const { sendMessage } = useSlackNotibot();

  useEffect(() => {
    void sendMessage(
      `${formatUniqueMemberName(member)} - 내 프로필 수정 페이지 진입`,
    );
  }, [member.name, sendMessage]);

  const [profile] =
    api.basicMemberProfileRouter.getProfileByMemberId.useSuspenseQuery({
      memberId: member.id,
    });

  assert(profile != null, "profile should not be null");

  const {
    register,
    formState: { isDirty, dirtyFields, isSubmitting },
    handleSubmit,
  } = useForm({
    defaultValues: {
      selfIntroduction: profile.selfIntroduction,
      idealTypeDescription: profile.idealTypeDescription,
    },
  });
  const { mutateAsync: updateProfile } =
    api.basicMemberProfileRouter.updateProfile.useMutation();
  const router = useRouter();

  return (
    <form
      className="mb-24 flex flex-col gap-6"
      onSubmit={handleSubmit(
        async ({ selfIntroduction, idealTypeDescription }) => {
          sendMessage(
            `${formatUniqueMemberName(member)} - 내 프로필 수정 저장 클릭`,
          );

          const confirmed = confirm("수정사항을 저장하시겠습니까?");

          if (!confirmed) {
            return;
          }

          await updateProfile({
            memberId: member.id,
            data: {
              selfIntroduction: dirtyFields.selfIntroduction
                ? selfIntroduction
                : undefined,
              idealTypeDescription: dirtyFields.idealTypeDescription
                ? idealTypeDescription
                : undefined,
            },
          });

          router.replace("/my-profile");
        },
      )}
    >
      <label className="flex flex-col gap-1">
        <span className="text-lg font-semibold">자기소개</span>
        <textarea
          className="w-full rounded-lg border border-gray-300 p-4 outline-primary-500"
          rows={12}
          {...register("selfIntroduction", {
            setValueAs: (value: string | null) => {
              return isEmptyStringOrNil(value) ? null : value;
            },
          })}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-lg font-semibold">만나고 싶은 이성상</span>
        <textarea
          className="w-full rounded-lg border border-gray-300 p-4 outline-primary-500"
          rows={8}
          {...register("idealTypeDescription", {
            setValueAs: (value: string | null) => {
              return isEmptyStringOrNil(value) ? null : value;
            },
          })}
        />
      </label>
      <div className="fixed bottom-0 left-0 flex w-full items-center justify-center border-t border-gray-200 bg-white p-4 md:px-6">
        <div className="w-full max-w-lg px-2">
          <button
            className="w-full rounded-lg bg-primary-500 p-3 text-xl font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
            disabled={!isDirty || isSubmitting}
          >
            {isSubmitting ? "저장 중.." : "저장"}
          </button>
        </div>
      </div>
    </form>
  );
}

MyProfileEditPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="내 프로필 수정">{page}</Layout>;
};
