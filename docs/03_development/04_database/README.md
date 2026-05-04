# Database

PostgreSQL 관련 스키마, migration, seed 데이터를 보관한다.

## 포함 항목

- DDL
- migration script
- seed data
- test fixture
- MyBatis SQL 검증용 쿼리

## 작성 규칙

- 스키마 변경은 설계 문서의 엔터티/컬럼 정의와 함께 갱신한다.
- 컬럼 추가 시 기본값, nullable 여부, 인덱스 필요 여부를 함께 검토한다.

