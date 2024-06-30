import type {
  BasicCondition,
  BasicMember,
  BasicMemberIdealType,
  BodyShape,
  Eyelid,
  FashionStyle,
  MBTI,
  OccupationStatus,
  Region,
  Religion,
} from "@ieum/prisma";

export type BasicMemberForm = {
  self: Omit<
    BasicMember,
    "id" | "fashionStyles" | "createdAt" | "updatedAt"
  > & {
    fashionStyles: { value: FashionStyle }[];
    imageBucketPaths: { value: string }[];
  };
  idealType: Omit<
    BasicMemberIdealType,
    | "memberId"
    | "regions"
    | "bodyShapes"
    | "fashionStyles"
    | "eyelids"
    | "occupationStatuses"
    | "preferredMbtis"
    | "nonPreferredMbtis"
    | "preferredReligions"
    | "nonPreferredReligions"
    | "dealBreakers"
  > & {
    regions: { value: Region }[];
    bodyShapes: { value: BodyShape }[];
    fashionStyles: { value: FashionStyle }[];
    eyelids: { value: Eyelid }[];
    occupationStatuses: { value: OccupationStatus }[];
    preferredMbtis: { value: MBTI }[];
    nonPreferredMbtis: { value: MBTI }[];
    preferredReligions: { value: Religion }[];
    nonPreferredReligions: { value: Religion }[];
    dealBreakers: { value: BasicCondition }[];
  };
};
