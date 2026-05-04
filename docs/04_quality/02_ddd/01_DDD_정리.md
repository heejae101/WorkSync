# DDD 정리

## 문서 목적
회사도우미의 도메인 언어, 바운디드 컨텍스트, 애그리거트 후보를 정리한다.

## 유비쿼터스 언어

| 용어 | 정의 | 비고 |
|---|---|---|
| 세션 | 사용자가 업무 기록과 AI 처리를 수행하는 기본 공간 | 개인/공유 |
| 공유 세션 | 여러 사용자가 함께 접근하는 세션 | 초대 필요 |
| 산출물 | AI 또는 사용자가 만든 회의록, 보고서, 리뷰 결과 등 | |
| 데드라인 | 일정 또는 마감 정보 | AI 추출 가능 |
| 스테퍼 | 산출물 진행 단계를 표현하는 UI/상태 모델 | |

## 바운디드 컨텍스트 후보

| 컨텍스트 | 책임 | 주요 모델 |
|---|---|---|
| Identity | 로그인, 사용자 식별 | User |
| Session | 개인/공유 세션 관리 | Session, SessionMember, SessionContent |
| AI Assistance | 요약, 추출, 리뷰, 리서치 | AiJob, AiResult |
| Deadline | 마감일과 캘린더 | Deadline |
| Reporting | 주간 보고 | WeeklyReport |
| Review | 코드 리뷰 | CodeReviewRequest |

## 애그리거트 후보

| 애그리거트 | 루트 | 포함 모델 | 비고 |
|---|---|---|---|
| 세션 | Session | SessionContent, SessionMember | 공유 정책 중요 |
| 데드라인 | Deadline | DeadlineStep | 스테퍼 확장 가능 |
| 주간 보고 | WeeklyReport | ReportSource | |

