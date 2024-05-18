import {
  BodyShape,
  BooksReadPerYear,
  ContactFrequency,
  ContactMethod,
  EducationLevel,
  ExercisePerWeek,
  Eyelid,
  Gender,
  MBTI,
  OccupationStatus,
  PlannedNumberOfChildren,
  type Region,
  Religion,
  type BasicMember,
  type FashionStyle,
  type BasicCondition,
  DrinkingFrequency,
  MemberStatus,
} from "@prisma/client";

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
  fashionStyles: Array<{ value: FashionStyle }>;
  idealRegions: Array<{ value: Region }>;
  idealBodyShapes: Array<{ value: BodyShape }>;
  idealFashionStyles: Array<{ value: FashionStyle }>;
  idealEyelids: Array<{ value: Eyelid }>;
  idealOccupationStatuses: Array<{ value: OccupationStatus }>;
  idealPreferredMbtis: Array<{ value: MBTI }>;
  idealNonPreferredMbtis: Array<{ value: MBTI }>;
  idealPreferredReligions: Array<{ value: Religion }>;
  idealNonPreferredReligions: Array<{ value: Religion }>;
  nonNegotiableConditions: Array<{ value: BasicCondition }>;
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
