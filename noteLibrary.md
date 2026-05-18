“실시간 협업 메모 페이지”를 만들려면 보통은 에디터 라이브러리를 사용



* 글자 스타일 (bold, heading 등)
* &#x20;이미지 / 코드블럭 / 체크리스트
* 드래그 블록 이동
* slash command (/image, /todo)
* 실시간 협업
* 자동 저장
* 커서 공유
* markdown 지원



# Tiptap + Yjs

요즘 노션류 만들 때 제일 많이 쓰는 조합 중 하나.



장점

* React와 궁합 좋음
* 확장성 매우 좋음
* 노션 같은 블록 구조 가능
* 실시간 협업 가능
* slash command 가능
* 커스텀 자유도 높음



단점

* 초반 세팅 난이도 있음
* 완전 초보에겐 약간 어려움



npm install @tiptap/react @tiptap/starter-kit

npm install yjs y-websocket



# BlockNote

진짜 노션 스타일 블록 에디터 느낌.



* 노션 UI 느낌 강함
* 블록 기반
* React 친화적
* 구현 속도 빠름



장점

* 노션 UI 느낌 강함
* 블록 기반
* React 친화적
* 구현 속도 빠름



단점

* 커스텀 자유도는 Tiptap보다 조금 낮음



# React Quill

간단한 메모 에디터 만들 때 쉬움.



장점

* 빠르게 구현 가능
* 설정 간단



단점

* 노션 같은 블록 구조 어려움
* 협업 기능 약함



# 협업 기능 핵심 라이브러리

# Yjs

실시간 동기화 핵심.



역할

* 여러 사람이 동시에 수정
* 충돌 해결
* 커서 공유
* 오프라인 병합



## 상태관리

Zustand

Redux

→ 메모 상태 관리



## 실시간 통신

Socket.IO

→ 접속자/커서/알림 등

## 

## Markdown 지원

remark

react-markdown



## 드래그 앤 드롭

dnd-kit

→ 블록 순서 이동







