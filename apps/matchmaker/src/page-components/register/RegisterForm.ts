import { useEffect } from "react";
import {
  AnnualIncome,
  AssetsValue,
  BodyShape,
  EducationLevel,
  ExercisePerWeek,
  Gender,
  MarriageStatus,
  MBTI,
  Region,
  Religion,
} from "@ieum/prisma";
import { assert, krHyphenToKr } from "@ieum/utils";
import { useForm } from "react-hook-form";

export type RegisterForm = {
  name: string;
  phoneNumber: string;
  gender: Gender | null;
  marriageStatus: MarriageStatus | null;
  birthYear: number | null;
  residence: string;
  height: number | null;
  weight: number | null;
  confidentFacialBodyPart: string | null;
  educationLevel: EducationLevel | null;
  graduatedUniversity: string | null;
  workplace: string | null;
  job: string | null;
  annualIncome: AnnualIncome | null;
  assetsValue: AssetsValue | null;
  mbti: MBTI | null;
  characteristics: string[];
  hobby: string;
  exercisePerWeek: ExercisePerWeek | null;
  exerciseType: string | null;
  isSmoker: boolean | null;
  isDrinker: boolean | null;
  alcoholConsumption: string | null;
  alcoholTolerance: string | null;
  religion: Religion | null;
  hasCar: boolean | null;
  hasTattoo: boolean | null;
  hasPet: boolean | null;
  datingStyle: string;
  contactStyle: string;
  marriagePlan: string;
  selfIntroduction: string;
  imageBucketPaths: string[];
  videoBucketPaths: string[];
  audioBucketPaths: string[];

  idealMinAgeBirthYear: number | null;
  idealMaxAgeBirthYear: number | null;
  idealRegions: Region[];
  idealMinHeight: number | null;
  idealMaxHeight: number | null;
  idealBodyShapes: BodyShape[];
  idealFacialBodyPart: string | null;
  idealEducationLevel: EducationLevel | null;
  idealSchoolLevel: string | null;
  idealNonPreferredWorkplace: string | null;
  idealNonPreferredJob: string | null;
  idealMinAnnualIncome: AnnualIncome | null;
  idealPreferredMbtis: MBTI[];
  idealNonPreferredMbtis: MBTI[];
  idealCharacteristics: string[];
  idealIsSmokerOk: boolean | null;
  idealPreferredReligions: Religion[];
  idealNonPreferredReligions: Religion[];
  idealIsTattooOk: boolean | null;
  idealTypeDescription: string;

  referrerCode: string | null;
  memo: string | null;

  personalInfoConsent: boolean | null;
};

const defaultRegisterForm: RegisterForm = {
  name: "",
  phoneNumber: "",
  gender: null,
  marriageStatus: null,
  birthYear: null,
  residence: "",
  height: null,
  weight: null,
  confidentFacialBodyPart: null,
  educationLevel: null,
  graduatedUniversity: null,
  workplace: null,
  job: null,
  annualIncome: null,
  assetsValue: null,
  mbti: null,
  characteristics: [],
  hobby: "",
  exercisePerWeek: null,
  exerciseType: null,
  isSmoker: null,
  isDrinker: null,
  alcoholConsumption: null,
  alcoholTolerance: null,
  religion: null,
  hasCar: null,
  hasTattoo: null,
  hasPet: null,
  datingStyle: "",
  contactStyle: "",
  marriagePlan: "",
  selfIntroduction: "",
  imageBucketPaths: [],
  videoBucketPaths: [],
  audioBucketPaths: [],
  idealMinAgeBirthYear: null,
  idealMaxAgeBirthYear: null,
  idealRegions: [],
  idealMinHeight: null,
  idealMaxHeight: null,
  idealBodyShapes: [],
  idealFacialBodyPart: null,
  idealEducationLevel: null,
  idealSchoolLevel: null,
  idealNonPreferredWorkplace: null,
  idealNonPreferredJob: null,
  idealMinAnnualIncome: null,
  idealPreferredMbtis: [],
  idealNonPreferredMbtis: [],
  idealCharacteristics: [],
  idealIsSmokerOk: null,
  idealPreferredReligions: [],
  idealNonPreferredReligions: [],
  idealIsTattooOk: null,
  idealTypeDescription: "",
  referrerCode: null,
  memo: null,
  personalInfoConsent: null,
};

