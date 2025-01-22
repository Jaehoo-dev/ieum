import type {
  AnnualIncome,
  BodyShape,
  EducationLevel,
  MBTI,
  RegionV2,
  Religion,
} from "@ieum/prisma";

export interface DemoForm {
  idealMinAgeBirthYear: number | null;
  idealMaxAgeBirthYear: number | null;
  idealRegions: RegionV2[];
  idealMinHeight: number | null;
  idealMaxHeight: number | null;
  idealBodyShapes: BodyShape[];
  idealFacialBodyPart: string | null;
  idealEducationLevel: EducationLevel | null;
  idealSchoolLevel: string | null;
  idealNonPreferredWorkplace: string | null;
  idealNonPreferredJob: string | null;
  idealMinAnnualIncome: AnnualIncome | null;
  idealPreferredMbtis: MBTI[];
  idealNonPreferredMbtis: MBTI[];
  idealCharacteristics: string[];
  idealIsSmokerOk: boolean | null;
  idealPreferredReligions: Religion[];
  idealNonPreferredReligions: Religion[];
  idealIsTattooOk: boolean | null;
  idealTypeDescription: string;
}

export const defaultDemoForm: DemoForm = {
  idealMinAgeBirthYear: null,
  idealMaxAgeBirthYear: null,
  idealRegions: [],
  idealMinHeight: null,
  idealMaxHeight: null,
  idealBodyShapes: [],
  idealFacialBodyPart: null,
  idealEducationLevel: null,
  idealSchoolLevel: null,
  idealNonPreferredWorkplace: null,
  idealNonPreferredJob: null,
  idealMinAnnualIncome: null,
  idealPreferredMbtis: [],
  idealNonPreferredMbtis: [],
  idealCharacteristics: [],
  idealIsSmokerOk: null,
  idealPreferredReligions: [],
  idealNonPreferredReligions: [],
  idealIsTattooOk: null,
  idealTypeDescription: "",
};
