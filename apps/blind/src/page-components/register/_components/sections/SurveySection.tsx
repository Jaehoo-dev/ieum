import { 성별_라벨, 지역_라벨 } from "@ieum/constants";
import { Gender, Region } from "@ieum/prisma";
import { handleNullableStringNumber } from "@ieum/utils";
import { TRPCClientError } from "@trpc/client";
import { Controller } from "react-hook-form";

import { TextareaInput } from "~/components/form/TextareaInput";
import { TextInput } from "~/components/form/TextInput";
import { UniSelect } from "~/components/form/UniSelect";
import { api } from "~/utils/api";
import { formToPayload, useRegisterForm } from "../../RegisterForm";

interface Props {
  phoneNumber: string;
  onSubmitSuccess: () => void;
}

export function SurveySection({ phoneNumber, onSubmitSuccess }: Props) {
  const {
    clearCache,
    formState: { errors, isSubmitting },
    register,
    control,
    watch,
    handleSubmit,
    getValues,
    setError,
  } = useRegisterForm();
  const utils = api.useUtils();
  const { mutateAsync: createMember } =
    api.blindMemberRouter.create.useMutation({
      onSuccess: () => {
        return utils.invalidate();
      },
    });

  return (
    <form
      className="flex w-full flex-col"
      onSubmit={handleSubmit(async (fields) => {
        console.log(fields);
        const payload = formToPayload(fields);

        try {
          await createMember({
            phoneNumber,
            ...payload,
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

        clearCache();
        onSubmitSuccess();
      })}
    >
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
          <div className="flex w-full flex-row items-end gap-2">
            <TextInput
              label="닉네임을 무엇으로 쓰시겠어요?"
              required={true}
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
            >
              중복 확인
            </button>
          </div>
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
          <Controller
            control={control}
            name="region"
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return (
                <UniSelect
                  label="어디에 거주하세요?"
                  options={[
                    Region.SEOUL,
                    Region.SOUTH_GYEONGGI,
                    Region.NORTH_GYEONGGI,
                    Region.INCHEON_BUCHEON,
                    Region.CHUNGCHEONG,
                    Region.GYEONGSANG,
                    Region.JEOLLA,
                    Region.GANGWON,
                    Region.JEJU,
                  ].map((region) => {
                    return {
                      label: 지역_라벨[region],
                      value: region,
                    };
                  })}
                  value={value}
                  required={true}
                  onChange={onChange}
                  error={error != null}
                  errorText={error?.message}
                  cols={3}
                />
              );
            }}
            rules={{
              required: true,
            }}
          />
          <TextInput
            label="키는 몇 센티미터인가요?"
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
            rows={6}
            {...register("selfIntroduction", {
              required: true,
            })}
          />
          <Controller
            control={control}
            name="personalInfoConsent"
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return (
                <UniSelect
                  label="서비스를 제공하기 위해 개인정보를 수집하는 데 동의하십니까?"
                  options={[
                    { label: "아니요", value: false },
                    { label: "예", value: true },
                  ]}
                  value={value}
                  onChange={onChange}
                  required={true}
                  error={error != null}
                  errorText={error?.message}
                  cols={2}
                />
              );
            }}
            rules={{
              validate: (value) => {
                return (
                  value === true ||
                  "개인정보 수집에 동의하지 않으시면 서비스를 제공해드릴 수 없습니다."
                );
              },
            }}
          />
        </div>
        <button
          type="submit"
          className="flex-1 rounded-lg bg-blind-500 px-4 py-2 text-lg font-medium text-white hover:bg-blind-700 disabled:opacity-50"
          disabled={!watch("personalInfoConsent") || isSubmitting}
        >
          {isSubmitting ? "제출 중.." : "제출"}
        </button>
      </div>
    </form>
  );
}
