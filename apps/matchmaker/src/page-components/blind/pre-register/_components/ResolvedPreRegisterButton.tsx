import { assert } from "@ieum/utils";
import { useForm } from "react-hook-form";
import { match } from "ts-pattern";

import { TextInput } from "~/components/form/TextInput";
import { useMemberAuthContext } from "~/providers/MemberAuthProvider";
import { api } from "~/utils/api";

export function ResolvedPreRegisterSection() {
  const { member } = useMemberAuthContext();

  assert(member != null, "Component should be used within MemberAuthGuard");

  const [status] = api.blindRouter.getPreRegisterStatus.useSuspenseQuery({
    memberId: member.id,
  });

  return match(status)
    .with("NON_REGISTERED", () => {
      return <NonRegistered />;
    })
    .with("KAKAOTALK_ID_MISSING", () => {
      return <KakaoTalkIdMissing />;
    })
    .with("DONE", () => {
      return <Done />;
    })
    .exhaustive();
}

function NonRegistered() {
  const { member } = useMemberAuthContext();

  assert(member != null, "member should be defined");

  const utils = api.useUtils();
  const { mutateAsync: preRegister } = api.blindRouter.preRegister.useMutation({
    onSuccess: () => {
      return utils.blindRouter.invalidate();
    },
  });

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      kakaotalkId: "",
    },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(async ({ kakaotalkId }) => {
        await preRegister({
          memberId: member.id,
          kakaotalkId,
        });

        alert("사전 신청을 완료했습니다. 출시 때 연락드릴게요!");
      })}
    >
      <TextInput
        label="카카오톡 ID"
        description="이음 블라인드는 성사됐을 때 카카오톡 ID를 공유합니다. 카카오톡 계정(이메일)이 아닌 카카오톡 ID를 입력해주세요!"
        placeholder="ieum_love"
        {...register("kakaotalkId", {
          required: true,
        })}
      />
      <button
        type="submit"
        className="w-full rounded-lg border border-blind-500 bg-blind-500 p-2 text-center font-medium text-white disabled:opacity-50 md:p-2.5 md:text-lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? "사전 신청 중.." : "사전 신청"}
      </button>
    </form>
  );
}

function KakaoTalkIdMissing() {
  const { member } = useMemberAuthContext();

  assert(member != null, "member should be defined");

  const utils = api.useUtils();
  const { mutateAsync: updateKakaotalkId } =
    api.blindRouter.updateKakaotalkId.useMutation({
      onSuccess: () => {
        return utils.blindRouter.invalidate();
      },
    });

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      kakaotalkId: "",
    },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(async ({ kakaotalkId }) => {
        await updateKakaotalkId({
          memberId: member.id,
          kakaotalkId,
        });

        alert("카카오톡 ID를 업데이트했습니다.");
      })}
    >
      <TextInput
        label="카카오톡 ID"
        description="이음 블라인드는 성사됐을 때 카카오톡 ID를 공유합니다. 카카오톡 ID를 입력하고 출시 후 바로 이용하세요! 카카오톡 계정(이메일)이 아닌 카카오톡 ID를 입력해주세요."
        placeholder="ieum_love"
        {...register("kakaotalkId", {
          required: true,
        })}
      />
      <button
        type="submit"
        className="w-full rounded-lg border border-blind-500 bg-blind-500 p-2 text-center font-medium text-white disabled:opacity-50 md:p-2.5 md:text-lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? "제출 중.." : "완료"}
      </button>
    </form>
  );
}

function Done() {
  return (
    <button
      className="w-full rounded-lg border border-blind-500 bg-blind-500 p-2 text-center font-medium text-white disabled:opacity-50 md:p-2.5 md:text-lg"
      disabled={true}
    >
      사전 신청 완료
    </button>
  );
}
