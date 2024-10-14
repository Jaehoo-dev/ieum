import Link from "next/link";
import { IEUM_BLIND_HOME_URL } from "@ieum/constants";
import { assert } from "@ieum/utils";
import { TRPCClientError } from "@trpc/client";
import { useForm } from "react-hook-form";
import { match } from "ts-pattern";

import { TextInput } from "~/components/form/TextInput";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";

export function ResolvedRegisterSection() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const [isBlindMember] = api.blindRouter.isBlindMember.useSuspenseQuery({
    memberId: member.id,
  });

  return match(isBlindMember)
    .with(false, () => {
      return <NonRegistered />;
    })
    .with(true, () => {
      return <Done />;
    })
    .exhaustive();
}

function NonRegistered() {
  const { member } = useMemberAuthContext();

  assert(member != null, "member should be defined");

  const utils = api.useUtils();
  const { mutateAsync: createBlindMember } = api.blindRouter.create.useMutation(
    {
      onSuccess: () => {
        return utils.blindRouter.invalidate();
      },
    },
  );

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    getValues,
    setError,
  } = useForm({
    defaultValues: {
      nickname: "",
      bodyShape: "",
    },
  });

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={handleSubmit(async ({ nickname, bodyShape }) => {
        try {
          await createBlindMember({
            memberId: member.id,
            nickname,
            bodyShape,
          });
        } catch (err) {
          if (
            err instanceof TRPCClientError &&
            err.data.code === "CONFLICT" &&
            err.message === "Nickname already exists"
          ) {
            setError("nickname", {
              message: "이미 사용 중인 닉네임입니다.",
            });

            alert("닉네임이 이미 사용 중입니다.");

            return;
          }

          throw err;
        }

        alert("이음 블라인드 가입을 완료했습니다!");
      })}
    >
      <div className="flex w-full flex-row items-end gap-2">
        <TextInput
          label="닉네임"
          error={errors.nickname != null}
          errorText={errors.nickname?.message}
          {...register("nickname", {
            required: true,
          })}
        />
        <button
          type="button"
          className="rounded-lg border border-blind-500 px-4 py-2 font-medium text-blind-500"
          onClick={async () => {
            const isAvailable =
              await utils.blindRouter.isNicknameAvailable.fetch({
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
        >
          중복 확인
        </button>
      </div>
      <TextInput
        label="체형"
        placeholder="예) 마른, 슬림탄탄, 보통, 통통 등"
        error={errors.bodyShape != null}
        errorText={errors.bodyShape?.message}
        {...register("bodyShape", {
          required: true,
        })}
      />
      <button
        type="submit"
        className="mt-2 w-full rounded-lg border border-blind-500 bg-blind-500 p-2 text-center font-medium text-white disabled:opacity-50 md:p-2.5 md:text-lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? "신청 중.." : "시작하기"}
      </button>
    </form>
  );
}

function Done() {
  return (
    <Link
      href={IEUM_BLIND_HOME_URL}
      className="block w-full rounded-lg border border-blind-500 bg-blind-500 p-2 text-center font-medium text-white disabled:opacity-50 md:p-2.5 md:text-lg"
    >
      이음 블라인드 홈으로
    </Link>
  );
}
