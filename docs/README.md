# 회사도우미 Docs

## 목적
회사도우미 프로젝트의 분석, 설계, 개발, 품질 활동 산출물을 단계별로 관리한다.

초기 정리 문서:
- `회사도우미_프로젝트_정리.md`

## 전체 폴더 구조

```text
회사도우미/
└── docs/
    ├── 00_project_management/    # 일정, 회의록, 의사결정, 작업 로그
    ├── 01_analysis/              # 분석 단계 산출물
    │   ├── 01_current_system_analysis/
    │   ├── 02_process_hierarchy/
    │   ├── 03_screen_standard/
    │   └── 04_requirements/
    ├── 02_design/                # 설계 단계 산출물
    │   ├── 01_data_design/
    │   ├── 02_architecture_design/
    │   ├── 03_interface_design/
    │   ├── 04_screen_design/
    │   └── 05_test_design/
    ├── 03_development/           # 실제 구현 영역
    │   ├── 01_backend/
    │   ├── 02_frontend/
    │   ├── 03_ai/
    │   └── 04_database/
    ├── 04_quality/               # TDD, DDD, 테스트 결과
    │   ├── 01_tdd/
    │   ├── 02_ddd/
    │   └── 03_test_results/
    ├── 05_operations/            # 배포, 운영, 장애, 환경 설정
    ├── 06_study/                 # 팀 공유용 학습 자료
    └── 99_references/            # 참고 서비스, 논문, 기술 조사 자료
```

## 진행 순서

1. 분석 단계
   - 현행 시스템 분석
   - 프로세스 계층도
   - 화면 표준 정의서
   - 요구사항 정의서
2. 설계 단계
   - 데이터 설계: ERD, 엔터티 정의서, 컬럼 정의서
   - 아키텍처 설계: 인프라 구성도, 시스템 흐름도
   - 인터페이스 설계서
   - 화면 설계서: 메뉴 구조도 포함
   - 테스트 설계서
3. 개발 단계
   - Backend, Frontend, AI, Database 구현
   - TDD 기반 테스트 작성
   - DDD 기반 도메인 모델 정리
4. 품질/운영 단계
   - 테스트 결과 관리
   - 배포/운영 절차 정리
   - 장애 및 트러블슈팅 기록
5. 팀 학습
   - Spring, React, MyBatis, PostgreSQL
   - AI, LangGraph, Ollama, MCP, Agent, Skills, Sub Agent
   - DDD, TDD, GitHub 협업 규칙

## 작성 규칙

- 문서명은 가능하면 `NN_문서명.md` 형식을 사용한다.
- 분석/설계 문서는 결정된 내용과 미결정 내용을 분리해서 쓴다.
- 기능 요구사항은 화면, API, DB, 테스트와 추적 가능해야 한다.
- 설계 변경이 발생하면 관련 문서의 `변경 이력`을 갱신한다.
- 기술 선택 이유와 트러블슈팅은 반드시 문서로 남긴다.

## 팀 규칙 문서

- `00_project_management/01_team_rules.md`
- `00_project_management/02_git_branch_strategy.md`
- `00_project_management/03_code_convention.md`
- `00_project_management/04_document_rule.md`
