import {
  BasicMemberProfileV2,
  BlindMember,
  MemberAudio,
  MemberImageV2,
  MemberVideoV2,
} from "@ieum/prisma";

export type BasicMemberProfileWithMediaSources = BasicMemberProfileV2 & {
  member: {
    images: MemberImageV2[];
    videos: MemberVideoV2[];
    audios: MemberAudio[];
  };
};

export type BlindMemberProfile = Pick<
  BlindMember,
  | "birthYear"
  | "residence"
  | "height"
  | "bodyShape"
  | "job"
  | "selfIntroduction"
>;
