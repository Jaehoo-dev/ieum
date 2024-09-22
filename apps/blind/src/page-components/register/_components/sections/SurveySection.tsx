import { 성별_라벨 } from "@ieum/constants";
import { Gender } from "@ieum/prisma";
import { handleNullableStringNumber } from "@ieum/utils";
import { Controller, useFormContext } from "react-hook-form";

import { TextareaInput } from "~/components/form/TextareaInput";
import { TextInput } from "~/components/form/TextInput";
import { UniSelect } from "~/components/form/UniSelect";
import { useSlackNotibot } from "~/hooks/useSlackNotibot";
import { RegisterForm } from "../../RegisterForm";

interface Props {
  onNext: () => void;
}

export function SurveySection({ onNext }: Props) {
  const {
    formState: { errors },
    register,
    control,
    trigger,
  } = useFormContext<RegisterForm>();
  const { sendMessage } = useSlackNotibot();

  return (
    <div className="flex w-full flex-col">
      <img
        src="/hello.jpg"
        alt="안녕하세요"
        className="h-2/5 w-full object-cover object-center"
      />
      <div className="mt-2 flex w-full flex-col gap-6 p-8">
        <h1 className="text-xl font-medium text-gray-800">
          안녕하세요! 이음 블라인드입니다.
        </h1>
        <div className="flex flex-col gap-8">
          <TextInput
            label="닉네임을 무엇으로 쓰시겠어요?"
            required={true}
            error={errors.nickname != null}
            errorText={errors.nickname?.message}
            {...register("nickname", {
              required: true,
            })}
          />
          <Controller
            control={control}
            name="gender"
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return (
                <UniSelect
                  label="성별이 무엇인가요?"
                  options={[
                    {
                      label: 성별_라벨[Gender.MALE],
                      value: Gender.MALE,
                    },
                    {
                      label: 성별_라벨[Gender.FEMALE],
                      value: Gender.FEMALE,
                    },
                  ]}
                  value={value}
                  required={true}
                  onChange={onChange}
                  error={error != null}
                  errorText={error?.message}
                  cols={2}
                />
              );
            }}
            rules={{
              required: true,
            }}
          />
          <TextInput
            label="출생연도가 언제인가요?"
            required={true}
            type="number"
            placeholder="예) 1990"
            error={errors.birthYear != null}
            errorText={errors.birthYear?.message}
            {...register("birthYear", {
              required: true,
              setValueAs: handleNullableStringNumber,
            })}
          />
          <TextInput
            label="어디에 거주하세요?"
            required={true}
            placeholder="예) 서울시 강남구"
            error={errors.residence != null}
            errorText={errors.residence?.message}
            {...register("residence", {
              required: true,
            })}
          />
          <TextInput
            label="키는 몇 센티미터인가요?"
            required={true}
            type="number"
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
            label="체형을 적어주세요."
            required={true}
            placeholder="예) 마른, 슬림탄탄, 보통, 통통 등"
            error={errors.bodyShape != null}
            errorText={errors.bodyShape?.message}
            {...register("bodyShape", {
              required: true,
            })}
          />
          <TextInput
            label="직장 및 직무를 적어주세요."
            description="가능한 구체적으로 입력해주세요."
            required={true}
            placeholder="예) 삼성전자 해외영업, 자동차기업 엔지니어"
            error={errors.job != null}
            errorText={errors.job?.message}
            {...register("job", {
              required: true,
            })}
          />
          <TextareaInput
            label="자기소개를 적어주세요."
            required={true}
            error={errors.selfIntroduction != null}
            errorText={errors.selfIntroduction?.message}
            rows={3}
            {...register("selfIntroduction", {
              required: true,
            })}
          />
        </div>
        <button
          onClick={async () => {
            sendMessage({
              content: "설문 페이지 다음 클릭",
            });

            const isValid = await trigger(
              [
                "nickname",
                "birthYear",
                "bodyShape",
                "gender",
                "height",
                "job",
                "residence",
              ],
              {
                shouldFocus: true,
              },
            );

            if (isValid) {
              onNext();
            }
          }}
          className="mt-6 w-full rounded-lg bg-blind-500 px-4 py-2 text-lg font-medium text-white hover:bg-blind-700 disabled:cursor-not-allowed disabled:bg-blind-300"
        >
          다음
        </button>
      </div>
    </div>
  );
}
