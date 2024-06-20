import Image from "next/image";
import type { BasicMemberProfile, MemberImage } from "@ieum/prisma";
import { supabase } from "@ieum/supabase";

import { BasicMemberProfileWithImages } from "~/types";
import { Watermarks } from "../Watermarks";
import { AccordionSection } from "./AccordionSection";

interface Props {
  profile: BasicMemberProfileWithImages;
  watermarkText?: string;
}

export function Profile({ profile, watermarkText }: Props) {
  const {
    selfIntroduction,
    idealTypeDescription,
    member: { images },
  } = profile;

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <Warning />
      {selfIntroduction != null ? (
        <SelfIntroductionSection content={selfIntroduction} />
      ) : null}
      <PersonalInformationSection
        profile={profile}
        initiallyOpened={selfIntroduction == null}
      />
      {idealTypeDescription != null ? (
        <IdealTypeDescriptionSection content={idealTypeDescription} />
      ) : null}
      <ImageSection images={images} watermarkText={watermarkText} />
    </div>
  );
}

function PersonalInformationSection({
  initiallyOpened,
  profile,
}: {
  initiallyOpened: boolean;
  profile: BasicMemberProfileWithImages;
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
      initiallyOpened={initiallyOpened}
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
    <AccordionSection title="안녕하세요" initiallyOpened={true}>
      <p className="whitespace-pre-wrap break-words text-lg text-gray-900">
        {content}
      </p>
    </AccordionSection>
  );
}

function IdealTypeDescriptionSection({ content }: { content: string }) {
  return (
    <AccordionSection title="이런 분을 만나고 싶어요">
      <p className="whitespace-pre-wrap break-words text-lg text-gray-900">
        {content}
      </p>
    </AccordionSection>
  );
}

function ImageSection({
  images,
  watermarkText,
}: {
  images: MemberImage[];
  watermarkText?: string;
}) {
  return (
    <AccordionSection title="제 모습은요">
      <div className="flex flex-col gap-4">
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
    .getPublicUrl(bucketPath, {
      transform: {
        width: _width,
        resize: "contain",
      },
    });

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

function DataField({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex gap-1">
      <p className="text-lg text-gray-900">•</p>
      <p className="text-lg text-gray-900">{`${label}: ${value}`}</p>
    </span>
  );
}

function Warning() {
  return (
    <div className="flex w-full items-start gap-1">
      <p className="text-md text-gray-800">※</p>
      <p className="text-md text-gray-800">
        스크린 캡처 및 무단 유출을 절대 금지합니다. 무단 유출 시 로그와
        워터마크로 추적이 가능하며 법적 책임을 질 수 있습니다.
      </p>
    </div>
  );
}
