import {
  type AnnualIncome,
  type AssetsValue,
  type BooksReadPerYear,
  type EducationLevel,
  type ExercisePerWeek,
} from "@prisma/client";

export const orderedEducationLevels: EducationLevel[] = [
  "ELEMENTARY_SCHOOL_GRADUATE",
  "MIDDLE_SCHOOL_GRADUATE",
  "HIGH_SCHOOL_GRADUATE",
  "ASSOCIATE_DEGREE",
  "BACHELOR_DEGREE",
  "MASTER_DEGREE",
  "DOCTORATE_DEGREE",
];

export const orderedAnnualIncomes: AnnualIncome[] = [
  "LT_30M",
  "GTE_30M_LT_50M",
  "GTE_50M_LT_70M",
  "GTE_70M_LT_100M",
  "GTE_100M_LT_150M",
  "GTE_150M_LT_200M",
  "GTE_200M_LT_300M",
  "GTE_300M_LT_500M",
  "GTE_500M",
];

export const orderedAssetsValues: AssetsValue[] = [
  "LT_30M",
  "GTE_30M_LT_50M",
  "GTE_50M_LT_100M",
  "GTE_100M_LT_300M",
  "GTE_300M_LT_500M",
  "GTE_500M_LT_1B",
  "GTE_1B_LT_2B",
  "GTE_2B_LT_5B",
  "GTE_5B",
];

export const orderedBooksReadPerYears: BooksReadPerYear[] = [
  "ZERO",
  "GTE_1_LT_5",
  "GTE_5_LT_10",
  "GTE_10",
];

export const orderedExercisePerWeeks: ExercisePerWeek[] = [
  "NONE",
  "ONE_TO_TWO",
  "THREE_TO_FOUR",
  "FIVE_OR_MORE",
];
