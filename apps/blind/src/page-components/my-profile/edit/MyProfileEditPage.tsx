import { ReactElement, Suspense } from "react";
import { useRouter } from "next/router";
import { EXISTING_NICKNAME_ERROR_MESSAGE, 지역_라벨 } from "@ieum/constants";
import { assert, handleNullableStringNumber } from "@ieum/utils";
import { TRPCClientError } from "@trpc/client";
import { useForm } from "react-hook-form";

import { TextareaInput } from "~/components/form/TextareaInput";
import { TextInput } from "~/components/form/TextInput";
import { Layout } from "~/components/Layout";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";

export function MyProfileEditPage() {
  return (
    <Suspense>
      <Resolved />
    </Suspense>
  );
}

function Resolved() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const [profile] = api.blindMemberRouter.getProfile.useSuspenseQuery({
    memberId: member.id,
  });

  const {
    register,
    formState: { errors, isDirty, dirtyFields, isSubmitting },
    getValues,
    setError,
    clearErrors,
    handleSubmit,
  } = useForm({
    defaultValues: {
      nickname: profile.nickname,
      height: profile.height,
      bodyShape: profile.bodyShape,
      job: profile.job,
      selfIntroduction: profile.selfIntroduction,
    },
  });
  const utils = api.useUtils();
  const { mutateAsync: updateProfile } =
    api.blindMemberRouter.updateProfile.useMutation({
      onSuccess: () => {
        return utils.blindMemberRouter.getProfile.invalidate();
      },
    });
  const router = useRouter();

  return (
    <form
      className="mb-24 flex flex-col gap-5"
      onSubmit={handleSubmit(
        async ({ nickname, height, bodyShape, job, selfIntroduction }) => {
          try {
            await updateProfile({
              memberId: member.id,
              data: {
                nickname: dirtyFields.nickname ? nickname : undefined,
                height: dirtyFields.height ? height : undefined,
                bodyShape: dirtyFields.bodyShape ? bodyShape : undefined,
                job: dirtyFields.job ? job : undefined,
                selfIntroduction: dirtyFields.selfIntroduction
                  ? selfIntroduction
                  : undefined,
              },
            });
          } catch (err) {
            if (
              err instanceof TRPCClientError &&
              err.data.code === "CONFLICT" &&
              err.message === EXISTING_NICKNAME_ERROR_MESSAGE
            ) {
              setError("nickname", {
                message: "이미 사용 중인 닉네임입니다.",
              });

              alert("닉네임이 이미 사용 중입니다.");

              return;
            }

            throw err;
          }

          router.push("/my-profile");
        },
      )}
    >
      <div className="flex w-full flex-row items-end gap-2">
        <TextInput
          label="닉네임"
          {...register("nickname", {
            required: true,
            onChange: () => {
              clearErrors("nickname");
            },
          })}
          error={errors.nickname != null}
          errorText={errors.nickname?.message}
          required={true}
        />
        <button
          type="button"
          className="rounded-lg border border-blind-500 px-4 py-2 font-medium text-blind-500 disabled:cursor-not-allowed disabled:border-blind-300 disabled:text-blind-300"
          onClick={async () => {
            const isAvailable =
              await utils.blindMemberRouter.isNicknameAvailable.fetch({
                nickname: getValues("nickname"),
              });

            if (!isAvailable) {
              setError("nickname", {
                message: "이미 사용 중인 닉네임입니다.",
              });

              return;
            }

            alert("사용 가능한 닉네임입니다.");
          }}
          disabled={!dirtyFields.nickname}
        >
          중복 확인
        </button>
      </div>
      <div className="flex gap-2">
        <TextInput
          label="출생연도"
          value={profile.birthYear}
          disabled={true}
          required={true}
        />
        <TextInput
          label="지역"
          value={지역_라벨[profile.region]}
          disabled={true}
          required={true}
        />
      </div>
      <TextInput
        label="키"
        required={true}
        placeholder="예) 175"
        error={errors.height != null}
        errorText={errors.height?.message}
        {...register("height", {
          required: true,
          setValueAs: handleNullableStringNumber,
          validate: (value) => {
            if (value == null) {
              return "키를 입력해주세요.";
            }

            if (value < 140 || value > 200) {
              return "키를 확인해주세요.";
            }
          },
        })}
      />
      <TextInput
        label="체형"
        required={true}
        placeholder="예) 마른, 슬림탄탄, 보통, 통통 등"
        error={errors.bodyShape != null}
        errorText={errors.bodyShape?.message}
        {...register("bodyShape", {
          required: true,
        })}
      />
      <TextInput
        label="직장/직무"
        description="수정하면 직장 인증이 초기화됩니다."
        required={true}
        placeholder="예) 삼성전자 해외영업, 자동차기업 엔지니어"
        error={errors.job != null}
        errorText={errors.job?.message}
        {...register("job", {
          required: true,
        })}
      />
      <TextareaInput
        label="자기소개"
        required={true}
        error={errors.selfIntroduction != null}
        errorText={errors.selfIntroduction?.message}
        rows={5}
        {...register("selfIntroduction", {
          required: true,
        })}
      />
      <div className="fixed bottom-0 left-0 flex w-full items-center justify-center border-t border-gray-200 bg-white p-4 md:px-6">
        <div className="w-full max-w-lg px-2">
          <button
            className="w-full rounded-lg bg-blind-500 p-3 text-xl font-medium text-white hover:bg-blind-600 disabled:cursor-not-allowed disabled:bg-blind-300"
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
  return <Layout title="프로필 수정">{page}</Layout>;
};
