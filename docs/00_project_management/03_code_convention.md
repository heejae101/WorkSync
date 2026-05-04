# 코드 컨벤션

## 공통 규칙

- 이름은 역할이 드러나게 작성한다.
- 불필요한 축약어를 피한다.
- 주석은 복잡한 의도나 정책을 설명할 때만 쓴다.
- 비밀값은 코드나 문서에 직접 적지 않는다.
- 에러 처리는 사용자 메시지와 개발자 로그를 분리한다.

## Backend

### 패키지 구조 후보

```text
com.companyhelper
├── auth
├── user
├── session
├── meeting
├── deadline
├── report
├── review
├── research
├── common
└── config
```

### 네이밍

| 대상 | 규칙 | 예시 |
|---|---|---|
| Controller | `도메인Controller` | `SessionController` |
| Service | `도메인Service` | `SessionService` |
| Mapper | `도메인Mapper` | `SessionMapper` |
| DTO | `동작Request/Response` | `CreateSessionRequest` |
| Entity/Model | 명사 | `Session` |

### API 규칙

- URL은 복수 명사를 사용한다.
- 인증이 필요한 API는 명확히 구분한다.
- 요청/응답 DTO를 분리한다.
- 에러 응답 형식을 통일한다.

예시:

```text
GET /api/sessions
POST /api/sessions
GET /api/deadlines
POST /api/reports/weekly
```

## Frontend

### 폴더 구조 후보

```text
src/
├── app
├── pages
├── features
├── components
├── api
├── hooks
├── styles
└── utils
```

### 컴포넌트 규칙

- 재사용 컴포넌트는 `components`에 둔다.
- 도메인 전용 컴포넌트는 `features/{domain}`에 둔다.
- 페이지 단위 컴포넌트는 `pages`에 둔다.
- API 호출 코드는 화면 컴포넌트 안에 흩뿌리지 않는다.

## Database

- 테이블명과 컬럼명은 snake_case를 사용한다.
- 기본키는 `id`를 사용한다.
- 생성/수정 일시는 `created_at`, `updated_at`을 사용한다.
- 외래키 컬럼은 `{대상}_id` 형식을 사용한다.
- enum 후보 값은 설계 문서에 먼저 정의한다.

## AI Worker

- AI 프롬프트는 코드에 숨기지 말고 별도 파일 또는 명확한 상수로 관리한다.
- AI 응답은 신뢰하지 말고 파싱/검증 단계를 둔다.
- 실패 원인과 원본 입력 추적 정보를 남긴다.
- 개인정보나 민감정보가 외부 AI API로 전달되는지 검토한다.

