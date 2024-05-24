import { useState } from "react";
import type { ReactElement } from "react";
import {
  블라인드_조건_라벨,
  성별_라벨,
  종교_라벨,
  지역_라벨,
  체형_라벨,
} from "@ieum/labels";
import {
  BlindCondition,
  BodyShape,
  Gender,
  MBTI,
  Region,
  Religion,
} from "@ieum/prisma";
import { isMbti } from "@ieum/utils";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";

import { Layout } from "~/components/Layout";
import { api } from "~/utils/api";

interface Form {
  nickname: string;
  gender: Gender;
  birthYear: number;
  residence: string;
  height: number;
  bodyShape: BodyShape;
  mbti: MBTI;
  workplace: string;
  job: string;
  isSmoker: boolean;
  religion: Religion;
  idealMinAgeBirthYear: number | null;
  idealMaxAgeBirthYear: number | null;
  idealRegions: { value: Region }[];
  idealMinHeight: number | null;
  idealMaxHeight: number | null;
  idealBodyShapes: { value: BodyShape }[];
  idealPreferredMbtis: { value: MBTI }[];
  idealNonPreferredMbtis: { value: MBTI }[];
  idealIsSmokerOk: boolean;
  idealNonPreferredReligions: { value: Religion }[];
  nonNegotiableConditions: { value: BlindCondition }[];
}

const defaultValues: Form = {
  nickname: "",
  gender: Gender.MALE,
  birthYear: 0,
  residence: "",
  height: 0,
  bodyShape: BodyShape.NORMAL,
  mbti: "" as MBTI,
  workplace: "",
  job: "",
  isSmoker: false,
  religion: Religion.NONE,
  idealMinAgeBirthYear: null,
  idealMaxAgeBirthYear: null,
  idealRegions: [],
  idealMinHeight: null,
  idealMaxHeight: null,
  idealBodyShapes: [],
  idealPreferredMbtis: [],
  idealNonPreferredMbtis: [],
  idealIsSmokerOk: false,
  idealNonPreferredReligions: [],
  nonNegotiableConditions: [],
};