export const registerFormId = "BASIC_MEMBER_REGISTER_FORM";

const STORAGE_KEY = "@ieum/register/values";
const EXPIRY_KEY = "@ieum/register/expiresAt";
const EXPIRY_DURATION = 1000 * 60 * 60 * 24;

export function useRegisterForm() {
  const form = useForm<RegisterForm>({
    defaultValues: defaultRegisterForm,
    mode: "onBlur",
  });

  useEffect(() => {
    const storedValues = localStorage.getItem(STORAGE_KEY);
    const storedExpiry = localStorage.getItem(EXPIRY_KEY);

    if (storedExpiry != null) {
      const parsedExpiry = JSON.parse(storedExpiry);

      if (parsedExpiry < Date.now()) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(EXPIRY_KEY);

        return;
      }
    }

    if (storedValues != null) {
      const parsedValues = JSON.parse(storedValues);
      Object.keys(parsedValues).forEach((field) => {
        form.setValue(field as keyof RegisterForm, parsedValues[field]);
      });
    }
  }, [STORAGE_KEY, form.setValue]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
      localStorage.setItem(
        EXPIRY_KEY,
        JSON.stringify(Date.now() + EXPIRY_DURATION),
      );
    });

    return () => subscription.unsubscribe();
  }, [STORAGE_KEY, form.watch]);

  return {
    clearCache: () => {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(EXPIRY_KEY);
    },
    ...form,
  };
}

export function formToPayload({
  phoneNumber,
  gender,
  marriageStatus,
  birthYear,
  height,
  weight,
  educationLevel,
  workplace,
  exercisePerWeek,
  isSmoker,
  isDrinker,
  religion,
  hasCar,
  hasTattoo,
  hasPet,
  idealIsSmokerOk,
  idealIsTattooOk,
  characteristics,
  idealCharacteristics,
  personalInfoConsent,
  ...form
}: RegisterForm) {
  assert(gender != null, "gender should not be null");
  assert(marriageStatus != null, "marriageStatus should not be null");
  assert(birthYear != null, "birthYear should not be null");
  assert(height != null, "height should not be null");
  assert(weight != null, "weight should not be null");
  assert(educationLevel != null, "educationLevel should not be null");
  assert(workplace != null, "workplace should not be null");
  assert(exercisePerWeek != null, "exercisePerWeek should not be null");
  assert(isSmoker != null, "isSmoker should not be null");
  assert(isDrinker != null, "isDrinker should not be null");
  assert(religion != null, "religion should not be null");
  assert(hasCar != null, "hasCar should not be null");
  assert(hasTattoo != null, "hasTattoo should not be null");
  assert(hasPet != null, "hasPet should not be null");
  assert(idealIsSmokerOk != null, "idealIsSmokerOk should not be null");
  assert(idealIsTattooOk != null, "idealIsTattooOk should not be null");
  assert(personalInfoConsent != null, "personalInfoConsent should not be null");

  return {
    ...form,
    phoneNumber: krHyphenToKr(phoneNumber),
    gender,
    marriageStatus,
    birthYear,
    height,
    weight,
    educationLevel,
    workplace,
    exercisePerWeek,
    isSmoker,
    isDrinker,
    religion,
    hasCar,
    hasTattoo,
    hasPet,
    idealIsSmokerOk,
    idealIsTattooOk,
    characteristics:
      characteristics.length > 0 ? characteristics.join(", ") : null,
    idealCharacteristics:
      idealCharacteristics.length > 0 ? idealCharacteristics.join(", ") : null,
    personalInfoConsent,
  };
}
