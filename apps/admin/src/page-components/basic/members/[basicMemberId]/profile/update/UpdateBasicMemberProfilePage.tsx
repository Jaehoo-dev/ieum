import type { ReactElement } from "react";
import { Suspense, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@ieum/supabase";
import { assert, isEmptyStringOrNil } from "@ieum/utils";
import { nanoid } from "nanoid";
import { Controller, useForm } from "react-hook-form";

import { BasicMemberCard } from "~/components/BasicMemberCard";
import { Layout } from "~/components/Layout";
import { TextareaInput } from "~/components/TextareaInput";
import { TextInput } from "~/components/TextInput";
import { api } from "~/utils/api";
import { ImageField } from "../ImageField";
import type { ProfileForm } from "../ProfileForm";

export function UpdateBasicMemberProfilePage() {
  return (
    <div className="flex min-h-screen flex-col items-center gap-6">
      <h1 className="text-4xl font-semibold">베이직 회원 프로필 수정</h1>
      <Suspense>
        <Resolved />
      </Suspense>
    </div>
  );
}

function Resolved() {
  const router = useRouter();

  assert(router.query.basicMemberId != null, "basicMemberId must be provided");

  const basicMemberId = Number(router.query.basicMemberId);

  assert(!isNaN(basicMemberId), "basicMemberId must be a number");

  const [member] = api.basicMemberRouter.findById.useSuspenseQuery({
    id: basicMemberId,
  });
  const [profile] = api.basicMemberRouter.getProfileByMemberId.useSuspenseQuery(
    {
      memberId: basicMemberId,
    },
  );
  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } =
    api.basicMemberRouter.updateProfile.useMutation();

  const {
    register,
    control,
    watch,
    getValues,
    setValue,
    clearErrors,
    formState: { errors },
    handleSubmit,
  } = useForm<ProfileForm>({
    defaultValues: {
      memberId: member.id,
      profile,
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
          assert(
            fields.profile.image1BucketPath != null,
            "image1BucketPath is required",
          );

          await updateProfile({
            memberId: fields.memberId,
            profile: {
              ...fields.profile,
              image1BucketPath: fields.profile.image1BucketPath,
            },
          });

          alert("프로필 수정 완료");
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
        <TextInput
          label="흡연"
          {...register("profile.isSmoker", {
            required: true,
          })}
        />
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
        {isEmptyStringOrNil(watch("profile.image1BucketPath")) ? (
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
        ) : (
          <div className="flex flex-row gap-2">
            <TextInput
              label="사진1 버킷"
              error={errors.profile?.image1BucketPath != null}
              {...register("profile.image1BucketPath", {
                required: true,
              })}
            />
            <div className="flex items-end">
              <RemoveButton
                bucketPath={getValues("profile.image1BucketPath")!}
                afterRemove={() => {
                  setValue("profile.image1BucketPath", null);
                }}
              />
            </div>
          </div>
        )}
        {isEmptyStringOrNil(watch("profile.image2BucketPath")) ? (
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
              clearErrors("profile.image2BucketPath");
              alert("사진2 등록 완료");
            }}
            error={errors.profile?.image2BucketPath != null}
          />
        ) : (
          <div className="flex flex-row gap-2">
            <TextInput
              label="사진2 버킷"
              error={errors.profile?.image2BucketPath != null}
              {...register("profile.image2BucketPath", {
                setValueAs: (value: string | null) => {
                  return isEmptyStringOrNil(value) ? null : value;
                },
              })}
            />
            <div className="flex items-end">
              <RemoveButton
                bucketPath={getValues("profile.image2BucketPath")!}
                afterRemove={() => {
                  setValue("profile.image2BucketPath", null);
                }}
              />
            </div>
          </div>
        )}
        {isEmptyStringOrNil(watch("profile.image3BucketPath")) ? (
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
              clearErrors("profile.image3BucketPath");
              alert("사진3 등록 완료");
            }}
            error={errors.profile?.image3BucketPath != null}
          />
        ) : (
          <div className="flex flex-row gap-2">
            <TextInput
              label="사진3 버킷"
              error={errors.profile?.image3BucketPath != null}
              {...register("profile.image3BucketPath", {
                setValueAs: (value: string | null) => {
                  return isEmptyStringOrNil(value) ? null : value;
                },
              })}
            />
            <div className="flex items-end">
              <RemoveButton
                bucketPath={getValues("profile.image3BucketPath")!}
                afterRemove={() => {
                  setValue("profile.image3BucketPath", null);
                }}
              />
            </div>
          </div>
        )}
        <button
          type="submit"
          className="mt-2 rounded bg-blue-500 px-4 py-3 text-xl font-medium text-white"
          disabled={isUpdatingProfile}
        >
          {isUpdatingProfile ? "수정중.." : "프로필 수정"}
        </button>
      </form>
    </div>
  );
}

function RemoveButton({
  bucketPath,
  afterRemove,
}: {
  bucketPath: string;
  afterRemove: () => void;
}) {
  return (
    <button
      type="button"
      className="rounded-lg bg-red-500 px-3 py-2 text-sm text-white"
      onClick={async () => {
        await supabase.storage
          .from(
            process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_IMAGES_BUCKET_NAME!,
          )
          .remove([bucketPath]);

        afterRemove();
      }}
    >
      삭제
    </button>
  );
}

UpdateBasicMemberProfilePage.getLayout = function getLayout(
  page: ReactElement,
) {
  return <Layout>{page}</Layout>;
};
