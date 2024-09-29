import {
  AnnualIncome,
  AssetsValue,
  BasicCondition,
  BodyShape,
  BooksReadPerYear,
  ContactFrequency,
  ContactMethod,
  CuisineType,
  CustomRegion,
  DrinkingFrequency,
  EducationLevel,
  ExercisePerWeek,
  Eyelid,
  FashionStyle,
  Gender,
  MatchStatus,
  OccupationStatus,
  PlannedNumberOfChildren,
  Religion,
  SeoulDistrict,
} from "@ieum/prisma";

export const 성별_라벨: Record<Gender, string> = {
  [Gender.MALE]: "남성",
  [Gender.FEMALE]: "여성",
} as const;

const Region = {
  서울: "SEOUL",
  "경기 남부": "SOUTH_GYEONGGI",
  "경기 북부": "NORTH_GYEONGGI",
  "인천/부천": "INCHEON_BUCHEON",
  "한 시간 이내": "WITHIN_ONE_HOUR",
  수도권: "SEOUL_OR_GYEONGGI",
  경상: "GYEONGSANG",
  충청: "CHUNGCHEONG",
  전라: "JEOLLA",
  강원: "GANGWON",
  제주: "JEJU",
  기타: "OTHER",
} as const;

type Region = (typeof Region)[keyof typeof Region];

export const 지역_라벨: Record<Region, string> = {
  [Region.서울]: "서울",
  [Region["경기 남부"]]: "경기 남부",
  [Region["경기 북부"]]: "경기 북부",
  [Region["인천/부천"]]: "인천/부천",
  [Region["수도권"]]: "수도권(서울/인천/경기도)",
  [Region["경상"]]: "경상",
  [Region["충청"]]: "충청",
  [Region["전라"]]: "전라",
  [Region["강원"]]: "강원",
  [Region["제주"]]: "제주",
  [Region["한 시간 이내"]]: "한 시간 이내",
  [Region.기타]: "기타",
} as const;

export const 체형_라벨: Record<BodyShape, string> = {
  [BodyShape.THIN]: "마름",
  [BodyShape.SLIM]: "슬림탄탄",
  [BodyShape.NORMAL]: "보통",
  [BodyShape.CHUBBY]: "통통",
  [BodyShape.FAT]: "풍만",
} as const;

export const 종교_라벨: Record<Religion, string> = {
  [Religion.NONE]: "없음(무교)",
  [Religion.CHRISTIAN]: "개신교",
  [Religion.CATHOLIC]: "천주교",
  [Religion.BUDDHIST]: "불교",
  [Religion.OTHER]: "기타",
} as const;

export const 상태_라벨: Record<MatchStatus, string> = {
  [MatchStatus.BACKLOG]: "백로그",
  [MatchStatus.PREPARING]: "준비중",
  [MatchStatus.PENDING]: "대기중",
  [MatchStatus.REJECTED]: "거절",
  [MatchStatus.ACCEPTED]: "성사",
  [MatchStatus.BROKEN_UP]: "헤어짐",
} as const;

export const 베이직_조건_라벨: Record<BasicCondition, string> = {
  [BasicCondition.AGE]: "나이",
  [BasicCondition.REGION]: "지역",
  [BasicCondition.HEIGHT]: "키",
  [BasicCondition.BODY_SHAPES]: "체형",
  [BasicCondition.EYELID]: "눈",
  [BasicCondition.FACIAL_BODY_PART]: "얼굴/신체 특징",
  [BasicCondition.EDUCATION_LEVEL]: "학력",
  [BasicCondition.SCHOOL_LEVEL]: "학벌",
  [BasicCondition.OCCUPATION_STATUS]: "신분",
  [BasicCondition.NON_PREFERRED_WORKPLACE_SCHOOL]: "기피 작장/학교",
  [BasicCondition.NON_PREFERRED_JOB]: "기피 직무",
  [BasicCondition.PREFERRED_MBTIS]: "선호 MBTI",
  [BasicCondition.NON_PREFERRED_MBTIS]: "기피 MBTI",
  [BasicCondition.IS_SMOKER_OK]: "흡연 여부",
  [BasicCondition.DRINKING_FREQUENCY]: "음주량",
  [BasicCondition.PREFERRED_RELIGIONS]: "선호 종교",
  [BasicCondition.NON_PREFERRED_RELIGIONS]: "기피 종교",
  [BasicCondition.MIN_ANNUAL_INCOME]: "연봉",
  [BasicCondition.MIN_ASSETS_VALUE]: "자산",
  [BasicCondition.HOBBY]: "취미/관심사",
  [BasicCondition.BOOKS_READ_PER_YEAR]: "독서량",
  [BasicCondition.CHARACTERISTICS]: "특징 5가지",
  [BasicCondition.IS_TATTOO_OK]: "문신 여부",
  [BasicCondition.EXERCISE_PER_WEEK]: "운동 여부",
  [BasicCondition.SHOULD_HAVE_CAR]: "자차 유무",
  [BasicCondition.IS_GAMING_OK]: "게임 여부",
  [BasicCondition.IS_PET_OK]: "반려동물 유무",
} as const;

