import { BasicMemberIdealTypeV2, BasicMemberV2 } from "@prisma/client";
import { match } from "ts-pattern";

import {
  orderedAnnualIncomes,
  orderedAssetsValues,
  orderedBooksReadPerYears,
  orderedEducationLevels,
  orderedExercisePerWeeks,
} from "./orders";

export function satisfiesDealBreakers({
  selfIdealType,
  target,
}: {
  selfIdealType: BasicMemberIdealTypeV2;
  target: BasicMemberV2;
}) {
  const {
    dealBreakers,
    minAgeBirthYear,
    maxAgeBirthYear,
    minHeight,
    maxHeight,
    educationLevel,
    occupationStatuses,
    preferredMbtis,
    nonPreferredMbtis,
    isSmokerOk,
    preferredReligions,
    nonPreferredReligions,
    minAnnualIncome,
    minAssetsValue,
    booksReadPerYear,
    isTattooOk,
    exercisePerWeek,
    shouldHaveCar,
    isGamingOk,
    isPetOk,
  } = selfIdealType;

  for (const dealBreaker of dealBreakers) {
    const satisfiesCondition = match(dealBreaker)
      .with("AGE", () => {
        return (
          (minAgeBirthYear == null || target.birthYear <= minAgeBirthYear) &&
          (maxAgeBirthYear == null || target.birthYear >= maxAgeBirthYear)
        );
      })
      .with("HEIGHT", () => {
        return (
          (minHeight == null || target.height >= minHeight) &&
          (maxHeight == null || target.height <= maxHeight)
        );
      })
      .with("EDUCATION_LEVEL", () => {
        if (educationLevel == null) {
          return true;
        }

        return orderedEducationLevels
          .slice(orderedEducationLevels.indexOf(educationLevel))
          .includes(target.educationLevel);
      })
      .with("OCCUPATION_STATUS", () => {
        return occupationStatuses.includes(target.occupationStatus);
      })
      .with("PREFERRED_MBTIS", () => {
        if (target.mbti == null) {
          return true;
        }

        return preferredMbtis.includes(target.mbti);
      })
      .with("NON_PREFERRED_MBTIS", () => {
        if (target.mbti == null) {
          return true;
        }

        return !nonPreferredMbtis.includes(target.mbti);
      })
      .with("IS_SMOKER_OK", () => {
        if (isSmokerOk) {
          return true;
        }

        return !target.isSmoker;
      })
      .with("PREFERRED_RELIGIONS", () => {
        return preferredReligions.includes(target.religion);
      })
      .with("NON_PREFERRED_RELIGIONS", () => {
        return !nonPreferredReligions.includes(target.religion);
      })
      .with("MIN_ANNUAL_INCOME", () => {
        if (minAnnualIncome == null) {
          return true;
        }

        if (target.annualIncome == null) {
          return false;
        }

        return orderedAnnualIncomes
          .slice(orderedAnnualIncomes.indexOf(minAnnualIncome))
          .includes(target.annualIncome);
      })
      .with("MIN_ASSETS_VALUE", () => {
        if (minAssetsValue == null) {
          return true;
        }

        if (target.assetsValue == null) {
          return false;
        }

        return orderedAssetsValues
          .slice(orderedAssetsValues.indexOf(minAssetsValue))
          .includes(target.assetsValue);
      })
      .with("BOOKS_READ_PER_YEAR", () => {
        if (booksReadPerYear == null) {
          return true;
        }

        return orderedBooksReadPerYears
          .slice(orderedBooksReadPerYears.indexOf(booksReadPerYear))
          .includes(target.booksReadPerYear);
      })
      .with("IS_TATTOO_OK", () => {
        if (isTattooOk) {
          return true;
        }

        return !target.hasTattoo;
      })
      .with("EXERCISE_PER_WEEK", () => {
        if (exercisePerWeek == null) {
          return true;
        }

        return orderedExercisePerWeeks
          .slice(orderedExercisePerWeeks.indexOf(exercisePerWeek))
          .includes(target.exercisePerWeek);
      })
      .with("SHOULD_HAVE_CAR", () => {
        if (!shouldHaveCar) {
          return true;
        }

        return target.hasCar;
      })
      .with("IS_GAMING_OK", () => {
        if (isGamingOk) {
          return true;
        }

        return !target.doesGame;
      })
      .with("IS_PET_OK", () => {
        if (isPetOk) {
          return true;
        }

        return !target.hasPet;
      })
      .otherwise(() => true);

    if (!satisfiesCondition) {
      return false;
    }
  }

  return true;
}
