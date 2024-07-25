import {
  BasicMemberProfileV2,
  MemberImageV2,
  MemberVideoV2,
} from "@ieum/prisma";

export type BasicMemberProfileWithMediaSources = BasicMemberProfileV2 & {
  member: {
    images: MemberImageV2[];
    videos: MemberVideoV2[];
  };
};