export const 옷_스타일_라벨: Record<FashionStyle, string> = {
  [FashionStyle.CASUAL]: "캐주얼",
  [FashionStyle.STREET]: "스트릿",
  [FashionStyle.VINTAGE]: "빈티지",
  [FashionStyle.MODERN]: "모던",
  [FashionStyle.FEMININE]: "페미닌",
  [FashionStyle.DANDY]: "댄디",
  [FashionStyle.MINIMAL]: "미니멀",
  [FashionStyle.MAXIMAL]: "맥시멀",
  [FashionStyle.CLASSIC]: "클래식",
  [FashionStyle.SPORTY]: "스포티",
} as const;

export const 쌍꺼풀_라벨: Record<Eyelid, string> = {
  [Eyelid.SINGLE]: "무쌍꺼풀",
  [Eyelid.OUTER_DOUBLE]: "겉쌍꺼풀",
  [Eyelid.INNER_DOUBLE]: "속쌍꺼풀",
  [Eyelid.OTHER]: "기타",
} as const;

export const 학력_라벨: Record<EducationLevel, string> = {
  [EducationLevel.ELEMENTARY_SCHOOL_GRADUATE]: "초졸",
  [EducationLevel.MIDDLE_SCHOOL_GRADUATE]: "중졸",
  [EducationLevel.HIGH_SCHOOL_GRADUATE]: "고졸",
  [EducationLevel.ASSOCIATE_DEGREE]: "전문학사",
  [EducationLevel.BACHELOR_DEGREE]: "학사",
  [EducationLevel.MASTER_DEGREE]: "석사",
  [EducationLevel.DOCTORATE_DEGREE]: "박사",
} as const;

export const 최소_학력_라벨: Record<EducationLevel, string> = {
  [EducationLevel.ELEMENTARY_SCHOOL_GRADUATE]: "초등학교 졸업 이상",
  [EducationLevel.MIDDLE_SCHOOL_GRADUATE]: "중학교 졸업 이상",
  [EducationLevel.HIGH_SCHOOL_GRADUATE]: "고등학교 졸업 이상",
  [EducationLevel.ASSOCIATE_DEGREE]: "전문학사 이상",
  [EducationLevel.BACHELOR_DEGREE]: "학사 이상",
  [EducationLevel.MASTER_DEGREE]: "석사 이상",
  [EducationLevel.DOCTORATE_DEGREE]: "박사 이상",
} as const;

export const 신분_라벨: Record<OccupationStatus, string> = {
  [OccupationStatus.EMPLOYED]: "직장인",
  [OccupationStatus.ENTREPRENEUR]: "사업가/자영업",
  [OccupationStatus.STUDENT]: "학생",
  [OccupationStatus.UNEMPLOYED]: "무직",
} as const;

export const 연간_벌이_라벨: Record<AnnualIncome, string> = {
  [AnnualIncome.LT_30M]: "3천만 원 미만",
  [AnnualIncome.GTE_30M_LT_50M]: "3천만 ~ 5천만 원",
  [AnnualIncome.GTE_50M_LT_70M]: "5천만 ~ 7천만 원",
  [AnnualIncome.GTE_70M_LT_100M]: "7천만 ~ 1억 원",
  [AnnualIncome.GTE_100M_LT_150M]: "1억 ~ 1억5천만 원",
  [AnnualIncome.GTE_150M_LT_200M]: "1억5천만 ~ 2억 원",
  [AnnualIncome.GTE_200M_LT_300M]: "2억 ~ 3억 원",
  [AnnualIncome.GTE_300M_LT_500M]: "3억 ~ 5억 원",
  [AnnualIncome.GTE_500M]: "5억 원 이상",
} as const;

export const 최소_연간_벌이_라벨: Record<AnnualIncome, string> = {
  [AnnualIncome.LT_30M]: "상관없음",
  [AnnualIncome.GTE_30M_LT_50M]: "3천만 원 이상",
  [AnnualIncome.GTE_50M_LT_70M]: "5천만 원 이상",
  [AnnualIncome.GTE_70M_LT_100M]: "7천만 원 이상",
  [AnnualIncome.GTE_100M_LT_150M]: "1억 원 이상",
  [AnnualIncome.GTE_150M_LT_200M]: "1억5천만 원 이상",
  [AnnualIncome.GTE_200M_LT_300M]: "2억 원 이상",
  [AnnualIncome.GTE_300M_LT_500M]: "3억 원 이상",
  [AnnualIncome.GTE_500M]: "5억 원 이상",
} as const;

