import type {
  BasicMatchV2,
  BasicMemberIdealTypeV2,
  BasicMemberProfileV2,
  BasicMemberV2,
  MegaphoneMatch,
  MemberImageV2,
} from "@ieum/prisma";

export type BasicMemberWithBasicMatchesJoined = BasicMemberV2 & {
  idealType: BasicMemberIdealTypeV2 | null;
  pendingMatches: BasicMatchV2[];
  rejectedMatches: BasicMatchV2[];
  acceptedMatches: BasicMatchV2[];
  profile: BasicMemberProfileV2 | null;
  images: MemberImageV2[];
};

export type BasicMatchWithMembers = BasicMatchV2 & {
  pendingByV2: BasicMemberWithBasicMatchesJoined[];
  rejectedByV2: BasicMemberWithBasicMatchesJoined[];
  acceptedByV2: BasicMemberWithBasicMatchesJoined[];
};

export type BasicMemberWithMegaphoneMatchesJoined = BasicMemberV2 & {
  idealType: BasicMemberIdealTypeV2 | null;
  megaphoneMatchesAsSender: MegaphoneMatch[];
  megaphoneMatchesAsReceiver: MegaphoneMatch[];
  profile: BasicMemberProfileV2 | null;
  images: MemberImageV2[];
};

export type MegaphoneMatchWithMembers = MegaphoneMatch & {
  sender: BasicMemberWithMegaphoneMatchesJoined;
  receiver: BasicMemberWithMegaphoneMatchesJoined;
};
