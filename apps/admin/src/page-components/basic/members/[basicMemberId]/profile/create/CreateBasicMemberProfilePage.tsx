import assert from "assert";
import { Suspense, useState } from "react";
import type { InputHTMLAttributes, ReactElement } from "react";
import { useRouter } from "next/router";
import { 연간_벌이_라벨, 자산_라벨, 학력_라벨 } from "@ieum/labels";
import type { BasicMember } from "@ieum/prisma";
import { supabase } from "@ieum/supabase";
import { isEmptyStringOrNil } from "@ieum/utils";
import { nanoid } from "nanoid";
import { Controller, useForm } from "react-hook-form";

import { BasicMemberCard } from "~/components/BasicMemberCard";
import { Checkbox } from "~/components/Checkbox";
import { Layout } from "~/components/Layout";
import { TextareaInput } from "~/components/TextareaInput";
import { TextInput } from "~/components/TextInput";
import { api } from "~/utils/api";

export function CreateBasicMemberProfilePage() {
  return (
    <div className="flex min-h-screen flex-col items-center gap-6">
      <h1 className="text-4xl font-semibold">베이직 회원 프로필 생성</h1>
      <Suspense>
        <Resolved />
      </Suspense>
    </div>
  );
}

interface Form {
  memberId: BasicMember["id"];
  profile: {
    birthYear: number;
    residence: string;
    height: number;
    education: string;
    job: string;
    annualIncome: string | null;
    assetsValue: string | null;
    mbti: string | null;
    hobby: string | null;
    characteristic: string | null;
    lifePhilosophy: string | null;
    datingStyle: string | null;
    isSmoker: boolean;
    religion: string;
    selfIntroduction: string | null;
    idealTypeDescription: string | null;
    image1BucketPath: string;
    image2BucketPath: string | null;
    image3BucketPath: string | null;
  };
}