export const 자산_라벨: Record<AssetsValue, string> = {
  [AssetsValue.LT_30M]: "3천만 원 미만",
  [AssetsValue.GTE_30M_LT_50M]: "3천만 ~ 5천만 원",
  [AssetsValue.GTE_50M_LT_100M]: "5천만 ~ 1억 원",
  [AssetsValue.GTE_100M_LT_300M]: "1억 ~ 3억 원",
  [AssetsValue.GTE_300M_LT_500M]: "3억 ~ 5억 원",
  [AssetsValue.GTE_500M_LT_1B]: "5억 ~ 10억 원",
  [AssetsValue.GTE_1B_LT_2B]: "10억 ~ 20억 원",
  [AssetsValue.GTE_2B_LT_5B]: "20억 ~ 50억 원",
  [AssetsValue.GTE_5B]: "50억 원 이상",
} as const;

export const 최소_자산_라벨: Record<AssetsValue, string> = {
  [AssetsValue.LT_30M]: "상관없음",
  [AssetsValue.GTE_30M_LT_50M]: "3천만 원 이상",
  [AssetsValue.GTE_50M_LT_100M]: "5천만 원 이상",
  [AssetsValue.GTE_100M_LT_300M]: "1억 원 이상",
  [AssetsValue.GTE_300M_LT_500M]: "3억 원 이상",
  [AssetsValue.GTE_500M_LT_1B]: "5억 원 이상",
  [AssetsValue.GTE_1B_LT_2B]: "10억 원 이상",
  [AssetsValue.GTE_2B_LT_5B]: "20억 원 이상",
  [AssetsValue.GTE_5B]: "50억 원 이상",
} as const;

export const 독서량_라벨: Record<BooksReadPerYear, string> = {
  [BooksReadPerYear.ZERO]: "0권",
  [BooksReadPerYear.GTE_1_LT_5]: "1권 이상 5권 미만",
  [BooksReadPerYear.GTE_5_LT_10]: "5권 이상 10권 미만",
  [BooksReadPerYear.GTE_10]: "10권 이상",
} as const;

export const 최소_독서량_라벨: Record<BooksReadPerYear, string> = {
  [BooksReadPerYear.ZERO]: "상관없음",
  [BooksReadPerYear.GTE_1_LT_5]: "1권 이상",
  [BooksReadPerYear.GTE_5_LT_10]: "5권 이상",
  [BooksReadPerYear.GTE_10]: "10권 이상",
} as const;

export const 자녀수_라벨: Record<PlannedNumberOfChildren, string> = {
  [PlannedNumberOfChildren.NONE]: "0명",
  [PlannedNumberOfChildren.ONE]: "1명",
  [PlannedNumberOfChildren.TWO]: "2명",
  [PlannedNumberOfChildren.GTE_THREE]: "3명 이상",
  [PlannedNumberOfChildren.NO_INTENTION_OF_MARRIAGE]: "결혼 생각 없음",
} as const;

export const 주간_운동량_라벨: Record<ExercisePerWeek, string> = {
  [ExercisePerWeek.NONE]: "0회",
  [ExercisePerWeek.ONE_TO_TWO]: "1~2회",
  [ExercisePerWeek.THREE_TO_FOUR]: "3~4회",
  [ExercisePerWeek.FIVE_OR_MORE]: "5회 이상",
} as const;

export const 연락_빈도_라벨: Record<ContactFrequency, string> = {
  [ContactFrequency.SPECIAL_OCCASIONALLY]: "특별한 일이 있을 때만",
  [ContactFrequency.ONCE_OR_TWICE_A_DAY]: "하루 한두 번",
  [ContactFrequency.OCCASIONALLY]: "수시로 잠깐씩",
  [ContactFrequency.ALL_DAY]: "하루종일",
  [ContactFrequency.OTHER]: "기타",
} as const;

export const 연락_수단_라벨: Record<ContactMethod, string> = {
  [ContactMethod.MESSAGE]: "문자(메신저)",
  [ContactMethod.CALL]: "전화",
  [ContactMethod.OTHER]: "기타",
} as const;

export const 음주량_라벨: Record<DrinkingFrequency, string> = {
  [DrinkingFrequency.NEVER]: "음주를 하지 않으면 좋겠어요",
  [DrinkingFrequency.ONLY_WHEN_NECESSARY]: "일 때문에 어쩔 수 없을 때만",
  [DrinkingFrequency.OCCASIONALLY]: "가끔 맥주 한 캔 정도",
  [DrinkingFrequency.OFTEN]: "종종",
  [DrinkingFrequency.ALWAYS]: "애주가",
  [DrinkingFrequency.OTHER]: "기타",
} as const;

