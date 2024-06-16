import { BasicMemberProfile, MemberImage } from "@ieum/prisma";

export type BasicMemberProfileWithImages = BasicMemberProfile & {
  member: {
    images: MemberImage[];
  };
};