export function CreateBlindMemberPage() {
  const [done, setDone] = useState(false);
  const methods = useForm<Form>({
    defaultValues,
  });
  const { mutateAsync: createBlindMember } =
    api.blindMemberRouter.create.useMutation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-semibold">블라인드 회원 생성</h1>
      <FormProvider {...methods}>
        <form
          className="mt-4 flex flex-col gap-4"
          onSubmit={methods.handleSubmit(async (fields) => {
            if (!done) {
              return;
            }

            const payload = formToPayload(fields);

            await createBlindMember(payload);

            alert("생성 완료!");

            setDone(false);
            methods.reset();
          })}
        >
          <div
            className="flex gap-10"
            style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
          >
            <SelfFields />
            <IdealTypeFields />
            <NonNegotiableConditionsField />
          </div>
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
            >
              생성
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

function SelfFields() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<Form>();

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-bold">본인</h1>
      <label className="flex flex-col">
        닉네임
        <input
          className={`rounded border border-gray-300 ${
            errors.nickname ? "border-2 border-red-500" : ""
          }`}
          type="text"
          {...register("nickname", {
            required: true,
          })}
        />
      </label>
      <label className="flex flex-col">
        성별
        <Controller
          control={control}
          name="gender"
          render={({ field: { onChange, value } }) => {
            return (
              <select
                className={`rounded border border-gray-300 ${
                  errors.gender ? "border-2 border-red-500" : ""
                }`}
                value={value}
                onChange={onChange}
              >
                {Object.values(Gender).map((gender) => {
                  return (
                    <option key={gender} value={gender}>
                      {성별_라벨[gender]}
                    </option>
                  );
                })}
              </select>
            );
          }}
        />
      </label>
      <label className="flex flex-col">
        출생연도
        <input
          className={`rounded border border-gray-300 ${
            errors.birthYear ? "border-2 border-red-500" : ""
          }`}
          type="number"
          {...register("birthYear", {
            required: true,
            valueAsNumber: true,
            validate: (value) => {
              return value >= 1980 && value <= 2005;
            },
          })}
        />
      </label>
      <label className="flex flex-col">
        거주지
        <input
          className={`rounded border border-gray-300 ${
            errors.residence ? "border-2 border-red-500" : ""
          }`}
          type="text"
          {...register("residence", {
            required: true,
          })}
        />
      </label>
      <label className="flex flex-col">
        키
        <input
          className={`rounded border border-gray-300 ${
            errors.height ? "border-2 border-red-500" : ""
          }`}
          type="number"
          {...register("height", {
            required: true,
            valueAsNumber: true,
            validate: (value) => {
              return value >= 140 && value <= 200;
            },
          })}
        />
      </label>
      <label className="flex flex-col">
        체형
        <Controller
          control={control}
          name="bodyShape"
          render={({ field: { onChange, value } }) => {
            return (
              <select
                className={`rounded border border-gray-300 ${
                  errors.bodyShape ? "border-2 border-red-500" : ""
                }`}
                value={value}
                onChange={onChange}
              >
                {Object.values(BodyShape).map((bodyShape) => {
                  return (
                    <option key={bodyShape} value={bodyShape}>
                      {체형_라벨[bodyShape]}
                    </option>
                  );
                })}
              </select>
            );
          }}
        />
      </label>
      <label className="flex flex-col">
        MBTI
        <Controller
          control={control}
          name="mbti"
          rules={{
            required: true,
            validate: (value) => {
              return isMbti(value);
            },
          }}
          render={({ field: { onChange, value } }) => {
            return (
              <input
                className={`rounded border border-gray-300 ${
                  errors.mbti ? "border-2 border-red-500" : ""
                }`}
                value={value}
                onChange={(event) => {
                  onChange(event.target.value.toUpperCase());
                }}
              />
            );
          }}
        />
      </label>
      <label className="flex flex-col">
        직장
        <input
          className={`rounded border border-gray-300 ${
            errors.workplace ? "border-2 border-red-500" : ""
          }`}
          type="text"
          {...register("workplace", {
            required: true,
          })}
        />
      </label>
      <label className="flex flex-col">
        직무
        <input
          className={`rounded border border-gray-300 ${
            errors.job ? "border-2 border-red-500" : ""
          }`}
          type="text"
          {...register("job", {
            required: true,
          })}
        />
      </label>
      <label>
        흡연자
        <input
          className={`rounded border border-gray-300 ${
            errors.isSmoker ? "border-2 border-red-500" : ""
          }`}
          type="checkbox"
          {...register("isSmoker")}
        />
      </label>
      <label className="flex flex-col">
        종교
        <Controller
          control={control}
          name="religion"
          rules={{
            required: true,
          }}
          render={({ field: { onChange, value } }) => {
            return (
              <select
                className={`rounded border border-gray-300 ${
                  errors.religion ? "border-2 border-red-500" : ""
                }`}
                value={value}
                onChange={onChange}
              >
                {Object.values(Religion).map((religion) => {
                  return (
                    <option key={religion} value={religion}>
                      {종교_라벨[religion]}
                    </option>
                  );
                })}
              </select>
            );
          }}
        />
      </label>
    </div>
  );
}

