import { ReactElement, Suspense, useState } from "react";
import { useRouter } from "next/router";
import { BasicMember } from "@ieum/prisma";
import { calculateBmi } from "@ieum/utils";
import { FormProvider, useForm } from "react-hook-form";

import { Layout } from "~/components/Layout";
import { TextInput } from "~/components/TextInput";
import { IdealTypeFields } from "~/page-components/basic/components/form/IdealTypeFields";
import { MemoField } from "~/page-components/basic/components/form/MemoField";
import { NonNegotiableConditionsField } from "~/page-components/basic/components/form/NonNegotiableConditionField";
import { SelfFields } from "~/page-components/basic/components/form/SelfFields";
import { api } from "~/utils/api";
import { BasicMemberForm } from "../../BasicMemberForm";
import { ImagesField } from "./components/ImagesField";

interface BasicMemberUpdateForm
  extends Omit<BasicMemberForm, "imageBucketPaths"> {}

export function UpdateBasicMemberPage() {
  return (
    <Suspense>
      <Resolved />
    </Suspense>
  );
}

function Resolved() {
  const [done, setDone] = useState(false);
  const router = useRouter();
  const [member] = api.basicMemberRouter.findById.useSuspenseQuery({
    id: Number(router.query.basicMemberId),
  });
  const methods = useForm<BasicMemberUpdateForm>({
    defaultValues: memberToForm(member),
  });
  const { mutateAsync: update } = api.basicMemberRouter.update.useMutation();

  return (
    <div className="flex min-h-screen flex-col items-center gap-6">
      <h1 className="text-4xl font-semibold">베이직 회원 수정</h1>
      <FormProvider {...methods}>
        <form
          className="mt-4 flex flex-col gap-6"
          onSubmit={methods.handleSubmit(async (fields) => {
            if (!done) {
              return;
            }

            await update({
              id: member.id,
              data: formToPayload(fields),
            });

            alert("수정 완료!");
            setDone(false);
          })}
        >
          <div className="grid grid-cols-2 gap-12">
            <SelfFields />
            <div className="flex flex-col gap-16">
              <IdealTypeFields />
              <NonNegotiableConditionsField />
              <TextInput
                label="만남권 개수"
                {...methods.register("vouchersLeft", {
                  required: true,
                  valueAsNumber: true,
                })}
              />
            </div>
          </div>
          <MemoField />
          <ImagesField memberId={member.id} />
          <button
            type="button"
            className="w-full rounded bg-gray-300 py-2"
            onClick={() => {
              console.log(formToPayload(methods.getValues()));
            }}
          >
            콘솔에 확인
          </button>
          <div className="flex justify-center gap-4">
            <input
              type="checkbox"
              checked={done}
              onChange={(e) => setDone(e.target.checked)}
            />
            <button
              type="submit"
              className="w-full rounded bg-blue-600 py-2 text-white"
              disabled={methods.formState.isSubmitting}
            >
              수정
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

function memberToForm(member: BasicMember) {
  return {
    ...member,
    fashionStyles: member.fashionStyles.map((style) => {
      return { value: style };
    }),
    idealRegions: member.idealRegions.map((region) => {
      return { value: region };
    }),
    idealBodyShapes: member.idealBodyShapes.map((shape) => {
      return { value: shape };
    }),
    idealFashionStyles: member.idealFashionStyles.map((style) => {
      return { value: style };
    }),
    idealEyelids: member.idealEyelids.map((eyelid) => {
      return { value: eyelid };
    }),
    idealOccupationStatuses: member.idealOccupationStatuses.map((status) => {
      return { value: status };
    }),
    idealPreferredMbtis: member.idealPreferredMbtis.map((mbti) => {
      return { value: mbti };
    }),
    idealNonPreferredMbtis: member.idealNonPreferredMbtis.map((mbti) => {
      return { value: mbti };
    }),
    idealPreferredReligions: member.idealPreferredReligions.map((religion) => {
      return { value: religion };
    }),
    idealNonPreferredReligions: member.idealNonPreferredReligions.map(
      (religion) => {
        return { value: religion };
      },
    ),
    nonNegotiableConditions: member.nonNegotiableConditions.map((condition) => {
      return { value: condition };
    }),
  };
}

function formToPayload(form: BasicMemberUpdateForm) {
  return {
    ...form,
    bmi:
      form.weight == null
        ? null
        : Number(calculateBmi(form.height, form.weight).toFixed(2)),
    fashionStyles: form.fashionStyles.map((style) => style.value),
    idealRegions: form.idealRegions.map((region) => region.value),
    idealBodyShapes: form.idealBodyShapes.map((shape) => shape.value),
    idealFashionStyles: form.idealFashionStyles.map((style) => style.value),
    idealEyelids: form.idealEyelids.map((eyelid) => eyelid.value),
    idealOccupationStatuses: form.idealOccupationStatuses.map(
      (status) => status.value,
    ),
    idealPreferredMbtis: form.idealPreferredMbtis.map((mbti) => mbti.value),
    idealNonPreferredMbtis: form.idealNonPreferredMbtis.map(
      (mbti) => mbti.value,
    ),
    idealPreferredReligions: form.idealPreferredReligions.map(
      (religion) => religion.value,
    ),
    idealNonPreferredReligions: form.idealNonPreferredReligions.map(
      (religion) => religion.value,
    ),
    nonNegotiableConditions: form.nonNegotiableConditions.map(
      (condition) => condition.value,
    ),
  };
}

UpdateBasicMemberPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
