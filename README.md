# 이음

포트폴리오용으로 임시 공개합니다.

```text
apps
  ├─ admin
  |   └─ 운영자용 어드민. 회원 생성 및 데이터 조회, 매칭(조건에 따라 이성 필터링), 매칭 이력 조회, 알림톡 발송 등
  ├─ blind
  |   └─ 이음 블라인드 회원용 사이트. 회원 목록을 보고 회원들이 스스로 하트를 주고받는 자동화 제품이며 사진 공개 X
  ├─ matchmaker
  |   └─ 이음 회원용 사이트. 소개 알림톡을 받으면 소개받은 이성의 프로필을 확인하고 수락 여부를 결정, 계정 설정 등
  └─ reviews
      └─ 자사몰 상품세이지에 프립의 후기를 보여주는 사이트.
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
