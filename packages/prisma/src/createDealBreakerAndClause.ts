import { BasicMemberIdealType } from "@prisma/client";
import { match } from "ts-pattern";

import {
  orderedAnnualIncomes,
  orderedAssetsValues,
  orderedBooksReadPerYears,
  orderedEducationLevels,
  orderedExercisePerWeeks,
} from "./orders";

export function createDealBreakerAndClause(
  idealType: Omit<BasicMemberIdealType, "memberId">,
) {
  return idealType.dealBreakers.map((condition) => {
    return match(condition)
      .with("AGE", () => {
        return {
          birthYear: {
            gte: idealType.maxAgeBirthYear ?? undefined,
            lte: idealType.minAgeBirthYear ?? undefined,
          },
        };
      })
      .with("HEIGHT", () => {
        return {
          height: {
            gte: idealType.minHeight ?? undefined,
            lte: idealType.maxHeight ?? undefined,
          },
        };
      })
      .with("EDUCATION_LEVEL", () => {
        return {
          educationLevel:
            idealType.educationLevel != null
              ? {
                  in: orderedEducationLevels.slice(
                    orderedEducationLevels.indexOf(idealType.educationLevel),
                  ),
                }
              : undefined,
        };
      })
      .with("OCCUPATION_STATUS", () => {
        if (idealType.occupationStatuses.length === 0) {
          return {};
        }

        return {
          occupationStatus: {
            in: idealType.occupationStatuses,
          },
        };
      })
      .with("PREFERRED_MBTIS", () => {
        return {
          mbti: {
            in: idealType.preferredMbtis,
          },
        };
      })
      .with("NON_PREFERRED_MBTIS", () => {
        return {
          mbti: {
            notIn: idealType.nonPreferredMbtis,
          },
        };
      })
      .with("IS_SMOKER_OK", () => {
        return {
          isSmoker: !idealType.isSmokerOk ? false : undefined,
        };
      })
      .with("PREFERRED_RELIGIONS", () => {
        return {
          religion: {
            in: idealType.preferredReligions,
          },
        };
      })
      .with("NON_PREFERRED_RELIGIONS", () => {
        return {
          religion: {
            notIn: idealType.nonPreferredReligions,
          },
        };
      })
      .with("MIN_ANNUAL_INCOME", () => {
        return {
          annualIncome: {
            in:
              idealType.minAnnualIncome != null
                ? orderedAnnualIncomes.slice(
                    orderedAnnualIncomes.indexOf(idealType.minAnnualIncome),
                  )
                : undefined,
          },
        };
      })
      .with("MIN_ASSETS_VALUE", () => {
        return {
          assetsValue: {
            in:
              idealType.minAssetsValue != null
                ? orderedAssetsValues.slice(
                    orderedAssetsValues.indexOf(idealType.minAssetsValue),
                  )
                : undefined,
          },
        };
      })
      .with("BOOKS_READ_PER_YEAR", () => {
        return {
          booksReadPerYear:
            idealType.booksReadPerYear != null
              ? {
                  in: orderedBooksReadPerYears.slice(
                    orderedBooksReadPerYears.indexOf(
                      idealType.booksReadPerYear,
                    ),
                  ),
                }
              : undefined,
        };
      })
      .with("IS_TATTOO_OK", () => {
        return {
          hasTattoo: !idealType.isTattooOk ? false : undefined,
        };
      })
      .with("EXERCISE_PER_WEEK", () => {
        return {
          exercisePerWeek:
            idealType.exercisePerWeek != null &&
            idealType.exercisePerWeek !== "NONE"
              ? { in: orderedExercisePerWeeks.slice(1) }
              : undefined,
        };
      })
      .with("SHOULD_HAVE_CAR", () => {
        return {
          hasCar: idealType.shouldHaveCar === true ? true : undefined,
        };
      })
      .with("IS_GAMING_OK", () => {
        return {
          doesGame: idealType.isGamingOk,
        };
      })
      .with("IS_PET_OK", () => {
        return {
          hasPet: idealType.isPetOk,
        };
      })
      .with(
        "BODY_SHAPES",
        "CHARACTERISTICS",
        "DRINKING_FREQUENCY",
        "EYELID",
        "FACIAL_BODY_PART",
        "HOBBY",
        "NON_PREFERRED_WORKPLACE_SCHOOL",
        "NON_PREFERRED_JOB",
        "REGION",
        "SCHOOL_LEVEL",
        () => {
          return {};
        },
      )
      .exhaustive();
  });
}
