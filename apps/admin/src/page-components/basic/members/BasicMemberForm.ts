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
    | "id"
    | "idV2"
    | "fashionStyles"
    | "createdAt"
    | "updatedAt"
    | "lastMatchedAt"
    | "referralCode"
    | "discountCouponCount"
  > & {
    fashionStyles: { value: FashionStyle }[];
    imageBucketPaths: { value: string }[];
    videoBucketPaths: { value: string }[];
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
    | "highPriorities"
    | "mediumPriorities"
    | "lowPriorities"
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
    highPriorities: { value: BasicCondition }[];
    mediumPriorities: { value: BasicCondition }[];
    lowPriorities: { value: BasicCondition }[];
  };
};
