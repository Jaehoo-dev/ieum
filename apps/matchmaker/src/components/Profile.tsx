import Image from "next/image";
import type { BasicMemberProfile } from "@ieum/prisma";
import { supabase } from "@ieum/supabase";

import { Watermarks } from "./Watermarks";

interface Props {
  profile: BasicMemberProfile;
  watermarkText?: string;
}

export function Profile({ profile, watermarkText }: Props) {
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
          스크린 캡처 및 무단 유출을 절대 금지합니다. 무단 유출 시 로그와
          워터마크로 추적이 가능하며 법적 책임을 질 수 있습니다.
        </p>
      </div>
      <div className="flex w-full flex-col gap-1 rounded-lg border-2 border-primary-500 p-4">
        <p className="text-xl font-semibold text-gray-900">인적사항</p>
        <DataField label="나이" value={`${birthYear}년생`} />
        <DataField label="사는 곳" value={`${residence}`} />
        <DataField label="키" value={`${height}cm`} />
        <DataField label="학력" value={education} />
        <DataField label="직업" value={job} />
        {annualIncome != null ? (
          <DataField label="연간 소득 구간" value={annualIncome} />
        ) : null}
        {assetsValue != null ? (
          <DataField label="자산 구간" value={assetsValue} />
        ) : null}
        {mbti != null ? <DataField label="MBTI" value={mbti} /> : null}
        {hobby != null ? <DataField label="취미" value={hobby} /> : null}
        {characteristic != null ? (
          <DataField label="특징" value={characteristic} />
        ) : null}
        {lifePhilosophy != null ? (
          <DataField label="인생관" value={lifePhilosophy} />
        ) : null}
        {datingStyle != null ? (
          <DataField label="데이트 스타일" value={datingStyle} />
        ) : null}
        <DataField label="흡연 여부" value={isSmoker} />
        {religion != null ? <DataField label="종교" value={religion} /> : null}
      </div>
      {selfIntroduction != null ? (
        <div className="flex w-full flex-col gap-2 rounded-lg border-2 border-primary-500 p-4">
          <p className="text-xl font-semibold text-gray-900">자기소개</p>
          <p className="whitespace-pre-wrap break-words text-lg text-gray-900">
            {selfIntroduction}
          </p>
        </div>
      ) : null}
      {idealTypeDescription != null ? (
        <div className="flex w-full flex-col gap-2 rounded-lg border-2 border-primary-500 p-4">
          <p className="text-xl font-semibold text-gray-900">
            만나고 싶은 이성상
          </p>
          <p className="whitespace-pre-wrap break-words text-lg text-gray-900">
            {idealTypeDescription}
          </p>
        </div>
      ) : null}
      <ImageField bucketPath={image1BucketPath} watermarkText={watermarkText} />
      {image2BucketPath != null ? (
        <ImageField
          bucketPath={image2BucketPath}
          watermarkText={watermarkText}
        />
      ) : null}
      {image3BucketPath != null ? (
        <ImageField
          bucketPath={image3BucketPath}
          watermarkText={watermarkText}
        />
      ) : null}
    </div>
  );
}

function ImageField({
  bucketPath,
  watermarkText,
}: {
  bucketPath: string;
  watermarkText?: string;
}) {
  const {
    data: { publicUrl },
  } = supabase.storage
    .from(process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_IMAGES_BUCKET_NAME!)
    .getPublicUrl(bucketPath, {
      transform: {
        width: 600,
        resize: "contain",
      },
    });

  return (
    <div className="relative max-w-xl">
      {watermarkText != null ? <Watermarks text={watermarkText} /> : null}
      <Image
        src={publicUrl}
        alt="프로필 이미지"
        width={480}
        height={600}
        className="rounded-lg"
      />
    </div>
  );
}

function DataField({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex gap-1">
      <p className="text-lg text-gray-900">•</p>
      <p className="text-lg text-gray-900">{`${label}: ${value}`}</p>
    </span>
  );
}
