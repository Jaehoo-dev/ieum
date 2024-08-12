import { ComponentPropsWithoutRef, useEffect, useRef, useState } from "react";
import type { MemberImageV2, MemberVideoV2 } from "@ieum/prisma";
import { supabase } from "@ieum/supabase";
import { assert } from "@ieum/utils";

import { AccordionSection } from "./components/AccordionSection";
import { Watermarks } from "./components/Watermarks";
import { BasicMemberProfileWithMediaSources } from "./types";

interface Props extends ComponentPropsWithoutRef<"div"> {
  profile: BasicMemberProfileWithMediaSources;
  nameWatermark: string;
  numberWatermark: string;
  defaultOpened?: boolean;
}

export function Profile({
  profile,
  nameWatermark,
  numberWatermark,
  defaultOpened = false,
  ...props
}: Props) {
  const {
    selfIntroduction,
    idealTypeDescription,
    member: { images, videos },
  } = profile;

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

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
        nameWatermark={nameWatermark}
        numberWatermark={numberWatermark}
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
  nameWatermark,
  numberWatermark,
  defaultOpened = false,
}: {
  videos: MemberVideoV2[];
  images: MemberImageV2[];
  nameWatermark: string;
  numberWatermark: string;
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
              nameWatermark={nameWatermark}
              numberWatermark={numberWatermark}
            />
          );
        })}
        {images.map(({ id, bucketPath, customWidth }) => {
          return (
            <ProtectedImageField
              key={id}
              bucketPath={bucketPath}
              nameWatermark={nameWatermark}
              numberWatermark={numberWatermark}
              customWidth={customWidth ?? undefined}
            />
          );
        })}
      </div>
    </AccordionSection>
  );
}

interface ProtectedImageFieldProps {
  bucketPath: string;
  nameWatermark: string;
  numberWatermark: string;
  customWidth?: number;
}

function ProtectedImageField({
  bucketPath,
  nameWatermark,
  numberWatermark,
  customWidth,
}: ProtectedImageFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const {
    data: { publicUrl },
  } = supabase.storage
    .from(process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_IMAGES_BUCKET_NAME!)
    .getPublicUrl(bucketPath);

  useEffect(() => {
    const img = new Image();
    const canvas = canvasRef.current;

    img.onload = () => {
      assert(canvas != null);

      const parentWidth =
        canvas.parentElement?.clientWidth ?? window.innerWidth;
      const aspectRatio = img.height / img.width;
      const newWidth = Math.min(parentWidth, customWidth ?? parentWidth);
      const newHeight = newWidth * aspectRatio;

      setDimensions({
        width: newWidth,
        height: newHeight,
      });
    };

    img.src = publicUrl;
  }, [publicUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;

    assert(canvas != null);

    if (dimensions.width > 0 && dimensions.height > 0) {
      resizeCanvas(canvas, dimensions);

      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        if (ctx == null) {
          return;
        }

        ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
        ctx.save();
        drawWatermarks(ctx, nameWatermark, numberWatermark);
        ctx.restore();
      };

      img.src = publicUrl;
    }
  }, [publicUrl, dimensions]);

  return <canvas ref={canvasRef} className="m-auto select-none rounded-lg" />;
}

function VideoField({
  bucketPath,
  nameWatermark,
  numberWatermark,
}: {
  bucketPath: string;
  nameWatermark: string;
  numberWatermark: string;
}) {
  const {
    data: { publicUrl },
  } = supabase.storage
    .from(process.env.NEXT_PUBLIC_SUPABASE_BASIC_MEMBER_VIDEOS_BUCKET_NAME!)
    .getPublicUrl(bucketPath);

  return (
    <div className="relative max-w-xl">
      <Watermarks watermark1={nameWatermark} watermark2={numberWatermark} />
      <video
        className="m-auto rounded-lg"
        src={publicUrl}
        controls
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
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

function resizeCanvas(
  canvas: HTMLCanvasElement,
  {
    width,
    height,
  }: {
    width: number;
    height: number;
  },
) {
  const dpr = window.devicePixelRatio;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d");

  ctx?.scale(dpr, dpr);
}

function drawWatermarks(
  ctx: CanvasRenderingContext2D,
  nameWatermark: string,
  numberWatermark: string,
) {
  ctx.font = "14px 'Nanum Gothic', sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
  ctx.translate(0, 0);
  ctx.rotate(-Math.PI / 4);
  const nameTextWidth = ctx.measureText(nameWatermark).width;
  const numberTextWidth = ctx.measureText(numberWatermark).width;
  const textHeight = 14;
  const startX = -20;
  const startY = 80;

  for (let row = 0; row < 10; row++) {
    const _watermark = row % 2 === 0 ? nameWatermark : numberWatermark;
    const _textWidth = row % 2 === 0 ? nameTextWidth : numberTextWidth;

    for (let col = 0; col < 6; col++) {
      ctx.fillText(
        `${_watermark}`,
        startX - row * 134 + col * (_textWidth + 120),
        startY + row * (textHeight + 120),
      );
    }
  }
}