function Resolved() {
  const router = useRouter();

  assert(router.query.basicMemberId != null, "basicMemberId must be provided");

  const basicMemberId = Number(router.query.basicMemberId);

  assert(!isNaN(basicMemberId), "basicMemberId must be a number");

  const [member] = api.basicMemberRouter.findById.useSuspenseQuery({
    id: basicMemberId,
  });
  const { mutateAsync: createProfile, isPending: isCreatingProfile } =
    api.basicMemberRouter.createProfile.useMutation();

  const {
    register,
    control,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
    handleSubmit,
  } = useForm<Form>({
    defaultValues: {
      memberId: member.id,
      profile: {
        birthYear: member.birthYear,
        residence: member.residence,
        height: member.height,
        education: `${member.graduatedUniversity} ${
          학력_라벨[member.educationLevel]
        }`,
        job: "",
        annualIncome:
          member.annualIncome == null
            ? ""
            : 연간_벌이_라벨[member.annualIncome],
        assetsValue:
          member.assetsValue == null ? "" : 자산_라벨[member.assetsValue],
        mbti: member.mbti,
        hobby: member.hobby,
        characteristic: member.characteristics,
        lifePhilosophy: member.lifePhilosophy,
        datingStyle: member.datingStyle,
        isSmoker: member.isSmoker,
        religion: member.religion,
        selfIntroduction: member.selfIntroduction,
        idealTypeDescription: member.idealTypeDescription,
        image1BucketPath: "",
        image2BucketPath: null,
        image3BucketPath: null,
      },
    },
  });
  const [imageFile1, setImageFile1] = useState<File>();
  const [imageFile2, setImageFile2] = useState<File>();
  const [imageFile3, setImageFile3] = useState<File>();

  return (
    <div className="grid grid-cols-2 gap-12">
      <BasicMemberCard member={member} defaultMode="DETAILED" />
      <form
        className="flex flex-col gap-3"
        onSubmit={handleSubmit(async (fields) => {
          if (isEmptyStringOrNil(fields.profile.image1BucketPath)) {
            setError("profile.image1BucketPath", {
              type: "required",
              message: "사진1을 등록해주세요",
            });

            return;
          }

          await createProfile({
            memberId: fields.memberId,
            profile: fields.profile,
          });

          alert("프로필 생성 완료");
        })}
      >
        <div className="grid grid-cols-3 gap-2">
          <TextInput
            label="출생연도"
            error={errors.profile?.residence != null}
            {...register("profile.birthYear", {
              required: true,
              valueAsNumber: true,
              validate: (value) => {
                return value >= 1980 && value <= 2005;
              },
            })}
          />
          <TextInput
            label="거주지"
            error={errors.profile?.residence != null}
            {...register("profile.residence", { required: true })}
          />
          <TextInput
            label="키"
            error={errors.profile?.height != null}
            {...register("profile.height", {
              required: true,
              valueAsNumber: true,
              validate: (value) => {
                return value >= 140 && value <= 200;
              },
            })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <TextInput
            label="학력"
            error={errors.profile?.education != null}
            {...register("profile.education", { required: true })}
          />
          <TextInput
            label="직업"
            error={errors.profile?.job != null}
            {...register("profile.job", { required: true })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <TextInput
            label="연간 수입 구간"
            error={errors.profile?.annualIncome != null}
            {...register("profile.annualIncome", {
              setValueAs: (value: string | null) => {
                return isEmptyStringOrNil(value) ? null : value;
              },
            })}
          />
          <TextInput
            label="자산 구간"
            error={errors.profile?.assetsValue != null}
            {...register("profile.assetsValue", {
              setValueAs: (value: string | null) => {
                return isEmptyStringOrNil(value) ? null : value;
              },
            })}
          />
        </div>
        <Controller
          control={control}
          name="profile.mbti"
          render={({ field: { onChange, value } }) => {
            return (
              <TextInput
                label="MBTI"
                error={errors.profile?.mbti != null}
                value={value ?? ""}
                onChange={({ target: { value } }) => {
                  isEmptyStringOrNil(value) ? onChange(null) : onChange(value);
                }}
              />
            );
          }}
        />
        <TextareaInput
          label="취미/관심사"
          error={errors.profile?.hobby != null}
          {...register("profile.hobby", {
            setValueAs: (value: string | null) => {
              return isEmptyStringOrNil(value) ? null : value;
            },
          })}
          rows={1}
        />
        <TextInput
          label="특징"
          error={errors.profile?.characteristic != null}
          {...register("profile.characteristic", {
            setValueAs: (value: string | null) => {
              return isEmptyStringOrNil(value) ? null : value;
            },
          })}
        />
        <TextareaInput
          label="인생관"
          error={errors.profile?.lifePhilosophy != null}
          {...register("profile.lifePhilosophy", {
            setValueAs: (value: string | null) => {
              return isEmptyStringOrNil(value) ? null : value;
            },
          })}
        />
        <TextareaInput
          label="데이트 스타일"
          error={errors.profile?.datingStyle != null}
          {...register("profile.datingStyle", {
            setValueAs: (value: string | null) => {
              return isEmptyStringOrNil(value) ? null : value;
            },
          })}
        />
        <div>
          흡연
          <Checkbox label="함" {...register("profile.isSmoker")} />
        </div>
        <TextInput
          label="종교"
          {...register("profile.religion", {
            required: true,
          })}
        />
        <TextareaInput
          label="자기소개"
          {...register("profile.selfIntroduction", {
            setValueAs: (value: string | null) => {
              return isEmptyStringOrNil(value) ? null : value;
            },
          })}
        />
        <TextareaInput
          label="이성상"
          {...register("profile.idealTypeDescription", {
            setValueAs: (value: string | null) => {
              return isEmptyStringOrNil(value) ? null : value;
            },
          })}
        />
        <ImageField
          label="사진1"
          onChange={(file) => {
            setImageFile1(file);
          }}
          onRegister={async () => {
            if (imageFile1 == null) {
              return;
            }

            const { data, error } = await supabase.storage
              .from(
                process.env
                  .NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_IMAGES_BUCKET_NAME!,
              )
              .upload(nanoid(), imageFile1);

            assert(error == null, error?.message);

            setValue("profile.image1BucketPath", data.path);
            clearErrors("profile.image1BucketPath");
            alert("사진1 등록 완료");
          }}
          error={errors.profile?.image1BucketPath != null}
        />
        <ImageField
          label="사진2"
          onChange={(file) => {
            setImageFile2(file);
          }}
          onRegister={async () => {
            if (imageFile2 == null) {
              return;
            }

            const { data, error } = await supabase.storage
              .from(
                process.env
                  .NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_IMAGES_BUCKET_NAME!,
              )
              .upload(nanoid(), imageFile2);

            assert(error == null, error?.message);

            setValue("profile.image2BucketPath", data.path);
            alert("사진2 등록 완료");
          }}
          error={errors.profile?.image2BucketPath != null}
        />
        <ImageField
          label="사진3"
          onChange={(file) => {
            setImageFile3(file);
          }}
          onRegister={async () => {
            if (imageFile3 == null) {
              return;
            }

            const { data, error } = await supabase.storage
              .from(
                process.env
                  .NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_IMAGES_BUCKET_NAME!,
              )
              .upload(nanoid(), imageFile3);

            assert(error == null, error?.message);

            setValue("profile.image3BucketPath", data.path);
            alert("사진3 등록 완료");
          }}
          error={errors.profile?.image3BucketPath != null}
        />
        <button
          type="submit"
          className="mt-2 rounded bg-blue-500 px-4 py-3 text-xl font-medium text-white"
          disabled={isCreatingProfile}
        >
          {isCreatingProfile ? "생성중.." : "프로필 생성"}
        </button>
      </form>
    </div>
  );
}

interface ImageFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  onChange: (file: File | undefined) => void;
  onRegister: () => void;
  error?: boolean;
}

function ImageField({
  label,
  onChange,
  onRegister,
  error,
  ...props
}: ImageFieldProps) {
  return (
    <div className="flex items-center gap-2">
      <div>
        {label}
        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*"
            className={`flex-1 rounded p-2 ${
              error ? "border-2 border-red-500" : "border border-gray-300"
            }`}
            onChange={(e) => {
              onChange(e.target.files?.[0]);
            }}
            {...props}
          />
          <button
            type="button"
            className="rounded bg-gray-300 px-4 py-2"
            onClick={onRegister}
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
}

CreateBasicMemberProfilePage.getLayout = function getLayout(
  page: ReactElement,
) {
  return <Layout>{page}</Layout>;
};
