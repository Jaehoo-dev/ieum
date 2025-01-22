import type { ComponentPropsWithoutRef } from "react";
import { useEffect } from "react";
import { 성별_라벨, 지역_라벨 } from "@ieum/constants";

import { AccordionSection } from "./components/AccordionSection";
import { DataField } from "./components/DataField";
import type { BlindMemberProfile } from "./types";

interface Props extends ComponentPropsWithoutRef<"div"> {
  profile: BlindMemberProfile;
}

export function BlindProfile({ profile, ...props }: Props) {
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
      <Summary profile={profile} />
      <SelfIntroductionSection content={profile.selfIntroduction} />
      <PersonalInformationSection profile={profile} />
    </div>
  );
}

function Summary({ profile }: { profile: BlindMemberProfile }) {
  const { gender, birthYear, nickname } = profile;

  return (
    <div className="flex w-full flex-col gap-0.5">
      <div className="flex items-center gap-0.5 text-sm text-gray-500">
        <span>{성별_라벨[gender]}</span>
        <span>&#8729;</span>
        <span>{birthYear}년생</span>
      </div>
      <span className="text-xl font-semibold text-gray-800">{nickname}</span>
    </div>
  );
}

function PersonalInformationSection({
  profile,
}: {
  profile: BlindMemberProfile;
}) {
  const {
    birthYear,
    region,
    height,
    bodyShape,
    job,
    ageVerified,
    jobVerified,
  } = profile;

  return (
    <AccordionSection theme="BLIND" title="인적사항" defaultOpened={true}>
      <div className="flex flex-col gap-0.5">
        <DataField
          theme="BLIND"
          label="나이"
          value={`${birthYear}년생`}
          verified={ageVerified}
        />
        <DataField theme="BLIND" label="사는 곳" value={지역_라벨[region]} />
        <DataField theme="BLIND" label="키" value={`${height}cm`} />
        <DataField theme="BLIND" label="체형" value={bodyShape} />
        <DataField
          theme="BLIND"
          label="직업"
          value={job}
          verified={jobVerified}
        />
      </div>
    </AccordionSection>
  );
}

function SelfIntroductionSection({ content }: { content: string }) {
  return (
    <AccordionSection theme="BLIND" title="자기소개" defaultOpened={true}>
      <p className="whitespace-pre-wrap break-words text-lg text-gray-900">
        {content}
      </p>
    </AccordionSection>
  );
}
