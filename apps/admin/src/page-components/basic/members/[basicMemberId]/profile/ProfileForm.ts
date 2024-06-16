import type { BasicMember, MemberImage } from "@ieum/prisma";

export interface ProfileForm {
  memberId: BasicMember["id"];
  profile: {
    birthYear: number;
    residence: string;
    height: number;
    education: string;
    job: string;
    annualIncome: string | null;
    assetsValue: string | null;
    mbti: string | null;
    hobby: string | null;
    characteristic: string | null;
    lifePhilosophy: string | null;
    datingStyle: string | null;
    isSmoker: string;
    religion: string;
    selfIntroduction: string | null;
    idealTypeDescription: string | null;
    memberImages: Array<{ value: MemberImage }>;
  };
}
