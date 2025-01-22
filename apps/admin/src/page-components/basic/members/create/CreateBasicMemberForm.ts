import {
  EducationLevel,
  ExercisePerWeek,
  Gender,
  MBTI,
  MemberStatus,
  RegionV2,
  Religion,
} from "@ieum/prisma";

import type { BasicMemberForm } from "../BasicMemberForm";

export const createBasicMemberFormDefaultValues: BasicMemberForm = {
  self: {
    name: "",
    phoneNumber: "",
    gender: Gender.MALE,
    birthYear: 1990,
    residence: "",
    regionV2: RegionV2.SEOUL,
    height: 170,
    weight: null,
    bmi: null,
    bodyShape: null,
    fashionStyles: [],
    eyelid: null,
    customEyelid: null,
    confidentFacialBodyPart: null,
    educationLevel: EducationLevel.BACHELOR_DEGREE,
    graduatedUniversity: null,
    occupationStatus: null,
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
    booksReadPerYear: null,
    bookTaste: null,
    leisureActivity: null,
    siblings: null,
    characteristics: null,
    tenYearFuture: null,
    plannedNumberOfChildren: null,
    lifePhilosophy: null,
    workPhilosophy: null,
    hasTattoo: false,
    exercisePerWeek: ExercisePerWeek.NONE,
    exerciseType: null,
    hasCar: false,
    doesGame: null,
    gameType: null,
    datingStyle: null,
    contactStyle: null,
    marriagePlan: null,
    contactFrequency: null,
    customContactFrequency: null,
    contactMethod: null,
    customContactMethod: null,
    hasPet: false,
    selfIntroduction: null,
    imageBucketPaths: [],
    videoBucketPaths: [],
    audioBucketPaths: [],
    blacklistedPhoneNumbers: [],
    blacklistedNames: [],
    referrerCode: null,
    memo: null,
    status: MemberStatus.PENDING,
    personalInfoConsent: true,
    isMegaphoneUser: false,
  },
  idealType: {
    minAgeBirthYear: null,
    maxAgeBirthYear: null,
    regions: [],
    customRegion: null,
    regionsV2: [],
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
    drinkingFrequency: null,
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
    shouldHaveCar: null,
    isGamingOk: null,
    isPetOk: null,
    idealTypeDescription: null,
    dealBreakers: [],
    highPriorities: [],
    mediumPriorities: [],
    lowPriorities: [],
  },
};
