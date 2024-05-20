import type { BasicMember } from "@ieum/prisma";

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
    isSmoker: boolean;
    religion: string;
    selfIntroduction: string | null;
    idealTypeDescription: string | null;
    image1BucketPath: string | null;
    image2BucketPath: string | null;
    image3BucketPath: string | null;
  };
}
