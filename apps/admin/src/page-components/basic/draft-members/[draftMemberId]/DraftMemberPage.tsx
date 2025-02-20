import type { ReactElement } from "react";
import { Suspense, useState } from "react";
import { useRouter } from "next/router";
import {
  연간_벌이_라벨,
  자산_라벨,
  종교_라벨,
  주간_운동량_라벨,
  지역_라벨,
  체형_라벨,
  최소_연간_벌이_라벨,
  최소_학력_라벨,
  학력_라벨,
} from "@ieum/constants";
import { RegionV2 } from "@ieum/prisma";
import { supabase } from "@ieum/supabase";
import {
  assert,
  calculateBmi,
  formatUniqueMemberName,
  getBmiLabel,
} from "@ieum/utils";

import { Layout } from "~/components/Layout";
import { Select } from "~/components/Select";
import { TextareaInput } from "~/components/TextareaInput";
import { TextInput } from "~/components/TextInput";
import { api } from "~/utils/api";

export function DraftMemberPage() {
  return (
    <div className="flex min-h-screen flex-col items-center gap-4 py-2">
      <h1 className="text-2xl font-semibold">신규 가입 회원 정보</h1>
      <Suspense>
        <Resolved />
      </Suspense>
    </div>
  );
}

function Resolved() {
  const router = useRouter();
  const draftMemberId = router.query.draftMemberId as string;

  assert(draftMemberId != null);

  const [
    {
      name,
      phoneNumber,
      gender,
      marriageStatus,
      birthYear,
      residence,
      height,
      weight,
      confidentFacialBodyPart,
      educationLevel,
      graduatedUniversity,
      workplace,
      job,
      annualIncome,
      assetsValue,
      mbti,
      characteristics,
      hobby,
      exercisePerWeek,
      exerciseType,
      isSmoker,
      isDrinker,
      alcoholConsumption,
      alcoholTolerance,
      religion,
      hasCar,
      hasTattoo,
      hasPet,
      datingStyle,
      contactStyle,
      marriagePlan,
      selfIntroduction,
      idealMinAgeBirthYear,
      idealMaxAgeBirthYear,
      idealRegionsV2,
      idealMinHeight,
      idealMaxHeight,
      idealBodyShapes,
      idealFacialBodyPart,
      idealEducationLevel,
      idealSchoolLevel,
      idealNonPreferredWorkplace,
      idealNonPreferredJob,
      idealMinAnnualIncome,
      idealPreferredMbtis,
      idealNonPreferredMbtis,
      idealCharacteristics,
      idealIsSmokerOk,
      idealPreferredReligions,
      idealNonPreferredReligions,
      idealIsTattooOk,
      idealTypeDescription,
      images,
      videos,
      audios,
      referrerCode,
      memo,
    },
  ] = api.draftBasicMemberRouter.findOne.useSuspenseQuery({
    id: draftMemberId,
  });
  const [isPhoneNumberChecked, setIsPhoneNumberChecked] = useState(false);
  const { mutateAsync: checkPhoneNumber } =
    api.draftBasicMemberRouter.checkPhoneNumber.useMutation();
  const { mutateAsync: reject } =
    api.draftBasicMemberRouter.reject.useMutation();
  const { mutateAsync: createBasicMember } =
    api.draftBasicMemberRouter.createBasicMemberFromDraft.useMutation();
  const [region, setRegion] = useState<RegionV2>();
  const { data: referrer } = api.basicMemberRouter.getByReferralCode.useQuery(
    { referralCode: referrerCode! },
    { enabled: referrerCode != null },
  );

  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex w-full flex-row gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-row gap-1">
            <TextInput label="이름" value={name} disabled={true} />
            <div className="flex flex-row items-end gap-1">
              <TextInput label="전화번호" value={phoneNumber} disabled={true} />
              <button
                className="rounded bg-blue-500 px-4 py-1 text-white"
                onClick={async () => {
                  try {
                    await checkPhoneNumber({ phoneNumber });
                    alert("전화번호 중복 확인 완료");
                    setIsPhoneNumberChecked(true);
                  } catch (err: any) {
                    alert(err.message);
                  }
                }}
              >
                중복 확인
              </button>
            </div>
          </div>
          <div className="flex flex-row gap-1">
            <TextInput label="성별" value={gender} disabled={true} />
            <TextInput
              label="미혼 확인"
              value={marriageStatus}
              disabled={true}
            />
          </div>
          <TextInput label="출생연도" value={birthYear} disabled={true} />
          <div className="flex gap-1">
            <TextInput label="거주지" value={residence} disabled={true} />
            <Select
              label="지역"
              defaultValue={region}
              onChange={({ target: { value } }) => {
                setRegion(value as RegionV2);
              }}
            >
              {[
                undefined,
                RegionV2.SEOUL,
                RegionV2.SOUTH_GYEONGGI,
                RegionV2.NORTH_GYEONGGI,
                RegionV2.INCHEON_BUCHEON,
                RegionV2.CHUNGCHEONG,
              ].map((region) => {
                return (
                  <option key={String(region)} value={region}>
                    {region == null ? undefined : 지역_라벨[region]}
                  </option>
                );
              })}
            </Select>
          </div>
          <div className="flex flex-row gap-1">
            <TextInput label="키" value={height} disabled={true} />
            <TextInput label="몸무게" value={weight} disabled={true} />
            <TextInput
              label="bmi"
              value={`${calculateBmi(height, weight).toFixed(2)} (${getBmiLabel(
                calculateBmi(height, weight),
              )})`}
              disabled={true}
            />
          </div>
          <TextInput
            label="자신 있는 얼굴/신체 부위"
            value={confidentFacialBodyPart ?? "null"}
            disabled={true}
          />
          <div className="flex flex-row gap-1">
            <TextInput
              label="학력"
              value={학력_라벨[educationLevel]}
              disabled={true}
            />
            <TextInput
              label="졸업 학교"
              value={graduatedUniversity ?? "null"}
              disabled={true}
            />
          </div>
          <div className="flex flex-row gap-1">
            <TextInput
              label="직장"
              value={workplace ?? "null"}
              disabled={true}
            />
            <TextInput label="직무" value={job ?? "null"} disabled={true} />
          </div>
          <div className="flex flex-row gap-1">
            <TextInput
              label="연간 수입"
              value={
                annualIncome == null ? "null" : 연간_벌이_라벨[annualIncome]
              }
              disabled={true}
            />
            <TextInput
              label="자산"
              value={assetsValue == null ? "null" : 자산_라벨[assetsValue]}
              disabled={true}
            />
          </div>
          <div className="flex flex-row gap-1">
            <TextInput label="MBTI" value={mbti ?? "null"} disabled={true} />
            <TextInput
              label="특징"
              value={characteristics ?? "null"}
              disabled={true}
            />
          </div>
          <TextInput label="취미/관심사" value={hobby} disabled={true} />
          <div className="flex flex-row gap-1">
            <TextInput
              label="운동량"
              value={주간_운동량_라벨[exercisePerWeek]}
              disabled={true}
            />
            <TextInput
              label="운동 종류"
              value={exerciseType ?? "null"}
              disabled={true}
            />
          </div>
          <div className="flex flex-row gap-1">
            <TextInput label="흡연" value={String(isSmoker)} disabled={true} />
            <TextInput label="문신" value={String(hasTattoo)} disabled={true} />
          </div>
          <div className="flex flex-row gap-1">
            <TextInput label="음주" value={String(isDrinker)} disabled={true} />
            <TextInput
              label="음주량"
              value={alcoholConsumption ?? "null"}
              disabled={true}
            />
            <TextInput
              label="주량"
              value={alcoholTolerance ?? "null"}
              disabled={true}
            />
          </div>
          <TextInput label="종교" value={종교_라벨[religion]} disabled={true} />
          <TextInput label="자차" value={String(hasCar)} disabled={true} />
          <TextInput label="반려동물" value={String(hasPet)} disabled={true} />
          <TextInput
            label="데이트 스타일"
            value={datingStyle}
            disabled={true}
          />
          <TextInput
            label="연락"
            value={contactStyle ?? "null"}
            disabled={true}
          />
          <TextInput
            label="결혼관"
            value={marriagePlan ?? "null"}
            disabled={true}
          />
          <TextareaInput
            label="자기소개"
            value={selfIntroduction}
            disabled={true}
            rows={4}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-row gap-1">
            <TextInput
              label="최소 나이 출생연도"
              value={idealMinAgeBirthYear ?? "null"}
              disabled={true}
            />
            <TextInput
              label="최대 나이 출생연도"
              value={idealMaxAgeBirthYear ?? "null"}
              disabled={true}
            />
          </div>
          <TextInput
            label="선호 지역"
            value={idealRegionsV2
              .map((region) => {
                return 지역_라벨[region];
              })
              .join(", ")}
            disabled={true}
          />
          <div className="flex flex-row gap-1">
            <TextInput
              label="최소 키"
              value={idealMinHeight ?? "null"}
              disabled={true}
            />
            <TextInput
              label="최대 키"
              value={idealMaxHeight ?? "null"}
              disabled={true}
            />
          </div>
          <TextInput
            label="선호 체형"
            value={idealBodyShapes
              .map((bodyShape) => {
                return 체형_라벨[bodyShape];
              })
              .join(", ")}
            disabled={true}
          />
          <TextInput
            label="선호 얼굴/신체 특징"
            value={idealFacialBodyPart ?? "null"}
            disabled={true}
          />
          <TextInput
            label="최소 학력"
            value={
              idealEducationLevel == null
                ? "null"
                : 최소_학력_라벨[idealEducationLevel]
            }
            disabled={true}
          />
          <TextInput
            label="선호 학벌"
            value={idealSchoolLevel ?? "null"}
            disabled={true}
          />
          <TextInput
            label="기피 직장/학교"
            value={idealNonPreferredWorkplace ?? "null"}
            disabled={true}
          />
          <TextInput
            label="기피 직무"
            value={idealNonPreferredJob ?? "null"}
            disabled={true}
          />
          <TextInput
            label="최소 연간 수입"
            value={
              idealMinAnnualIncome == null
                ? "null"
                : 최소_연간_벌이_라벨[idealMinAnnualIncome]
            }
            disabled={true}
          />
          <TextInput
            label="선호 MBTI"
            value={idealPreferredMbtis.join(", ")}
            disabled={true}
          />
          <TextInput
            label="기피 MBTI"
            value={idealNonPreferredMbtis.join(", ")}
            disabled={true}
          />
          <TextInput
            label="선호 특징"
            value={idealCharacteristics ?? "null"}
            disabled={true}
          />
          <TextInput
            label="흡연 허용"
            value={String(idealIsSmokerOk)}
            disabled={true}
          />
          <TextInput
            label="선호 종교"
            value={idealPreferredReligions
              .map((religion) => {
                return 종교_라벨[religion];
              })
              .join(", ")}
            disabled={true}
          />
          <TextInput
            label="기피 종교"
            value={idealNonPreferredReligions
              .map((religion) => {
                return 종교_라벨[religion];
              })
              .join(", ")}
            disabled={true}
          />
          <TextInput
            label="문신 허용"
            value={String(idealIsTattooOk)}
            disabled={true}
          />
          <TextareaInput
            label="이성상"
            value={idealTypeDescription}
            disabled={true}
            rows={3}
          />
        </div>
      </div>
      <TextInput
        label="추천인"
        value={referrer != null ? formatUniqueMemberName(referrer) : "null"}
        disabled={true}
      />
      <TextareaInput
        label="메모"
        value={memo ?? "null"}
        disabled={true}
        rows={2}
      />
      <div className="flex flex-row gap-1">
        {images.map((image) => {
          return (
            <ImageField key={image.bucketPath} bucketPath={image.bucketPath} />
          );
        })}
      </div>
      <div className="flex flex-row gap-1">
        {videos.map((video) => {
          return (
            <VideoField key={video.bucketPath} bucketPath={video.bucketPath} />
          );
        })}
      </div>
      <div className="flex flex-row gap-1">
        {audios.map((video) => {
          return (
            <AudioField key={video.bucketPath} bucketPath={video.bucketPath} />
          );
        })}
      </div>
      <div className="flex w-full flex-row gap-2">
        <button
          className="flex-1 rounded bg-gray-300"
          onClick={async () => {
            await reject({ draftMemberId });
            router.push("/basic/draft-members");
          }}
        >
          반려
        </button>
        <button
          className="flex-1 rounded bg-blue-500 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          onClick={async () => {
            if (!isPhoneNumberChecked) {
              alert("전화번호 중복 확인을 진행하세요.");

              return;
            }

            if (region == null) {
              alert("지역 누락");

              return;
            }

            const newMember = await createBasicMember({
              draftMemberId,
              region,
            });

            router.push(`/basic/members/${newMember.id}/update`);
          }}
          disabled={!isPhoneNumberChecked}
        >
          생성
        </button>
      </div>
    </div>
  );
}

function ImageField({ bucketPath }: { bucketPath: string }) {
  const {
    data: { publicUrl },
  } = supabase.storage
    .from(process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_IMAGES_BUCKET_NAME!)
    .getPublicUrl(bucketPath);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={publicUrl} alt="사진" width={400} className="object-contain" />
  );
}

function VideoField({ bucketPath }: { bucketPath: string }) {
  const {
    data: { publicUrl },
  } = supabase.storage
    .from(process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_VIDEOS_BUCKET_NAME!)
    .getPublicUrl(bucketPath);

  // eslint-disable-next-line jsx-a11y/media-has-caption
  return <video src={publicUrl} controls width={400} />;
}

function AudioField({ bucketPath }: { bucketPath: string }) {
  const {
    data: { publicUrl },
  } = supabase.storage
    .from(process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_AUDIOS_BUCKET_NAME!)
    .getPublicUrl(bucketPath);

  // eslint-disable-next-line jsx-a11y/media-has-caption
  return <audio src={publicUrl} controls />;
}

DraftMemberPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
