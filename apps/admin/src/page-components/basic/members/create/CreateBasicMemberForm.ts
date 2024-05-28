import type {
  BasicCondition,
  BasicMember,
  FashionStyle,
  Region,
} from "@ieum/prisma";
import {
  BodyShape,
  BooksReadPerYear,
  ContactFrequency,
  ContactMethod,
  DrinkingFrequency,
  EducationLevel,
  ExercisePerWeek,
  Eyelid,
  Gender,
  MBTI,
  MemberStatus,
  OccupationStatus,
  PlannedNumberOfChildren,
  Religion,
} from "@ieum/prisma";

export interface CreateBasicMemberForm
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
}

export const createBasicMemberFormDefaultValues: CreateBasicMemberForm = {
  name: "",
  phoneNumber: "",
  gender: Gender.MALE,
  birthYear: 1990,
  residence: "",
  height: 170,
  weight: null,
  bmi: null,
  bodyShape: BodyShape.NORMAL,
  fashionStyles: [],
  eyelid: Eyelid.SINGLE,
  customEyelid: null,
  confidentFacialBodyPart: "",
  educationLevel: EducationLevel.BACHELOR_DEGREE,
  graduatedUniversity: null,
  occupationStatus: OccupationStatus.EMPLOYED,
  workplace: null,
  job: null,
  currentSchool: null,
  mbti: MBTI.INFJ,
  isSmoker: false,
  isDrinker: true,
  alcoholConsumption: null,
  alcoholTolerance: null,
  religion: Religion.NONE,
  annualIncome: null,
  assetsValue: null,
  assetManagementApproach: null,
  hobby: "",
  booksReadPerYear: BooksReadPerYear.ZERO,
  bookTaste: null,
  leisureActivity: "",
  siblings: null,
  characteristics: null,
  tenYearFuture: null,
  plannedNumberOfChildren: PlannedNumberOfChildren.NONE,
  lifePhilosophy: null,
  workPhilosophy: null,
  hasTattoo: false,
  exercisePerWeek: ExercisePerWeek.NONE,
  exerciseType: null,
  hasCar: false,
  doesGame: false,
  gameType: null,
  datingStyle: null,
  contactFrequency: ContactFrequency.OCCASIONALLY,
  customContactFrequency: null,
  contactMethod: ContactMethod.MESSAGE,
  customContactMethod: null,
  hasPet: false,
  selfIntroduction: null,

  idealMinAgeBirthYear: null,
  idealMaxAgeBirthYear: null,
  idealRegions: [],
  idealCustomRegion: null,
  idealMinHeight: null,
  idealMaxHeight: null,
  idealBodyShapes: [],
  idealFashionStyles: [],
  idealEyelids: [],
  idealFacialBodyPart: null,
  idealEducationLevel: "BACHELOR_DEGREE",
  idealSchoolLevel: null,
  idealOccupationStatuses: [{ value: "EMPLOYED" }, { value: "ENTREPRENEUR" }],
  idealNonPreferredWorkplace: null,
  idealNonPreferredJob: null,
  idealPreferredMbtis: [],
  idealNonPreferredMbtis: [],
  idealIsSmokerOk: false,
  idealDrinkingFrequency: DrinkingFrequency.OCCASIONALLY,
  idealCustomDrinkingFrequency: null,
  idealPreferredReligions: [],
  idealNonPreferredReligions: [],
  idealMinAnnualIncome: null,
  idealMinAssetsValue: null,
  idealHobby: null,
  idealBooksReadPerYear: null,
  idealCharacteristics: null,
  idealLifePhilosophy: null,
  idealIsTattooOk: false,
  idealExercisePerWeek: null,
  idealShouldHaveCar: false,
  idealIsGamingOk: true,
  idealIsPetOk: true,
  idealTypeDescription: null,

  nonNegotiableConditions: [],

  memo: null,
  vouchersLeft: 0,
  status: MemberStatus.ACTIVE,
};
