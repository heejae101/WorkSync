# AI

AI 처리 서버 또는 작업 코드를 보관한다.

## 책임

- STT 처리
- 공통 음성 입력 파이프라인
- 회의록 요약
- 시간 기록 가중치 제안
- 데드라인 추출
- 주간 보고 초안 생성
- AI 코드 리뷰
- 기술 리서치 요약

## 설계 메모

- 초기에는 Python AI Worker를 두고, 내부에서 provider adapter를 선택한다.
- Spring Backend는 AI 작업을 요청하고 결과 상태를 조회한다.
- AI 실패, 재시도, 작업 상태를 DB에 남길지 결정해야 한다.
- 회의록과 시간 기록은 음성 업로드/STT까지 같은 파이프라인을 사용한다.
- 터미널 세션 브리지는 개발 실험용 후보로만 둔다.
- OAuth는 GitHub/Notion/Google 같은 외부 자료 접근이 필요할 때 검토한다.
- 로컬 모델은 보안이 중요한 데이터 처리 후보로 둔다.

## Provider Adapter 후보

| Adapter | 용도 | 운영 판단 |
|---|---|---|
| `external_api` | 외부 AI/STT API 호출 | 품질 우선 후보 |
| `local_model` | Ollama/로컬 STT/로컬 LLM 호출 | 보안/비용 검증 후보 |
| `terminal_bridge` | 켜놓은 터미널 AI 세션에 입력 후 출력 파싱 | 개발 실험용, 운영 제외 |
