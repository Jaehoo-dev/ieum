import type {
  BasicCondition,
  BasicMemberIdealTypeV2,
  BasicMemberV2,
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
    BasicMemberV2,
    | "id"
    | "legacyId"
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
    BasicMemberIdealTypeV2,
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
