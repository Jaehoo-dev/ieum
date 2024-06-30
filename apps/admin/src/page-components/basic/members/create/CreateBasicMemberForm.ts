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

import { BasicMemberForm } from "../BasicMemberForm";

export const createBasicMemberFormDefaultValues: BasicMemberForm = {
  self: {
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
    imageBucketPaths: [],

    memo: null,
    status: MemberStatus.ACTIVE,
  },
  idealType: {
    minAgeBirthYear: null,
    maxAgeBirthYear: null,
    regions: [],
    customRegion: null,
    minHeight: null,
    maxHeight: null,
    bodyShapes: [],
    fashionStyles: [],
    eyelids: [],
    facialBodyPart: null,
    educationLevel: "BACHELOR_DEGREE",
    schoolLevel: null,
    occupationStatuses: [{ value: "EMPLOYED" }, { value: "ENTREPRENEUR" }],
    nonPreferredWorkplace: null,
    nonPreferredJob: null,
    preferredMbtis: [],
    nonPreferredMbtis: [],
    isSmokerOk: false,
    drinkingFrequency: DrinkingFrequency.OCCASIONALLY,
    customDrinkingFrequency: null,
    preferredReligions: [],
    nonPreferredReligions: [],
    minAnnualIncome: null,
    minAssetsValue: null,
    hobby: null,
    booksReadPerYear: null,
    characteristics: null,
    lifePhilosophy: null,
    isTattooOk: false,
    exercisePerWeek: null,
    shouldHaveCar: false,
    isGamingOk: true,
    isPetOk: true,
    idealTypeDescription: null,
    dealBreakers: [],
  },
};
