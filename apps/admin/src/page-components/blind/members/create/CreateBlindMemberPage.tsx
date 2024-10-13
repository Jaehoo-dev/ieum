import { ReactElement, useState } from "react";
import { 성별_라벨, 지역_라벨 } from "@ieum/constants";
import { Gender, RegionV2 } from "@ieum/prisma";
import { Controller, useForm } from "react-hook-form";

import { Checkbox } from "~/components/Checkbox";
import { Layout } from "~/components/Layout";
import { Select } from "~/components/Select";
import { TextInput } from "~/components/TextInput";
import { api } from "~/utils/api";

export function CreateBlindMemberPage() {
  const [done, setDone] = useState(false);
  const {
    register,
    control,
    formState: { isSubmitting },
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: {
      phoneNumber: "",
      nickname: "",
      gender: Gender.MALE,
      birthYear: 1990,
      region: RegionV2.SEOUL,
      height: 170,
      bodyShape: "",
      job: "",
      selfIntroduction: "",
    },
  });
  const { mutateAsync: create } =
    api.blindMemberRouter.createDraft.useMutation();

  return (
    <div className="flex min-h-screen flex-col items-center gap-4 py-2">
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(async (fields) => {
          await create(fields);

          setDone(false);
          reset();
        })}
      >
        <TextInput
          label="전화번호"
          {...register("phoneNumber", {
            required: true,
          })}
        />
        <TextInput
          label="닉네임"
          {...register("nickname", {
            required: true,
          })}
        />
        <Controller
          control={control}
          name="gender"
          render={({ field: { onChange, value } }) => {
            return (
              <Select label="성별" value={value} onChange={onChange}>
                {Object.values(Gender).map((gender) => {
                  return (
                    <option key={gender} value={gender}>
                      {성별_라벨[gender]}
                    </option>
                  );
                })}
              </Select>
            );
          }}
        />
        <TextInput
          label="출생연도"
          type="number"
          {...register("birthYear", {
            required: true,
            valueAsNumber: true,
          })}
        />
        <Controller
          control={control}
          name="region"
          render={({ field: { onChange, value } }) => {
            return (
              <Select label="거주 지역" value={value} onChange={onChange}>
                {Object.values(RegionV2).map((region) => {
                  return (
                    <option key={region} value={region}>
                      {지역_라벨[region]}
                    </option>
                  );
                })}
              </Select>
            );
          }}
        />
        <TextInput
          label="키"
          {...register("height", {
            required: true,
            valueAsNumber: true,
          })}
        />
        <TextInput
          label="체형"
          {...register("bodyShape", {
            required: true,
          })}
        />
        <TextInput
          label="직업"
          {...register("job", {
            required: true,
          })}
        />
        <TextInput
          label="자기소개"
          {...register("selfIntroduction", {
            required: true,
          })}
        />
        <div className="flex w-full flex-row gap-2">
          <Checkbox
            checked={done}
            onChange={(e) => {
              setDone(e.target.checked);
            }}
          />
          <button
            type="submit"
            className="flex-1 rounded-md bg-blue-500 px-8 py-2 text-white disabled:opacity-50"
            disabled={!done || isSubmitting}
          >
            {isSubmitting ? "생성 중.." : "생성"}
          </button>
        </div>
      </form>
    </div>
  );
}

CreateBlindMemberPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
