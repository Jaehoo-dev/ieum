# 이음

포트폴리오용으로 임시 공개합니다.

## 레포지토리 구성

```text
apps
  ├─ admin
  |   └─ 운영자용 어드민. 회원 생성 및 데이터 조회, 매칭(조건에 따라 이성 필터링), 매칭 이력 조회, 알림톡 발송 등
  ├─ blind
  |   └─ 이음 블라인드 회원용 사이트. 회원 목록을 보고 회원들이 스스로 하트를 주고받는 자동화 제품이며 사진 공개 X
  ├─ matchmaker
  |   └─ 이음 회원용 사이트. 소개 알림톡을 받으면 소개받은 이성의 프로필을 확인하고 수락 여부를 결정, 계정 설정 등
  └─ reviews
      └─ 자사몰 상품페이지에 아이프레임을 띄워 프립의 후기를 보여주는 사이트.
packages
  ├─ admin-auth
  |   └─ admin과 admin-trpc-server에서 사용하는 next-auth wrapper
  ├─ admin-trpc-server
  |   └─ admin이 사용하는 trpc server
  ├─ blind-auth
  |   └─ blind와 blind-trpc-server에서 사용하는 next-auth wrapper
  ├─ blind-trpc-server
  |   └─ blind가 사용하는 trpc server
  ├─ constants
  ├─ matchmaker-trpc-server
  |   └─ matchmaker와 reviews가 사용하는 trpc server
  ├─ prisma
  ├─ profile
  |   └─ admin과 blind, matchmaker가 사용하는 프로필 컴포넌트
  ├─ slack
  ├─ solapi
  |   └─ 메시징 서비스 인스턴스
  ├─ supabase
  |   └─ Supabase 클라이언트 인스턴스
  └─ utils
tooling
  ├─ eslint
  ├─ prettier
  ├─ tailwind
  └─ typescript
```

처음엔 아무 개발 없이 시작했다가 회원이 많아지면서 코드를 쓰기 시작했습니다. 사업을 시작할 때 풀어야겠다고 잡은 문제 중 하나가 듀오나 가연 같은 기존 결혼정보회사들의 높은 가격이었기 때문에 기술적 판단의 기준은 항상 **효율성**이었습니다. 극단적으로 효율을 추구하면서 혼자, 빠르게 일을 할 수 있는 환경을 만들어 나갔습니다.

혼자 빠르게 일할 수 있도록 [t3 스택](https://create.t3.gg/)을 선택하고 모노리포를 구성했습니다. 타입스크립트, [trpc](https://trpc.io/)와 prisma로 프론트엔드와 서버가 타입 시스템을 공유하고 Tailwind CSS를 디자인 시스템처럼 사용했습니다. 프로젝트들 사이에 공유해야 할 코드는 패키지로 꾸리는 동시에 중복 코드도 폭넓게 허용했습니다. 로깅은 시스템을 정교하게 구축하기보단 목적별 슬랙 채널에 메시지를 보내 로그를 남겼습니다.

모노리포로 구성했는데도 ui 패키지가 없습니다. admin, matchmaker, reviews 순으로 앱을 생성하고 사업 말미에 blind를 만들었기 때문인데 admin은 사실상 스타일링을 신경쓰지 않았고, reviews는 자사몰 스타일을 따랐기 때문에 matchmaker만을 위한 ui 패키지를 만들진 않았습니다. 나중에 만든 blind는 색상을 제외하곤 matchmaker의 디자인을 따랐지만 모객용 실험 제품이고 두 제품의 디자인이 꼭 같이 변해야 하는 것도 아니었기 때문에 Tailwind CSS 클래스들을 복사하는 방식으로 일단 빠르게 출시했습니다. 다만 회원 프로필은 matchmaker와 admin 미리보기에서 공통으로 사용해야 해 일찍이 패키지로 만들었습니다. profile 패키지 대신 ui 패키지 안에 Profile 컴포넌트를 만드는 선택지도 유효했겠습니다.
