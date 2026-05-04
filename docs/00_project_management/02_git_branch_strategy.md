# Git 브랜치 전략

## 목적
팀 개발 시 충돌을 줄이고 작업 흐름을 명확히 하기 위한 Git 사용 규칙을 정의한다.

## 브랜치 종류

| 브랜치 | 용도 | 예시 |
|---|---|---|
| `main` | 안정 버전 | 배포 가능한 상태 |
| `develop` | 통합 개발 브랜치 | 기능 병합 대상 |
| `feature/*` | 기능 개발 | `feature/login` |
| `docs/*` | 문서 작업 | `docs/requirements` |
| `fix/*` | 버그 수정 | `fix/login-error` |
| `refactor/*` | 리팩터링 | `refactor/session-service` |
| `study/*` | 학습/실험 | `study/langgraph-basic` |

## 브랜치 네이밍

```text
종류/작업-요약
```

예시:

```text
feature/personal-session
docs/screen-design
fix/deadline-parser
study/postgresql-index
```

## 커밋 메시지 규칙

```text
type: 요약
```

| type | 의미 |
|---|---|
| `feat` | 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 수정 |
| `test` | 테스트 추가/수정 |
| `refactor` | 동작 변경 없는 구조 개선 |
| `chore` | 설정, 빌드, 기타 작업 |
| `study` | 학습 자료 추가 |

예시:

```text
docs: 요구사항 정의서 초안 추가
feat: 개인 세션 생성 API 추가
test: 로그인 실패 테스트 추가
```

## PR 규칙

- PR은 하나의 목적만 가진다.
- PR 설명에는 변경 내용, 테스트 결과, 관련 문서를 적는다.
- 화면 변경이 있으면 스크린샷을 첨부한다.
- 설계 변경이 있으면 관련 설계 문서 링크를 포함한다.
- 리뷰 반영 후에는 어떤 의견을 어떻게 반영했는지 남긴다.

## PR 템플릿

```md
## 변경 내용

- 

## 관련 문서

- 

## 테스트

- [ ] 단위 테스트
- [ ] 통합 테스트
- [ ] 화면 확인
- [ ] 문서만 변경

## 미결정/검토 필요

- 
```

## 보호 규칙 후보

- `main` 직접 push 금지
- `develop` 직접 push 금지
- PR 리뷰 1명 이상 승인 후 병합
- 테스트 실패 시 병합 금지

