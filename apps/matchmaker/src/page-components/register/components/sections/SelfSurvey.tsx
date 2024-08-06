import { 연간_벌이_라벨, 자산_라벨 } from "@ieum/constants";
import {
  AnnualIncome,
  AssetsValue,
  EducationLevel,
  ExercisePerWeek,
  Gender,
  MBTI,
  Religion,
} from "@ieum/prisma";
import { isEmptyStringOrNil } from "@ieum/utils";
import { Controller, useFormContext } from "react-hook-form";

import { handleNullableStringNumber, RegisterForm } from "../../RegisterForm";
import { BackTextButton } from "../BackTextButton";
import { Buttons } from "../Buttons";
import { MultiSelect } from "../MultiSelect";
import { TextareaInput } from "../TextareaInput";
import { TextInput } from "../TextInput";
import { UniSelect } from "../UniSelect";

interface Props {
  onBack: () => void;
  onNext: () => void;
}

export function SelfSurvey({ onBack, onNext }: Props) {
  const {
    watch,
    getValues,
    setValue,
    formState: { errors },
    register,
    control,
    trigger,
  } = useFormContext<RegisterForm>();
  const gender = getValues("gender");
  const educationLevel = watch("educationLevel");
  const 대학교를_졸업했는가 =
    educationLevel === EducationLevel.ASSOCIATE_DEGREE ||
    educationLevel === EducationLevel.BACHELOR_DEGREE ||
    educationLevel === EducationLevel.MASTER_DEGREE ||
    educationLevel === EducationLevel.DOCTORATE_DEGREE;
  const workplace = watch("workplace");
  const exercisePerWeek = watch("exercisePerWeek");
  const 운동을_하는가 =
    exercisePerWeek != null && exercisePerWeek !== ExercisePerWeek.NONE;

  return (
    <div className="flex w-full flex-col gap-8 p-6">
      <BackTextButton onClick={onBack} />
      <div className="flex flex-col gap-8">
        <TextInput
          label="출생연도가 언제인가요?"
          required={true}
          type="number"
          placeholder={`예) ${gender === Gender.MALE ? "1992" : "1994"}`}
          error={errors.birthYear != null}
          errorText={errors.birthYear?.message}
          {...register("birthYear", {
            required: "출생연도를 입력해주세요.",
            setValueAs: handleNullableStringNumber,
          })}
        />
        <TextInput
          label="어디에 거주하세요?"
          description="서울, 인천, 경기도 거주자만 가입 가능합니다."
          required={true}
          placeholder="예) 서울시 강남구"
          error={errors.residence != null}
          errorText={errors.residence?.message}
          {...register("residence", {
            required: "거주 지역을 입력해주세요.",
          })}
        />
        <TextInput
          label="키는 몇 센티미터인가요?"
          required={true}
          type="number"
          placeholder={`예) ${gender === Gender.MALE ? "175" : "160"}`}
          error={errors.height != null}
          errorText={errors.height?.message}
          {...register("height", {
            required: "키를 입력해주세요.",
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
          label="몸무게는요?"
          description="절대 공개하지 않아요. 체형을 파악하는 데만 참고합니다."
          required={true}
          type="number"
          error={errors.weight != null}
          errorText={errors.weight?.message}
          {...register("weight", {
            required: "몸무게를 입력해주세요.",
            setValueAs: handleNullableStringNumber,
            validate: (value) => {
              if (value == null) {
                return "몸무게를 입력해주세요.";
              }

              if (value < 30 || value > 200) {
                return "몸무게를 확인해주세요.";
              }
            },
          })}
        />
        <TextInput
          label="얼굴이나 신체에서 자신 있는 부위가 어디인가요?"
          description="자신 있게 어필해주세요!"
          error={errors.confidentFacialBodyPart != null}
          errorText={errors.confidentFacialBodyPart?.message}
          {...register("confidentFacialBodyPart", {
            setValueAs: (value) => {
              if (isEmptyStringOrNil(value)) {
                return null;
              }

              return value.trim();
            },
          })}
        />
        <Controller
          control={control}
          name="educationLevel"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <UniSelect
                label="최종 학력을 골라주세요."
                description="추후 졸업 인증을 요청드립니다."
                options={[
                  {
                    label: "고등학교 졸업",
                    value: EducationLevel.HIGH_SCHOOL_GRADUATE,
                  },
                  { label: "전문학사", value: EducationLevel.ASSOCIATE_DEGREE },
                  { label: "학사", value: EducationLevel.BACHELOR_DEGREE },
                  { label: "석사", value: EducationLevel.MASTER_DEGREE },
                  { label: "박사", value: EducationLevel.DOCTORATE_DEGREE },
                ]}
                value={value}
                onChange={(newValue) => {
                  onChange(newValue);

                  if (newValue === EducationLevel.HIGH_SCHOOL_GRADUATE) {
                    setValue("graduatedUniversity", null);
                  }
                }}
                required={true}
                error={error != null}
                errorText={error?.message}
                cols={2}
              />
            );
          }}
          rules={{
            validate: (value) => {
              if (value == null) {
                return "학력을 선택해주세요.";
              }
            },
          }}
        />
        {대학교를_졸업했는가 ? (
          <TextInput
            label="어느 대학교를 졸업하셨나요?"
            description="캠퍼스가 있다면 캠퍼스까지 적어주세요."
            required={true}
            error={errors.graduatedUniversity != null}
            errorText={errors.graduatedUniversity?.message}
            {...register("graduatedUniversity", {
              validate: (value) => {
                if (대학교를_졸업했는가 && isEmptyStringOrNil(value)) {
                  return "대학교를 입력해주세요.";
                }
              },
            })}
          />
        ) : null}
        <Controller
          control={control}
          name="workplace"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <TextInput
                label="직장을 알려주세요."
                description="추후 재직 인증을 요청드립니다."
                placeholder="예) 삼성전자"
                required={true}
                error={errors.workplace != null}
                errorText={errors.workplace?.message}
                value={value ?? ""}
                onChange={({ target }) => {
                  const isEmpty = isEmptyStringOrNil(target.value);

                  onChange(isEmpty ? null : target.value);

                  if (isEmpty) {
                    setValue("job", null);
                  }
                }}
              />
            );
          }}
          rules={{
            required: "직장을 입력해주세요.",
          }}
        />
        {isEmptyStringOrNil(workplace) ? null : (
          <TextInput
            label={`${watch("workplace")}에서 맡으신 직무가 무엇인가요?`}
            placeholder="예) 마케팅"
            error={errors.job != null}
            errorText={errors.job?.message}
            {...register("job")}
          />
        )}
        <Controller
          control={control}
          name="annualIncome"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <UniSelect
                label="세전으로 연간 얼마 정도 버세요?"
                options={Object.values(AnnualIncome).map((value) => {
                  return {
                    label: 연간_벌이_라벨[value],
                    value,
                  };
                })}
                value={value}
                onChange={onChange}
                error={error != null}
                errorText={error?.message}
                cols={1}
              />
            );
          }}
        />
        <Controller
          control={control}
          name="assetsValue"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <UniSelect
                label="자산은 어느 정도 모으셨어요?"
                options={Object.values(AssetsValue).map((value) => {
                  return {
                    label: 자산_라벨[value],
                    value,
                  };
                })}
                value={value}
                onChange={onChange}
                error={error != null}
                errorText={error?.message}
                cols={1}
              />
            );
          }}
        />
        <Controller
          control={control}
          name="mbti"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <UniSelect
                label="MBTI를 알려주세요."
                options={Object.values(MBTI).map((value) => {
                  return {
                    label: value,
                    value,
                  };
                })}
                value={value}
                onChange={onChange}
                error={error != null}
                errorText={error?.message}
                cols={4}
              />
            );
          }}
        />
        <Controller
          control={control}
          name="characteristics"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <MultiSelect
                label={`${getValues(
                  "name",
                )} 님을 가장 잘 설명하는 특징을 최대 5개 골라주세요.`}
                options={[
                  { label: "친절한", value: "친절한" },
                  { label: "성실한", value: "성실한" },
                  { label: "정직한", value: "정직한" },
                  { label: "리더십 강한", value: "리더십 강한" },
                  { label: "엉뚱한", value: "엉뚱한" },
                  { label: "차분한", value: "차분한" },
                  { label: "지적인", value: "지적인" },
                  { label: "리액션 좋은", value: "리액션 좋은" },
                  { label: "화려한", value: "화려한" },
                  { label: "협조적인", value: "협조적인" },
                  { label: "카리스마 있는", value: "카리스마 있는" },
                  { label: "사려 깊은", value: "사려 깊은" },
                  { label: "집중력이 강한", value: "집중력이 강한" },
                  { label: "믿음직한", value: "믿음직한" },
                  { label: "애교 많은", value: "애교 많은" },
                  { label: "활발한", value: "활발한" },
                  { label: "단순한", value: "단순한" },
                  { label: "낙천적인", value: "낙천적인" },
                  { label: "용감한", value: "용감한" },
                  { label: "귀여운", value: "귀여운" },
                  { label: "열정 넘치는", value: "열정 넘치는" },
                  { label: "무던한", value: "무던한" },
                  { label: "자부심 강한", value: "자부심 강한" },
                  { label: "예의바른", value: "예의바른" },
                  { label: "예술적인", value: "예술적인" },
                  { label: "다정한", value: "다정한" },
                  { label: "관대한", value: "관대한" },
                  { label: "신중한", value: "신중한" },
                  { label: "도도한", value: "도도한" },
                  { label: "털털한", value: "털털한" },
                  { label: "조용한", value: "조용한" },
                  { label: "유머 감각이 뛰어난", value: "유머 감각이 뛰어난" },
                  { label: "자유로운", value: "자유로운" },
                  { label: "듬직한", value: "듬직한" },
                  { label: "섹시한", value: "섹시한" },
                  { label: "우아한", value: "우아한" },
                  { label: "자비로운", value: "자비로운" },
                  { label: "다재다능한", value: "다재다능한" },
                  { label: "호기심 많은", value: "호기심 많은" },
                  { label: "진중한", value: "진중한" },
                  { label: "융통성 있는", value: "융통성 있는" },
                ]}
                selectedValues={value}
                onChange={onChange}
                error={error != null}
                errorText={error?.message}
                cols={2}
                max={5}
              />
            );
          }}
        />
        <TextInput
          label="취미나 관심사를 알려주세요."
          description="여러 개를 적으셔도 좋아요."
          required={true}
          error={errors.hobby != null}
          errorText={errors.hobby?.message}
          {...register("hobby", {
            required: "취미나 관심사를 입력해주세요.",
          })}
        />
        <Controller
          control={control}
          name="exercisePerWeek"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <UniSelect
                label="운동하세요?"
                options={[
                  { label: "아니요", value: ExercisePerWeek.NONE },
                  { label: "주 1~2회", value: ExercisePerWeek.ONE_TO_TWO },
                  { label: "주 3~4회", value: ExercisePerWeek.THREE_TO_FOUR },
                  { label: "주 5회 이상", value: ExercisePerWeek.FIVE_OR_MORE },
                ]}
                required={true}
                value={value}
                onChange={(value) => {
                  onChange(value);

                  if (value === ExercisePerWeek.NONE) {
                    setValue("exerciseType", null);
                  }
                }}
                error={error != null}
                errorText={error?.message}
                cols={3}
              />
            );
          }}
          rules={{
            validate: (value) => {
              if (value == null) {
                return "운동 여부를 선택해주세요.";
              }
            },
          }}
        />
        {운동을_하는가 ? (
          <TextInput
            label="어떤 운동하세요?"
            error={errors.exerciseType != null}
            errorText={errors.exerciseType?.message}
            {...register("exerciseType")}
          />
        ) : null}
        <Controller
          control={control}
          name="isSmoker"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <UniSelect
                label="흡연하세요?"
                options={[
                  { label: "예", value: true },
                  { label: "아니요", value: false },
                ]}
                required={true}
                value={value}
                onChange={onChange}
                error={error != null}
                errorText={error?.message}
                cols={2}
              />
            );
          }}
          rules={{
            validate: (value) => {
              if (value == null) {
                return "흡연 여부를 선택해주세요.";
              }
            },
          }}
        />
        <Controller
          control={control}
          name="isDrinker"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <UniSelect
                label="음주는요?"
                options={[
                  { label: "예", value: true },
                  { label: "아니요", value: false },
                ]}
                required={true}
                value={value}
                onChange={(value) => {
                  onChange(value);

                  if (!value) {
                    setValue("alcoholConsumption", null);
                    setValue("alcoholTolerance", null);
                  }
                }}
                error={error != null}
                errorText={error?.message}
                cols={2}
              />
            );
          }}
          rules={{
            validate: (value) => {
              if (value == null) {
                return "음주 여부를 선택해주세요.";
              }
            },
          }}
        />
        {watch("isDrinker") ? (
          <>
            <TextInput
              label="술을 얼마나 자주, 얼만큼 드세요?"
              placeholder="주 2회, 맥주 한 캔"
              error={errors.alcoholConsumption != null}
              errorText={errors.alcoholConsumption?.message}
              {...register("alcoholConsumption")}
            />
            <TextInput
              label="주량은 어느 정도세요?"
              placeholder="소주 한 병"
              error={errors.alcoholTolerance != null}
              errorText={errors.alcoholTolerance?.message}
              {...register("alcoholTolerance")}
            />
          </>
        ) : null}
        <Controller
          control={control}
          name="religion"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <UniSelect
                label="어떤 종교를 믿으세요?"
                options={[
                  { label: "없음", value: Religion.NONE },
                  { label: "개신교", value: Religion.CHRISTIAN },
                  { label: "천주교", value: Religion.CATHOLIC },
                  { label: "불교", value: Religion.BUDDHIST },
                  { label: "기타", value: Religion.OTHER },
                ]}
                required={true}
                value={value}
                onChange={onChange}
                error={error != null}
                errorText={error?.message}
                cols={3}
              />
            );
          }}
          rules={{
            validate: (value) => {
              if (value == null) {
                return "종교를 선택해주세요.";
              }
            },
          }}
        />
        <Controller
          control={control}
          name="hasTattoo"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <UniSelect
                label="문신을 하셨나요?"
                options={[
                  { label: "예", value: true },
                  { label: "아니요", value: false },
                ]}
                required={true}
                value={value}
                onChange={onChange}
                error={error != null}
                errorText={error?.message}
                cols={2}
              />
            );
          }}
          rules={{
            validate: (value) => {
              if (value == null) {
                return "문신 유무를 선택해주세요.";
              }
            },
          }}
        />
        <Controller
          control={control}
          name="hasCar"
          render={({ field: { onChange, value }, fieldState: { error } }) => {
            return (
              <UniSelect
                label="자차가 있으신가요?"
                options={[
                  { label: "예", value: true },
                  { label: "아니요", value: false },
                ]}
                required={true}
                value={value}
                onChange={onChange}
                error={error != null}
                errorText={error?.message}
                cols={2}
              />
            );
          }}
          rules={{
            validate: (value) => {
              if (value == null) {
                return "자차 유무를 선택해주세요.";
              }
            },
          }}
        />
        <TextInput
          label="어떤 데이트를 선호하시는지 적어주세요. 연인과 무엇을 하고 싶은지 적으셔도 좋아요."
          required={true}
          error={errors.datingStyle != null}
          errorText={errors.datingStyle?.message}
          {...register("datingStyle", {
            required: "데이트 스타일을 입력해주세요.",
          })}
        />
        <TextareaInput
          label="'나는 이런 사람이에요'를 적어주세요. 설문 답변으로 표출하지 못한 매력을 진솔하게 표현해주세요. 구체적일수록 좋아요!"
          description="프로필에 기재하며 수락률에 큰 영향을 미치니 성의를 들여 써주세요. 나중에 수정할 수 있습니다."
          required={true}
          error={errors.selfIntroduction != null}
          errorText={errors.selfIntroduction?.message}
          rows={8}
          {...register("selfIntroduction", {
            required: "자기소개를 입력해주세요.",
          })}
        />
      </div>
      <div className="mt-4">
        <Buttons
          onBackClick={onBack}
          onNextClick={async () => {
            const isValid = await trigger(
              [
                "birthYear",
                "residence",
                "height",
                "weight",
                "confidentFacialBodyPart",
                "educationLevel",
                "graduatedUniversity",
                "workplace",
                "job",
                "annualIncome",
                "assetsValue",
                "mbti",
                "characteristics",
                "hobby",
                "exercisePerWeek",
                "exerciseType",
                "isSmoker",
                "isDrinker",
                "alcoholConsumption",
                "alcoholTolerance",
                "religion",
                "hasTattoo",
                "hasCar",
                "datingStyle",
                "selfIntroduction",
              ],
              {
                shouldFocus: true,
              },
            );

            if (isValid) {
              onNext();
            }
          }}
        />
      </div>
    </div>
  );
}
