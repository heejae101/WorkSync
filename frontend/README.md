# 회사도우미 Frontend

회사도우미 프런트엔드 작업 공간이다. 기존 프로토타입을 유지하면서 실제 React 기반 프런트엔드 개발을 시작하기 위한 기본 스택과 실행 방법을 정리한다.

## 기술 스택

| 구분 | 패키지 | 버전 |
|---|---|---|
| UI 프레임워크 | React / React DOM | 19.1.0 |
| 타입 시스템 | TypeScript | 5.8.3 |
| 빌드 도구 | Vite | 7.0.4 |
| 라우팅 | React Router | 7.7.0 |
| 스타일링 | TailwindCSS | 4.1.11 |
| Tailwind Vite 연동 | @tailwindcss/vite | 4.1.11 |
| 애니메이션 | Framer Motion | 12.23.9 |
| 아이콘 | Lucide React | 0.533.0 |
| 클라이언트 상태 | Zustand | 5.0.8 |
| 서버 상태 | TanStack Query | 5.85.9 |
| HTTP 클라이언트 | Axios | 1.11.0 |
| 다국어 | i18next | 25.5.3 |

기존 화면 효과에서 쓰던 `gsap`, `motion` 패키지는 현재 프로토타입 호환을 위해 유지한다.

## 실행 방법

```bash
npm install
npm run dev
```

기본 개발 서버는 `http://127.0.0.1:5173/`에서 열린다.

## 검증 명령

```bash
npm run check
npm run build
```

- `npm run check`: 프로젝트 전용 구현 체크리스트와 TypeScript 타입 검사를 함께 실행한다.
- `npm run build`: Vite 프로덕션 빌드를 실행한다.

## 주요 설정 파일

| 파일 | 역할 |
|---|---|
| `vite.config.ts` | React 플러그인과 TailwindCSS Vite 플러그인 설정 |
| `tsconfig.json` | TypeScript 검사 기준 설정 |
| `src/styles/app.css` | TailwindCSS import와 기존 전역 스타일 |
| `scripts/check.mjs` | 요구사항 토큰과 프로토타입 회귀 방지 체크 |

## 작업 컨벤션

- 문서와 설계는 상위 `docs/` 기준을 먼저 확인한다.
- 기능 구현 전에 관련 요구사항 ID와 화면/API/DB 설계를 맞춘다.
- 화면 변경은 `npm run check`, `npm run build`로 최소 검증한다.
- 새로운 기능 코드는 TypeScript 전환을 기본 방향으로 두되, 기존 `.jsx` 프로토타입은 한 번에 대량 변환하지 않는다.
- 인증 정보, API Key, 사용자 데이터는 저장소에 올리지 않는다.

## 현재 상태

- Vite, React, TailwindCSS, TypeScript 기반 설정은 준비되어 있다.
- 기존 화면은 `src/main.jsx` 중심의 프로토타입 구조다.
- 다음 단계는 라우팅, API 클라이언트, 서버 상태 관리, 다국어 초기화 파일을 실제 화면 단위로 분리하는 것이다.
