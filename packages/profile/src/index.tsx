import { ComponentPropsWithoutRef } from "react";
import type { MemberImageV2, MemberVideoV2 } from "@ieum/prisma";
import { supabase } from "@ieum/supabase";

import { AccordionSection } from "./components/AccordionSection";
import { Watermarks } from "./components/Watermarks";
import { BasicMemberProfileWithMediaSources } from "./types";

interface Props extends ComponentPropsWithoutRef<"div"> {
  profile: BasicMemberProfileWithMediaSources;
  watermarkText?: string;
  defaultOpened?: boolean;
}

export function Profile({
  profile,
  watermarkText,
  defaultOpened = false,
  ...props
}: Props) {
  const {
    selfIntroduction,
    idealTypeDescription,
    member: { images, videos },
  } = profile;

  return (
    <div className="flex w-full flex-col items-center gap-4" {...props}>
      {selfIntroduction != null ? (
        <SelfIntroductionSection content={selfIntroduction} />
      ) : null}
      <PersonalInformationSection
        profile={profile}
        defaultOpened={selfIntroduction == null || defaultOpened}
      />
      {idealTypeDescription != null ? (
        <IdealTypeDescriptionSection
          content={idealTypeDescription}
          defaultOpened={defaultOpened}
        />
      ) : null}
      <MediaSection
        videos={videos}
        images={images}
        watermarkText={watermarkText}
        defaultOpened={defaultOpened}
      />
    </div>
  );
}

function PersonalInformationSection({
  defaultOpened,
  profile,
}: {
  defaultOpened: boolean;
  profile: BasicMemberProfileWithMediaSources;
}) {
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
  } = profile;

  return (
    <AccordionSection
      title="저는 이런 사람이에요"
      defaultOpened={defaultOpened}
    >
      <div className="flex flex-col gap-0.5">
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
    </AccordionSection>
  );
}

function SelfIntroductionSection({ content }: { content: string }) {
  return (
    <AccordionSection title="안녕하세요" defaultOpened={true}>
      <p className="whitespace-pre-wrap break-words text-lg text-gray-900">
        {content}
      </p>
    </AccordionSection>
  );
}

function IdealTypeDescriptionSection({
  content,
  defaultOpened = false,
}: {
  content: string;
  defaultOpened?: boolean;
}) {
  return (
    <AccordionSection
      title="이런 분을 만나고 싶어요"
      defaultOpened={defaultOpened}
    >
      <p className="whitespace-pre-wrap break-words text-lg text-gray-900">
        {content}
      </p>
    </AccordionSection>
  );
}

function MediaSection({
  videos,
  images,
  watermarkText,
  defaultOpened = false,
}: {
  videos: MemberVideoV2[];
  images: MemberImageV2[];
  watermarkText?: string;
  defaultOpened?: boolean;
}) {
  return (
    <AccordionSection title="제 모습은요" defaultOpened={defaultOpened}>
      <div className="flex flex-col gap-4">
        {videos.map(({ id, bucketPath }) => {
          return (
            <VideoField
              key={id}
              bucketPath={bucketPath}
              watermarkText={watermarkText}
            />
          );
        })}
        {images.map(({ id, bucketPath, customWidth }) => {
          return (
            <ImageField
              key={id}
              bucketPath={bucketPath}
              width={customWidth ?? undefined}
              watermarkText={watermarkText}
            />
          );
        })}
      </div>
    </AccordionSection>
  );
}

function ImageField({
  bucketPath,
  watermarkText,
  width,
}: {
  bucketPath: string;
  width?: number;
  watermarkText?: string;
}) {
  const _width = width ?? 440;

  const {
    data: { publicUrl },
  } = supabase.storage
    .from(process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_IMAGES_BUCKET_NAME!)
    .getPublicUrl(bucketPath);

  return (
    <div className="relative max-w-xl">
      {watermarkText != null ? <Watermarks text={watermarkText} /> : null}
      <img
        src={publicUrl}
        alt="프로필 이미지"
        width={_width}
        className="m-auto rounded-lg"
      />
    </div>
  );
}

function VideoField({
  bucketPath,
  watermarkText,
}: {
  bucketPath: string;
  watermarkText?: string;
}) {
  const {
    data: { publicUrl },
  } = supabase.storage
    .from(process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_VIDEOS_BUCKET_NAME!)
    .getPublicUrl(bucketPath);

  return (
    <div className="relative max-w-xl">
      {watermarkText != null ? <Watermarks text={watermarkText} /> : null}
      <video
        className="m-auto rounded-lg"
        src={publicUrl}
        controls
        muted
        loop
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