function IdealTypeFields() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<Form>();
  const {
    fields: idealRegionFields,
    append: appendIdealRegion,
    remove: removeIdealRegion,
  } = useFieldArray({
    control,
    name: "idealRegions",
  });
  const {
    fields: preferredBodyShapeFields,
    append: appendPreferredBodyShape,
    remove: removePreferredBodyShape,
  } = useFieldArray({
    control,
    name: "idealBodyShapes",
  });
  const {
    fields: preferredMbtisFields,
    append: appendPreferredMbtis,
    remove: removePreferredMbtis,
  } = useFieldArray({
    control,
    name: "idealPreferredMbtis",
  });
  const {
    fields: nonPreferredMbtisFields,
    append: appendNonPreferredMbtis,
    remove: removeNonPreferredMbtis,
  } = useFieldArray({
    control,
    name: "idealNonPreferredMbtis",
  });
  const {
    fields: nonPreferredReligionFields,
    append: appendNonPreferredReligion,
    remove: removeNonPreferredReligion,
  } = useFieldArray({
    control,
    name: "idealNonPreferredReligions",
  });

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-bold">이상형</h1>
      <label className="flex flex-col">
        최소 나이 출생연도
        <input
          className={`rounded border border-gray-300 ${
            errors.idealMinAgeBirthYear ? "border-2 border-red-500" : ""
          }`}
          type="text"
          {...register("idealMinAgeBirthYear", {
            setValueAs: (value: string) => {
              return value === "" ? null : Number(value);
            },
            validate: (value) => {
              return (
                value == null ||
                (!isNaN(value) && value >= 1980 && value <= 2005)
              );
            },
          })}
        />
      </label>
      <label className="flex flex-col">
        최대 나이 출생연도
        <input
          className={`rounded border border-gray-300 ${
            errors.idealMaxAgeBirthYear ? "border-2 border-red-500" : ""
          }`}
          type="text"
          {...register("idealMaxAgeBirthYear", {
            setValueAs: (value: string) => {
              return value === "" ? null : Number(value);
            },
            validate: (value) => {
              return (
                value == null ||
                (!isNaN(value) && value >= 1980 && value <= 2005)
              );
            },
          })}
        />
      </label>
      <div>
        지역
        <div className="grid grid-cols-2 gap-2">
          {Object.values(Region).map((region) => {
            return (
              <label key={region} className="flex gap-2">
                <input
                  className={`rounded border border-gray-300 ${
                    errors.idealRegions ? "border-2 border-red-500" : ""
                  }`}
                  type="checkbox"
                  checked={idealRegionFields.some((field) => {
                    return field.value === region;
                  })}
                  onChange={(e) => {
                    if (e.target.checked) {
                      appendIdealRegion({ value: region });
                    } else {
                      removeIdealRegion(
                        idealRegionFields.findIndex(
                          (field) => field.value === region,
                        ),
                      );
                    }
                  }}
                />
                {지역_라벨[region]}
              </label>
            );
          })}
        </div>
      </div>
      <label className="flex flex-col">
        최소 키
        <input
          className={`rounded border border-gray-300 ${
            errors.idealMinHeight ? "border-2 border-red-500" : ""
          }`}
          type="number"
          {...register("idealMinHeight", {
            setValueAs: (value: string) => {
              return value === "" ? null : Number(value);
            },
            validate: (value) => {
              return (
                value == null || (!isNaN(value) && value >= 140 && value <= 200)
              );
            },
          })}
        />
      </label>
      <label className="flex flex-col">
        최대 키
        <input
          className={`rounded border border-gray-300 ${
            errors.idealMaxHeight ? "border-2 border-red-500" : ""
          }`}
          type="number"
          {...register("idealMaxHeight", {
            setValueAs: (value: string) => {
              return value === "" ? null : Number(value);
            },
            validate: (value) => {
              return (
                value == null || (!isNaN(value) && value >= 140 && value <= 200)
              );
            },
          })}
        />
      </label>
      <div>
        체형
        <div className="grid grid-cols-3 gap-2">
          {Object.values(BodyShape).map((bodyShape) => {
            return (
              <label key={bodyShape} htmlFor={bodyShape} className="flex gap-2">
                <input
                  id={bodyShape}
                  className={`rounded border border-gray-300 ${
                    errors.idealBodyShapes ? "border-2 border-red-500" : ""
                  }`}
                  type="checkbox"
                  checked={preferredBodyShapeFields.some((field) => {
                    return field.value === bodyShape;
                  })}
                  onChange={(e) => {
                    if (e.target.checked) {
                      appendPreferredBodyShape({ value: bodyShape });
                    } else {
                      removePreferredBodyShape(
                        preferredBodyShapeFields.findIndex(
                          (field) => field.value === bodyShape,
                        ),
                      );
                    }
                  }}
                />
                {체형_라벨[bodyShape]}
              </label>
            );
          })}
        </div>
      </div>
      <div>
        선호 MBTI
        <div className="grid grid-cols-4 gap-2">
          {Object.values(MBTI).map((mbti) => {
            return (
              <label key={mbti} className="flex gap-2">
                <input
                  className={`rounded border border-gray-300 ${
                    errors.idealPreferredMbtis ? "border-2 border-red-500" : ""
                  }`}
                  type="checkbox"
                  checked={preferredMbtisFields.some((field) => {
                    return field.value === mbti;
                  })}
                  onChange={(e) => {
                    if (e.target.checked) {
                      appendPreferredMbtis({ value: mbti });
                    } else {
                      removePreferredMbtis(
                        preferredMbtisFields.findIndex(
                          (field) => field.value === mbti,
                        ),
                      );
                    }
                  }}
                />
                {mbti}
              </label>
            );
          })}
        </div>
      </div>
      <div>
        기피 MBTI
        <div className="grid grid-cols-4 gap-2">
          {Object.values(MBTI).map((mbti) => {
            return (
              <label key={mbti} className="flex gap-2">
                <input
                  className={`rounded border border-gray-300 ${
                    errors.idealNonPreferredMbtis
                      ? "border-2 border-red-500"
                      : ""
                  }`}
                  type="checkbox"
                  checked={nonPreferredMbtisFields.some((field) => {
                    return field.value === mbti;
                  })}
                  onChange={(e) => {
                    if (e.target.checked) {
                      appendNonPreferredMbtis({ value: mbti });
                    } else {
                      removeNonPreferredMbtis(
                        nonPreferredMbtisFields.findIndex(
                          (field) => field.value === mbti,
                        ),
                      );
                    }
                  }}
                />
                {mbti}
              </label>
            );
          })}
        </div>
      </div>
      <label>
        흡연 괜찮음{" "}
        <input
          className={`rounded border border-gray-300 ${
            errors.idealIsSmokerOk ? "border-2 border-red-500" : ""
          }`}
          type="checkbox"
          {...register("idealIsSmokerOk")}
        />
      </label>
      <div>
        기피 종교
        <div className="grid grid-cols-3 gap-2">
          {[Religion.CHRISTIAN, Religion.CATHOLIC, Religion.BUDDHIST].map(
            (religion) => {
              return (
                <label key={religion} className="flex gap-2">
                  <input
                    className={`rounded border border-gray-300 ${
                      errors.idealNonPreferredReligions
                        ? "border-2 border-red-500"
                        : ""
                    }`}
                    type="checkbox"
                    checked={nonPreferredReligionFields.some((field) => {
                      return field.value === religion;
                    })}
                    onChange={(e) => {
                      if (e.target.checked) {
                        appendNonPreferredReligion({ value: religion });
                      } else {
                        removeNonPreferredReligion(
                          nonPreferredReligionFields.findIndex(
                            (field) => field.value === religion,
                          ),
                        );
                      }
                    }}
                  />
                  {종교_라벨[religion]}
                </label>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}

function NonNegotiableConditionsField() {
  const {
    control,
    formState: { errors },
  } = useFormContext<Form>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "nonNegotiableConditions",
  });

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-bold">필수 조건</h1>
      <div className="flex flex-col gap-1">
        {Object.values(BlindCondition).map((condition) => {
          return (
            <label key={condition} className="flex gap-2">
              <input
                className={`rounded border border-gray-300 ${
                  errors.nonNegotiableConditions
                    ? "border-2 border-red-500"
                    : ""
                }`}
                type="checkbox"
                checked={fields.some((field) => {
                  return field.value === condition;
                })}
                onChange={(e) => {
                  if (e.target.checked) {
                    append({ value: condition });
                  } else {
                    remove(
                      fields.findIndex((field) => field.value === condition),
                    );
                  }
                }}
              />
              {블라인드_조건_라벨[condition]}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function formToPayload(form: Form) {
  const {
    idealMinAgeBirthYear,
    idealMaxAgeBirthYear,
    idealRegions,
    idealMinHeight,
    idealMaxHeight,
    idealBodyShapes,
    idealPreferredMbtis,
    idealNonPreferredMbtis,
    idealNonPreferredReligions,
    nonNegotiableConditions,
  } = form;

  return {
    ...form,
    idealMinAgeBirthYear:
      idealMinAgeBirthYear == null || isNaN(idealMinAgeBirthYear)
        ? null
        : idealMinAgeBirthYear,
    idealMaxAgeBirthYear:
      idealMaxAgeBirthYear == null || isNaN(idealMaxAgeBirthYear)
        ? null
        : idealMaxAgeBirthYear,
    idealRegions: idealRegions.map((region) => {
      return region.value;
    }),
    idealMinHeight:
      idealMinHeight == null || isNaN(idealMinHeight) ? null : idealMinHeight,
    idealMaxHeight:
      idealMaxHeight == null || isNaN(idealMaxHeight) ? null : idealMaxHeight,
    idealBodyShapes: idealBodyShapes.map((bodyShape) => {
      return bodyShape.value;
    }),
    idealPreferredMbtis: idealPreferredMbtis.map((mbti) => {
      return mbti.value;
    }),
    idealNonPreferredMbtis: idealNonPreferredMbtis.map((mbti) => {
      return mbti.value;
    }),
    idealNonPreferredReligions: idealNonPreferredReligions.map((religion) => {
      return religion.value;
    }),
    nonNegotiableConditions: nonNegotiableConditions.map((condition) => {
      return condition.value;
    }),
  };
}

CreateBlindMemberPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
