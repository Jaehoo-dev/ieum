import type {
  BasicCondition,
  BasicMember,
  BodyShape,
  Eyelid,
  FashionStyle,
  MBTI,
  OccupationStatus,
  Region,
  Religion,
} from "@ieum/prisma";

export interface BasicMemberForm
  extends Omit<
    BasicMember,
    | "id"
    | "fashionStyles"
    | "idealRegions"
    | "idealBodyShapes"
    | "idealFashionStyles"
    | "idealEyelids"
    | "idealOccupationStatuses"
    | "idealPreferredMbtis"
    | "idealNonPreferredMbtis"
    | "idealPreferredReligions"
    | "idealNonPreferredReligions"
    | "nonNegotiableConditions"
    | "createdAt"
    | "updatedAt"
  > {
  fashionStyles: { value: FashionStyle }[];
  idealRegions: { value: Region }[];
  idealBodyShapes: { value: BodyShape }[];
  idealFashionStyles: { value: FashionStyle }[];
  idealEyelids: { value: Eyelid }[];
  idealOccupationStatuses: { value: OccupationStatus }[];
  idealPreferredMbtis: { value: MBTI }[];
  idealNonPreferredMbtis: { value: MBTI }[];
  idealPreferredReligions: { value: Religion }[];
  idealNonPreferredReligions: { value: Religion }[];
  nonNegotiableConditions: { value: BasicCondition }[];
  imageBucketPaths: { value: string }[];
}
