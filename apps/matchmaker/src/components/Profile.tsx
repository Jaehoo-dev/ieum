import Image from "next/image";
import { 종교_라벨 } from "@ieum/labels";
import type { BasicMemberProfile } from "@ieum/prisma";
import { supabase } from "@ieum/supabase";

interface Props {
  profile: BasicMemberProfile;
}

export function Profile({ profile }: Props) {
  const {
    birthYear,
    residence,
    height,
    education,
    job,
    annualIncome,
    assetsValue,
    mbti,
    hobby,
    characteristic,
    lifePhilosophy,
    datingStyle,
    isSmoker,
    religion,
    selfIntroduction,
    idealTypeDescription,
    image1BucketPath,
    image2BucketPath,
    image3BucketPath,
  } = profile;

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex w-full items-start gap-1">
        <p className="text-md text-gray-800">※</p>
        <p className="text-md text-gray-800">
          스크린 캡처 및 무단 유출을 절대 금지합니다. 무단 유출 시 법적 책임을
          질 수 있습니다.
        </p>
      </div>
      <div className="flex w-full flex-col gap-2 rounded-lg border-2 border-primary-500 p-3">
        <p className="text-xl font-semibold text-gray-900">인적사항</p>
        <DataField label="나이" value={`${birthYear}년생`} />
        <DataField label="사는 곳" value={`${residence}`} />
        <DataField label="키" value={`${height}cm`} />
        <DataField label="학력" value={`${education}`} />
        <DataField label="직업" value={`${job}`} />
        {annualIncome != null ? (
          <DataField label="연간 소득 구간" value={annualIncome} />
        ) : null}
        {assetsValue != null ? (
          <DataField label="자산 구간" value={assetsValue} />
        ) : null}
        {mbti != null ? <DataField label="MBTI" value={mbti} /> : null}
        {hobby != null ? <DataField label="취미" value={hobby} /> : null}
        {characteristic != null ? (
          <DataField label="성격" value={characteristic} />
        ) : null}
        {lifePhilosophy != null ? (
          <DataField label="인생관" value={lifePhilosophy} />
        ) : null}
        {datingStyle != null ? (
          <DataField label="데이트 스타일" value={datingStyle} />
        ) : null}
        {isSmoker != null ? (
          <DataField label="흡연 여부" value={isSmoker ? "예" : "아니요"} />
        ) : null}
        {religion != null ? (
          <DataField label="종교" value={종교_라벨[religion]} />
        ) : null}
      </div>
      {selfIntroduction != null ? (
        <div className="flex w-full flex-col gap-2 rounded-lg border-2 border-primary-500 p-3">
          <p className="text-xl font-semibold text-gray-900">자기소개</p>
          <p className="text-xl text-gray-900">{profile.selfIntroduction}</p>
        </div>
      ) : null}
      {idealTypeDescription != null ? (
        <div className="flex w-full flex-col gap-2 rounded-lg border-2 border-primary-500 p-3">
          <p className="text-xl font-semibold text-gray-900">
            만나고 싶은 이성상
          </p>
          <p className="text-xl text-gray-900">
            {profile.idealTypeDescription}
          </p>
        </div>
      ) : null}
      <div>
        <ImageField bucketPath={image1BucketPath} />
      </div>
      {image2BucketPath != null ? (
        <ImageField bucketPath={image2BucketPath} />
      ) : null}
      {image3BucketPath != null ? (
        <ImageField bucketPath={image3BucketPath} />
      ) : null}
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
    <Image
      src={publicUrl}
      alt="프로필 이미지"
      width={576}
      height={600}
      className="rounded-lg"
    />
  );
}

function DataField({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex gap-1">
      <p className="text-xl text-gray-900">•</p>
      <p className="text-xl text-gray-900">{`${label}: ${value}`}</p>
    </span>
  );
}
