import { BasicMemberProfile, MemberImage, MemberVideo } from "@ieum/prisma";

export type BasicMemberProfileWithMediaSources = BasicMemberProfile & {
  member: {
    images: MemberImage[];
    videos: MemberVideo[];
  };
};
