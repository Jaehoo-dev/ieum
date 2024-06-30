import type {
  BasicMatch,
  BasicMember,
  BasicMemberIdealType,
  BasicMemberProfile,
  MemberImage,
} from "@ieum/prisma";

export type BasicMemberWithJoined = BasicMember & {
  idealType: BasicMemberIdealType | null;
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
