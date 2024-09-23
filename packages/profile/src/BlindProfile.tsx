import { ComponentPropsWithoutRef, useEffect } from "react";

import { AccordionSection } from "./components/AccordionSection";
import { DataField } from "./components/DataField";
import { BlindMemberProfile } from "./types";

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
      <PersonalInformationSection profile={profile} />
      <SelfIntroductionSection content={profile.selfIntroduction} />
    </div>
  );
}

function PersonalInformationSection({
  profile,
}: {
  profile: BlindMemberProfile;
}) {
  const { birthYear, residence, height, bodyShape, job } = profile;

  return (
    <AccordionSection type="BLIND" title="인적사항" defaultOpened={true}>
      <div className="flex flex-col gap-0.5">
        <DataField label="나이" value={`${birthYear}년생`} />
        <DataField label="사는 곳" value={`${residence}`} />
        <DataField label="키" value={`${height}cm`} />
        <DataField label="체형" value={bodyShape} />
        <DataField label="직업" value={job} />
      </div>
    </AccordionSection>
  );
}

function SelfIntroductionSection({ content }: { content: string }) {
  return (
    <AccordionSection type="BLIND" title="자기소개" defaultOpened={true}>
      <p className="whitespace-pre-wrap break-words text-lg text-gray-900">
        {content}
      </p>
    </AccordionSection>
  );
}
