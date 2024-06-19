import type {
  BasicMatch,
  BasicMember,
  BasicMemberProfile,
  MemberImage,
} from "@ieum/prisma";

export type BasicMemberWithJoined = BasicMember & {
  pendingMatches: BasicMatch[];
  rejectedMatches: BasicMatch[];
  acceptedMatches: BasicMatch[];
  profile: BasicMemberProfile | null;
  images: MemberImage[];
};

export type BasicMatchWithMembers = BasicMatch & {
  pendingBy: BasicMemberWithJoined[];
  rejectedBy: BasicMemberWithJoined[];
  acceptedBy: BasicMemberWithJoined[];
};
