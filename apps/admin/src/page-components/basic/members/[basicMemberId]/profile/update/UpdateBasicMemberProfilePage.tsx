import type { ReactElement } from "react";
import { Suspense } from "react";
import { useRouter } from "next/router";
import { assert, isEmptyStringOrNil } from "@ieum/utils";
import { Controller, useForm } from "react-hook-form";

import { BasicMemberCard } from "~/components/BasicMemberCard";
import { Layout } from "~/components/Layout";
import { TextareaInput } from "~/components/TextareaInput";
import { TextInput } from "~/components/TextInput";
import { ImagePreview } from "~/page-components/basic/components/ImagePreview";
import { VideoPreview } from "~/page-components/basic/components/VideoPreview";
import { api } from "~/utils/api";
import type { ProfileForm } from "../ProfileForm";

export function UpdateBasicMemberProfilePage() {
  return (
    <div className="flex min-h-screen flex-col items-center gap-4 py-2">
      <h1 className="text-2xl font-semibold">베이직 회원 프로필 수정</h1>
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
    formState: { errors },
    handleSubmit,
  } = useForm<ProfileForm>({
    defaultValues: {
      memberId: member.id,
      profile,
    },
  });
  return (
    <div className="flex flex-row gap-12">
      <BasicMemberCard member={member} defaultMode="DETAILED" />
      <form
        className="flex flex-col gap-3"
        onSubmit={handleSubmit(async (fields) => {
          await updateProfile({
            memberId: fields.memberId,
            profile: fields.profile,
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
          rows={6}
        />
        <TextareaInput
          label="이성상"
          {...register("profile.idealTypeDescription", {
            setValueAs: (value: string | null) => {
              return isEmptyStringOrNil(value) ? null : value;
            },
          })}
        />
        <div className="flex flex-row gap-4">
          {member.videos.map((video) => {
            return (
              <div key={video.id}>
                <VideoPreview bucketPath={video.bucketPath} />
              </div>
            );
          })}
          {member.images.map((image) => {
            return (
              <div key={image.id}>
                <ImagePreview bucketPath={image.bucketPath} />
              </div>
            );
          })}
        </div>
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

UpdateBasicMemberProfilePage.getLayout = function getLayout(
  page: ReactElement,
) {
  return <Layout>{page}</Layout>;
};
