import { ReactElement } from "react";
import { FripRating } from "@ieum/prisma";
import { Controller, useForm } from "react-hook-form";

import { Layout } from "~/components/Layout";
import { Select } from "~/components/Select";
import { TextareaInput } from "~/components/TextareaInput";
import { TextInput } from "~/components/TextInput";
import { api } from "~/utils/api";

interface Form {
  nickname: string;
  rating: FripRating;
  date: `${number}-${number}-${number}`;
  time: `${number}:${number}`;
  content: string;
  option: string;
  priority: number;
}

export function FripReviewsRegistrationPage() {
  const { register, control, handleSubmit, reset } = useForm<Form>({
    defaultValues: {
      nickname: "",
      rating: FripRating.FIVE,
      date: "2024-01-01",
      time: "12:00",
      content: "",
      option: "이음비 (서로 소개에 응했을 때 구매합니다. 두근두근 새 인연!)",
      priority: 1,
    },
  });
  const { mutateAsync: createFripReview } =
    api.reviewRouter.createFripReview.useMutation();

  return (
    <div className="flex min-h-screen flex-col items-center gap-6">
      <h1 className="text-4xl font-semibold">프립 후기 등록</h1>
      <form
        className="flex min-w-[480px] flex-col gap-6"
        onSubmit={handleSubmit(async (data) => {
          await createFripReview(formToPayload(data));
          reset();
        })}
      >
        <TextInput
          label="닉네임"
          {...register("nickname", { required: true })}
        />
        <Controller
          control={control}
          name="rating"
          render={({ field }) => (
            <Select label="별점" {...field}>
              <option value={FripRating.FIVE}>5</option>
              <option value={FripRating.FOUR_POINT_FIVE}>4.5</option>
            </Select>
          )}
        />
        <div className="flex flex-row gap-2">
          <TextInput label="날짜" {...register("date", { required: true })} />
          <TextInput label="시간" {...register("time", { required: true })} />
        </div>
        <TextareaInput
          label="내용"
          {...register("content", { required: true })}
        />
        <TextInput label="옵션" {...register("option", { required: true })} />
        <Controller
          control={control}
          name="priority"
          render={({ field }) => (
            <Select label="우선순위" {...field}>
              <option value={0}>0</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </Select>
          )}
        />
        <button
          type="submit"
          className="w-full rounded bg-blue-600 py-2 text-white"
        >
          등록
        </button>
      </form>
    </div>
  );
}

FripReviewsRegistrationPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

function formToPayload({ date, time, content, ...form }: Form) {
  return {
    writtenAt: new Date(`${date}T${time}`),
    content: content.trim(),
    ...form,
  };
}
