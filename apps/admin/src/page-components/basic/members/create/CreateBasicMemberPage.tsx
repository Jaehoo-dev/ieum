import { useState } from "react";
import type { ReactElement } from "react";
import { calculateBmi } from "@ieum/utils";
import { FormProvider, useForm } from "react-hook-form";

import { Layout } from "~/components/Layout";
import { TextInput } from "~/components/TextInput";
import { api } from "~/utils/api";
import { IdealTypeFields } from "./components/IdealTypeFields";
import { MemoField } from "./components/MemoField";
import { NonNegotiableConditionsField } from "./components/NonNegotiableConditionField";
import { SelfFields } from "./components/SelfFields";
import { createBasicMemberFormDefaultValues } from "./CreateBasicMemberForm";
import type { CreateBasicMemberForm } from "./CreateBasicMemberForm";

export function CreateBasicMemberPage() {
  const [done, setDone] = useState(false);
  const methods = useForm<CreateBasicMemberForm>({
    defaultValues: createBasicMemberFormDefaultValues,
  });
  const { mutateAsync: create } = api.basicMemberRouter.create.useMutation();

  return (
    <div className="flex min-h-screen flex-col items-center gap-6">
      <h1 className="text-4xl font-semibold">베이직 회원 생성</h1>
      <FormProvider {...methods}>
        <form
          className="mt-4 flex flex-col gap-6"
          onSubmit={methods.handleSubmit(async (fields) => {
            if (!done) {
              return;
            }

            const payload = formToPayload(fields);

            await create(payload);

            alert("생성 완료!");

            setDone(false);
            methods.reset();
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
              생성
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

function formToPayload(form: CreateBasicMemberForm) {
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
    imageBucketPaths: form.imageBucketPaths.map((path) => path.value),
  };
}

CreateBasicMemberPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
