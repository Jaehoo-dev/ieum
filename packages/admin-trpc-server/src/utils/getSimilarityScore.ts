import {
  BasicCondition,
  BasicMemberIdealTypeV2,
  BasicMemberV2,
  orderedAnnualIncomes,
  orderedAssetsValues,
  orderedBooksReadPerYears,
  orderedEducationLevels,
  orderedExercisePerWeeks,
} from "@ieum/prisma";
import { match } from "ts-pattern";

/**
 * target이 idealType의 필수 조건은 만족했다고 가정한다.
 */
export function getSimilarityScore(
  idealType: BasicMemberIdealTypeV2,
  target: BasicMemberV2,
) {
  const { highPriorities, mediumPriorities, lowPriorities } = idealType;
  const highPrioritiesSet = new Set(highPriorities);
  const mediumPrioritiesSet = new Set(mediumPriorities);
  const lowPrioritiesSet = new Set(lowPriorities);
  const prioritySets = {
    highPriorities: highPrioritiesSet,
    mediumPriorities: mediumPrioritiesSet,
    lowPriorities: lowPrioritiesSet,
  };

  return Object.values(BasicCondition)
    .filter((condition) => {
      return (
        prioritySets.highPriorities.has(condition) ||
        prioritySets.mediumPriorities.has(condition) ||
        prioritySets.lowPriorities.has(condition)
      );
    })
    .reduce((acc, condition) => {
      return (
        match(condition)
          .with(BasicCondition.AGE, () => {
            const 나이_부합하는가 =
              (idealType.minAgeBirthYear == null ||
                idealType.minAgeBirthYear >= target.birthYear) &&
              (idealType.maxAgeBirthYear == null ||
                idealType.maxAgeBirthYear <= target.birthYear);

            return 나이_부합하는가
              ? acc + getConditionScore(BasicCondition.AGE, prioritySets)
              : acc;
          })
          .with(BasicCondition.HEIGHT, () => {
            const 키_부합하는가 =
              (idealType.minHeight == null ||
                idealType.minHeight <= target.height) &&
              (idealType.maxHeight == null ||
                idealType.maxHeight >= target.height);

            return 키_부합하는가
              ? acc + getConditionScore(BasicCondition.HEIGHT, prioritySets)
              : acc;
          })
          .with(BasicCondition.EDUCATION_LEVEL, () => {
            if (idealType.educationLevel == null) {
              return acc;
            }

            const 학력_부합하는가 = orderedEducationLevels
              .slice(orderedEducationLevels.indexOf(idealType.educationLevel))
              .includes(target.educationLevel);

            return 학력_부합하는가
              ? acc +
                  getConditionScore(
                    BasicCondition.EDUCATION_LEVEL,
                    prioritySets,
                  )
              : acc;
          })
          .with(BasicCondition.OCCUPATION_STATUS, () => {
            if (
              target.occupationStatus == null ||
              idealType.occupationStatuses.length === 0
            ) {
              return acc;
            }

            const 직업_부합하는가 = idealType.occupationStatuses.includes(
              target.occupationStatus,
            );

            return 직업_부합하는가
              ? acc +
                  getConditionScore(
                    BasicCondition.OCCUPATION_STATUS,
                    prioritySets,
                  )
              : acc;
          })
          .with(BasicCondition.PREFERRED_MBTIS, () => {
            if (idealType.preferredMbtis.length === 0 || target.mbti == null) {
              return acc;
            }

            const 선호_MBTI_부합하는가 = idealType.preferredMbtis.includes(
              target.mbti,
            );

            return 선호_MBTI_부합하는가
              ? acc +
                  getConditionScore(
                    BasicCondition.PREFERRED_MBTIS,
                    prioritySets,
                  )
              : acc;
          })
          .with(BasicCondition.NON_PREFERRED_MBTIS, () => {
            if (
              idealType.nonPreferredMbtis.length === 0 ||
              target.mbti == null
            ) {
              return acc;
            }

            const 비선호_MBTI_부합하는가 =
              !idealType.nonPreferredMbtis.includes(target.mbti);

            return 비선호_MBTI_부합하는가
              ? acc +
                  getConditionScore(
                    BasicCondition.NON_PREFERRED_MBTIS,
                    prioritySets,
                  )
              : acc;
          })
          // TODO: 정교화
          .with(BasicCondition.IS_SMOKER_OK, () => {
            if (target.isSmoker) {
              return acc;
            }

            return (
              acc + getConditionScore(BasicCondition.IS_SMOKER_OK, prioritySets)
            );
          })
          .with(BasicCondition.PREFERRED_RELIGIONS, () => {
            if (
              idealType.preferredReligions.length === 0 &&
              target.religion === "NONE"
            ) {
              return (
                acc +
                getConditionScore(
                  BasicCondition.PREFERRED_RELIGIONS,
                  prioritySets,
                )
              );
            }

            const 선호_종교_부합하는가 = idealType.preferredReligions.includes(
              target.religion,
            );

            return 선호_종교_부합하는가
              ? acc +
                  getConditionScore(
                    BasicCondition.PREFERRED_RELIGIONS,
                    prioritySets,
                  )
              : acc;
          })
          .with(BasicCondition.NON_PREFERRED_RELIGIONS, () => {
            if (
              idealType.nonPreferredReligions.length >= 3 &&
              target.religion === "NONE"
            ) {
              return (
                acc +
                getConditionScore(
                  BasicCondition.NON_PREFERRED_RELIGIONS,
                  prioritySets,
                )
              );
            }

            const 비선호_종교_부합하는가 =
              !idealType.nonPreferredReligions.includes(target.religion);

            return 비선호_종교_부합하는가
              ? acc +
                  getConditionScore(
                    BasicCondition.NON_PREFERRED_RELIGIONS,
                    prioritySets,
                  )
              : acc;
          })
          .with(BasicCondition.MIN_ANNUAL_INCOME, () => {
            if (
              idealType.minAnnualIncome == null ||
              target.annualIncome == null
            ) {
              return acc;
            }

            return orderedAnnualIncomes
              .slice(orderedAnnualIncomes.indexOf(idealType.minAnnualIncome))
              .includes(target.annualIncome)
              ? acc +
                  getConditionScore(
                    BasicCondition.MIN_ANNUAL_INCOME,
                    prioritySets,
                  )
              : acc;
          })
          .with(BasicCondition.MIN_ASSETS_VALUE, () => {
            if (
              idealType.minAssetsValue == null ||
              target.assetsValue == null
            ) {
              return acc;
            }

            return orderedAssetsValues
              .slice(orderedAssetsValues.indexOf(idealType.minAssetsValue))
              .includes(target.assetsValue)
              ? acc +
                  getConditionScore(
                    BasicCondition.MIN_ASSETS_VALUE,
                    prioritySets,
                  )
              : acc;
          })
          .with(BasicCondition.BOOKS_READ_PER_YEAR, () => {
            if (
              target.booksReadPerYear == null ||
              idealType.booksReadPerYear == null
            ) {
              return acc;
            }

            return orderedBooksReadPerYears
              .slice(
                orderedBooksReadPerYears.indexOf(idealType.booksReadPerYear),
              )
              .includes(target.booksReadPerYear)
              ? acc +
                  getConditionScore(
                    BasicCondition.BOOKS_READ_PER_YEAR,
                    prioritySets,
                  )
              : acc;
          })
          // TODO: 정교화
          .with(BasicCondition.IS_TATTOO_OK, () => {
            if (target.hasTattoo) {
              return acc;
            }

            return (
              acc + getConditionScore(BasicCondition.IS_TATTOO_OK, prioritySets)
            );
          })
          .with(BasicCondition.EXERCISE_PER_WEEK, () => {
            if (idealType.exercisePerWeek == null) {
              return acc;
            }

            return orderedExercisePerWeeks
              .slice(orderedExercisePerWeeks.indexOf(idealType.exercisePerWeek))
              .includes(target.exercisePerWeek)
              ? acc +
                  getConditionScore(
                    BasicCondition.EXERCISE_PER_WEEK,
                    prioritySets,
                  )
              : acc;
          })
          .with(BasicCondition.SHOULD_HAVE_CAR, () => {
            if (!target.hasCar) {
              return acc;
            }

            return (
              acc +
              getConditionScore(BasicCondition.SHOULD_HAVE_CAR, prioritySets)
            );
          })
          // TODO: 정교화
          .with(BasicCondition.IS_GAMING_OK, () => {
            if (idealType.isGamingOk === false && !target.doesGame) {
              return (
                acc +
                getConditionScore(BasicCondition.IS_GAMING_OK, prioritySets)
              );
            }

            return acc;
          })
          .with(BasicCondition.IS_PET_OK, () => {
            if (idealType.isPetOk === false && !target.hasPet) {
              return (
                acc + getConditionScore(BasicCondition.IS_PET_OK, prioritySets)
              );
            }

            return acc;
          })
          .with(
            BasicCondition.REGION,
            BasicCondition.BODY_SHAPES,
            BasicCondition.CHARACTERISTICS,
            BasicCondition.DRINKING_FREQUENCY,
            BasicCondition.EYELID,
            BasicCondition.FACIAL_BODY_PART,
            BasicCondition.HOBBY,
            BasicCondition.NON_PREFERRED_WORKPLACE_SCHOOL,
            BasicCondition.NON_PREFERRED_JOB,
            BasicCondition.SCHOOL_LEVEL,
            () => {
              return acc;
            },
          )
          .exhaustive()
      );
    }, 0);
}

function getConditionScore(
  condition: BasicCondition,
  prioritySets: {
    highPriorities: Set<BasicCondition>;
    mediumPriorities: Set<BasicCondition>;
    lowPriorities: Set<BasicCondition>;
  },
) {
  if (prioritySets.highPriorities.has(condition)) {
    return 3;
  }

  if (prioritySets.mediumPriorities.has(condition)) {
    return 2;
  }

  if (prioritySets.lowPriorities.has(condition)) {
    return 1;
  }

  throw new Error("No priority for condition");
}
