import type {
  BasicMatchV2,
  BasicMemberIdealTypeV2,
  BasicMemberProfileV2,
  BasicMemberV2,
  MemberImageV2,
} from "@ieum/prisma";

export type BasicMemberWithJoined = BasicMemberV2 & {
  idealType: BasicMemberIdealTypeV2 | null;
  pendingMatches: BasicMatchV2[];
  rejectedMatches: BasicMatchV2[];
  acceptedMatches: BasicMatchV2[];
  profile: BasicMemberProfileV2 | null;
  images: MemberImageV2[];
};

export type BasicMatchWithMembers = BasicMatchV2 & {
  pendingByV2: BasicMemberWithJoined[];
  rejectedByV2: BasicMemberWithJoined[];
  acceptedByV2: BasicMemberWithJoined[];
};
