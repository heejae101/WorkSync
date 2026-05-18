##### 프론트

* React
* axios
* react-dropzone (파일 업로드 UI)



##### 백엔드

* Spring Boot
* MultipartFile 업로드



##### AI/STT

* Faster-Whisper



##### 요약

* 사용하는 ai에 따라 다른 API



#### 파일 업로드 라이브러리

# react-dropzone

파일 드래그 업로드용.



장점

* 구현 쉬움
* 드래그앤드롭 지원
* 확장 쉬움



설치

npm install react-dropzone



#### 음성 → 텍스트(STT)

# OpenAI Whisper API

정확도가 진짜 좋음.



장점

* 한국어 잘됨
* 구현 쉬움
* 회의록 특화 수준
* 화자 구분도 일부 가능



비용 없이 로컬 AI

# Faster-Whisper

Python 기반.



장점

* 무료
* 속도 빠름
* 로컬 가능

단점

* 서버 세팅 필요
* GPU 있으면 좋음



# 캘린더

# FullCalendar



가능 기능

* 월/주/일 보기
* 일정 드래그
* 일정 수정
* Google Calendar 느낌
* React 지원



설치

npm install @fullcalendar/react

npm install @fullcalendar/daygrid

npm install @fullcalendar/timegrid

npm install @fullcalendar/interaction



# AI 일정 추출

AI API 정해야함



# 날짜 분석 라이브러리

# dayjs



설치

npm install dayjs



# 알림기능

# Spring Boot @Scheduled



매일 오전 9시 실행

↓

DB에서 마감일 조회

↓

오늘 기준 +7일 일정 찾기

↓

알림 발송



# 이메일 알림

##### implementation 'org.springframework.boot:spring-boot-starter-mail'

메일 발송



# 브라우저 푸시 알림

# Firebase Cloud Messaging(FCM)



# 파이썬

### API 서버

# pip install fastapi uvicorn

* React/Spring에서 Python AI 서버로 요청 보내기 좋음
* STT, 요약, 일정 추출 같은 AI 작업 분리 가능



# 스케줄러

# pip install apscheduler

* “매일 오전 9시에 마감 7일 전 일정 확인”
* Spring의 @Scheduled와 비슷한 역할



# STT

# pip install faster-whisper

* 로컬에서 음성 → 텍스트 변환 가능
* Whisper API 대신 사용 가능



# AI 요약 / 일정 추출

# pip install openai

* STT 결과 요약
* 마감일, 일정 JSON 추출



