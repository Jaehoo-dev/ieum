import { useEffect } from "react";
import { Gender, RegionV2 } from "@ieum/prisma";
import { assert } from "@ieum/utils";
import { useForm } from "react-hook-form";

type RegisterForm = {
  nickname: string;
  gender: Gender | null;
  birthYear: number | null;
  region: RegionV2 | null;
  height: number | null;
  bodyShape: string;
  job: string;
  selfIntroduction: string;
  personalInfoConsent: boolean | null;
};

const defaultRegisterForm: RegisterForm = {
  nickname: "",
  gender: null,
  birthYear: null,
  region: null,
  height: null,
  bodyShape: "",
  job: "",
  selfIntroduction: "",
  personalInfoConsent: null,
};

const STORAGE_KEY = "@ieum-blind/register/values";
const EXPIRY_KEY = "@ieum-blind/register/expiresAt";
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
  gender,
  birthYear,
  region,
  height,
  personalInfoConsent,
  ...form
}: RegisterForm) {
  assert(gender != null, "gender should not be null");
  assert(birthYear != null, "birthYear should not be null");
  assert(region != null, "region should not be null");
  assert(height != null, "height should not be null");
  assert(personalInfoConsent != null, "personalInfoConsent should not be null");

  return {
    ...form,
    gender,
    birthYear,
    region,
    height,
    personalInfoConsent,
  };
}
