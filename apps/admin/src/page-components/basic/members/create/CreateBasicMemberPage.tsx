import { useState } from "react";
import type { ReactElement } from "react";
import { supabase } from "@ieum/supabase";
import { assert, calculateBmi } from "@ieum/utils";
import { nanoid } from "nanoid";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";

import { ImageInput } from "~/components/ImageInput";
import { Layout } from "~/components/Layout";
import { api } from "~/utils/api";
import { IdealTypeFields } from "../../components/form/IdealTypeFields";
import { MemoField } from "../../components/form/MemoField";
import { NonNegotiableConditionsField } from "../../components/form/NonNegotiableConditionField";
import { SelfFields } from "../../components/form/SelfFields";
import { ImagePreview } from "../../components/ImagePreview";
import { BasicMemberForm } from "../BasicMemberForm";
import { createBasicMemberFormDefaultValues } from "./CreateBasicMemberForm";

export function CreateBasicMemberPage() {
  const [done, setDone] = useState(false);
  const methods = useForm<BasicMemberForm>({
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
            </div>
          </div>
          <MemoField />
          <ImageField />
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

function ImageField() {
  const { control } = useFormContext<BasicMemberForm>();
  const [imageFile, setImageFile] = useState<File>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "imageBucketPaths",
  });

  return (
    <>
      <ImageInput
        label="사진"
        onChange={(file) => {
          setImageFile(file);
        }}
        onRegister={async () => {
          if (imageFile == null) {
            return;
          }

          const { data, error } = await supabase.storage
            .from(
              process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_IMAGES_BUCKET_NAME!,
            )
            .upload(nanoid(), imageFile);

          assert(error == null, error?.message);

          append({ value: data.path });
        }}
      />
      {fields.map((field, index) => {
        return (
          <div key={field.id} className="flex gap-2">
            <ImagePreview bucketPath={field.value} />
            <button
              type="button"
              onClick={async () => {
                const { error } = await supabase.storage
                  .from(
                    process.env
                      .NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_IMAGES_BUCKET_NAME!,
                  )
                  .remove([field.value]);

                assert(error == null, error?.message);

                remove(index);
              }}
            >
              삭제
            </button>
          </div>
        );
      })}
    </>
  );
}

function formToPayload(form: BasicMemberForm) {
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
