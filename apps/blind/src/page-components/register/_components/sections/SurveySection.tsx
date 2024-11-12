import {
  BLIND_MEMBER_REJOIN_BLOCK_ERROR_MESSAGE,
  EXISTING_NICKNAME_ERROR_MESSAGE,
  INVALID_BIRTH_YEAR_ERROR_MESSAGE,
  INVALID_HEIGHT_ERROR_MESSAGE,
  성별_라벨,
  지역_라벨,
} from "@ieum/constants";
import { Gender, RegionV2 } from "@ieum/prisma";
import { handleNullableStringNumber, isEmptyStringOrNil } from "@ieum/utils";
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
        const payload = formToPayload(fields);

        try {
          await createMember({
            phoneNumber,
            ...payload,
          });
        } catch (err) {
          if (!(err instanceof TRPCClientError)) {
            throw err;
          }

          if (
            err.data.code === "FORBIDDEN" &&
            err.message === BLIND_MEMBER_REJOIN_BLOCK_ERROR_MESSAGE
          ) {
            alert("재가입 제한 기간이 남았습니다.");

            return;
          }

          if (
            err.data.code === "CONFLICT" &&
            err.message === EXISTING_NICKNAME_ERROR_MESSAGE
          ) {
            setError("nickname", {
              message: "이미 사용 중인 닉네임입니다.",
            });

            alert("닉네임이 이미 사용 중입니다.");

            return;
          }

          if (
            err.data.code === "BAD_REQUEST" &&
            err.message === INVALID_BIRTH_YEAR_ERROR_MESSAGE
          ) {
            setError("birthYear", {
              message: "출생연도를 확인해주세요.",
            });

            alert("출생연도를 확인해주세요.");

            return;
          }

          if (
            err.data.code === "BAD_REQUEST" &&
            err.message === INVALID_HEIGHT_ERROR_MESSAGE
          ) {
            setError("height", {
              message: "키를 확인해주세요.",
            });

            alert("키를 확인해주세요.");

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
          안녕하세요! <span className="text-blind-500">이음 블라인드</span>
          입니다.
        </h1>
        <div className="flex flex-col gap-8">
          <div className="flex w-full flex-row items-end gap-2">
            <TextInput
              label="닉네임"
              required={true}
              error={errors.nickname != null}
              errorText={errors.nickname?.message}
              {...register("nickname", {
                required: true,
              })}
            />
            <button
              type="button"
              className="rounded-lg border border-blind-500 px-4 py-2 font-medium text-blind-500 disabled:opacity-50"
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
              disabled={isEmptyStringOrNil(watch("nickname"))}
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
                  label="성별"
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
            label="출생연도"
            required={true}
            type="number"
            placeholder="예) 1990"
            error={errors.birthYear != null}
            errorText={errors.birthYear?.message}
            {...register("birthYear", {
              required: true,
              setValueAs: handleNullableStringNumber,
              validate: (value) => {
                if (value == null) {
                  return "출생연도를 입력해주세요.";
                }

                if (value < 1970 || value > 2005) {
                  return "출생연도를 확인해주세요.";
                }
              },
            })}
          />
          <Controller
            control={control}
            name="region"
            render={({ field: { onChange, value }, fieldState: { error } }) => {
              return (
                <UniSelect
                  label="거주 지역"
                  options={Object.values(RegionV2).map((region) => {
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
            label="직장 및 직무"
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
            label="자기소개"
            description="자세히 작성할수록 수락률이 높아져요. 하는 일, 성격, 취미, 관심사 등을 소개해주세요. 외모 묘사도 좋아요."
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
                  description="거짓 정보, 불건전한 내용, 불성실한 답변 등을 제출하면 서비스 이용이 제한될 수 있습니다."
                  options={[
                    { label: "예", value: true },
                    { label: "아니요", value: false },
                  ]}
                  value={value}
                  onChange={onChange}
                  required={true}
                  error={error != null}
                  errorText={error?.message}
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
