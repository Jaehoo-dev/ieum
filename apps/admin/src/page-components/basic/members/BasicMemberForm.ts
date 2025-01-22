import type {
  BasicCondition,
  BasicMemberIdealTypeV2,
  BasicMemberV2,
  BodyShape,
  Eyelid,
  FashionStyle,
  MBTI,
  OccupationStatus,
  RegionV2,
  Religion,
} from "@ieum/prisma";

export interface BasicMemberForm {
  self: Omit<
    BasicMemberV2,
    | "id"
    | "legacyId"
    | "region"
    | "fashionStyles"
    | "createdAt"
    | "updatedAt"
    | "lastMatchedAt"
    | "referralCode"
    | "discountCouponCount"
  > & {
    regionV2: RegionV2;
    fashionStyles: { value: FashionStyle }[];
    imageBucketPaths: { value: string }[];
    videoBucketPaths: { value: string }[];
    audioBucketPaths: { value: string }[];
  };
  idealType: Omit<
    BasicMemberIdealTypeV2,
    | "memberId"
    | "regionsV2"
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
    regionsV2: { value: RegionV2 }[];
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
}