export const FRIP_PRODUCT_URL = "https://frip.co.kr/products/176056";
export const IMWEB_HOMEPAGE_URL = "https://ieum-love.imweb.me";
export const HOMEPAGE_URL = "https://ieum.love";
export const WWW_HOMEPAGE_URL = "https://www.ieum.love";
export const PRODUCT_URL = "https://ieum.love/shop_view/?idx=1";
export const MATCHMAKER_URL = "https://match.ieum.love";
export const WORLDCUP_URL = "https://worldcup.ieum.love";

export const 구_라벨: Record<SeoulDistrict, string> = {
  [SeoulDistrict.GANGNAM]: "강남구",
  [SeoulDistrict.GANGDONG]: "강동구",
  [SeoulDistrict.GANGBUK]: "강북구",
  [SeoulDistrict.GANGSEO]: "강서구",
  [SeoulDistrict.GWANAK]: "관악구",
  [SeoulDistrict.GWANGJIN]: "광진구",
  [SeoulDistrict.GURO]: "구로구",
  [SeoulDistrict.GEUMCHEON]: "금천구",
  [SeoulDistrict.NOWON]: "노원구",
  [SeoulDistrict.DOBONG]: "도봉구",
  [SeoulDistrict.DONGDAEMUN]: "동대문구",
  [SeoulDistrict.DONGJAK]: "동작구",
  [SeoulDistrict.MAPO]: "마포구",
  [SeoulDistrict.SEODAEMUN]: "서대문구",
  [SeoulDistrict.SEOCHO]: "서초구",
  [SeoulDistrict.SEONGDONG]: "성동구",
  [SeoulDistrict.SEONGBUK]: "성북구",
  [SeoulDistrict.SONGPA]: "송파구",
  [SeoulDistrict.YANGCHEON]: "양천구",
  [SeoulDistrict.YEONGDEUNGPO]: "영등포구",
  [SeoulDistrict.YONGSAN]: "용산구",
  [SeoulDistrict.EUNPYEONG]: "은평구",
  [SeoulDistrict.JONGNO]: "종로구",
  [SeoulDistrict.JUNG]: "중구",
  [SeoulDistrict.JUNGNANG]: "중랑구",
} as const;

export const 커스텀_지역_라벨: Record<CustomRegion, string> = {
  [CustomRegion.GANGNAM]: "강남",
  [CustomRegion.GANGNAM_STATION]: "강남역",
  [CustomRegion.JAMSIL]: "잠실",
} as const;

export const 음식종류_라벨: Record<CuisineType, string> = {
  [CuisineType.WESTERN]: "양식",
  [CuisineType.JAPANESE]: "일식",
  [CuisineType.CHINESE]: "중식",
  [CuisineType.KOREAN]: "한식",
  [CuisineType.OTHER]: "기타",
} as const;

export const primary500 = "#ff8271";
export const primary700 = "#ff6f5e";
export const blind500 = "#5d3bc1";
export const blind700 = "#382373";

export const 매치_유형 = {
  기본: "BASIC",
  확성기: "MEGAPHONE",
} as const;

export type 매치_유형 = (typeof 매치_유형)[keyof typeof 매치_유형];

export const 확성기_매치_참가자_유형 = {
  SENDER: "SENDER",
  RECEIVER: "RECEIVER",
} as const;

export type 확성기_매치_참가자_유형 =
  (typeof 확성기_매치_참가자_유형)[keyof typeof 확성기_매치_참가자_유형];

export const MATCH_DISPLAY_DURATION_DAYS = 7;

export const BASIC_MATCH_DURATION_HOURS = 24;
export const BASIC_MATCH_DURATION_HOURS_EXTENDED =
  BASIC_MATCH_DURATION_HOURS + 1;

export const MEGAPHONE_MATCH_RECEIVER_DURATION_HOURS = 72;
export const MEGAPHONE_MATCH_RECEIVER_DURATION_HOURS_EXTENDED =
  MEGAPHONE_MATCH_RECEIVER_DURATION_HOURS + 1;

export const MEGAPHONE_MATCH_SENDER_DURATION_HOURS = 24;
export const MEGAPHONE_MATCH_SENDER_DURATION_HOURS_EXTENDED =
  MEGAPHONE_MATCH_SENDER_DURATION_HOURS + 1;

export const 지역_쿼리 = {
  수도권: Region.수도권,
  충청: Region.충청,
  전체: "ALL",
} as const;

export type 지역_쿼리 = (typeof 지역_쿼리)[keyof typeof 지역_쿼리];
