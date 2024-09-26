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
      <SelfIntroductionSection content={profile.selfIntroduction} />
      <PersonalInformationSection profile={profile} />
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
    residence,
    height,
    bodyShape,
    job,
    idVerified,
    jobVerified,
  } = profile;

  return (
    <AccordionSection theme="BLIND" title="인적사항" defaultOpened={true}>
      <div className="flex flex-col gap-0.5">
        <DataField
          theme="BLIND"
          label="나이"
          value={`${birthYear}년생`}
          verified={idVerified}
        />
        <DataField theme="BLIND" label="사는 곳" value={`${residence}`} />
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
