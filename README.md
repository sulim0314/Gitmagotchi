
# Git Commit으로 캐릭터 키우기 프로젝트 'Gitmagotchi'
## AWS 서버리스 아키텍처 기반 GEN-AI Web APP
![gitmagotchi](./assets/gitmagotchi1.png)

# 목차

### [**1. 서비스 개요**](#📌-서비스-개요)

### [**2. 기획 배경**](#☁-기획-배경)

### [**3. 서비스 기능 소개**](#🏛-서비스-기능-소개)

### [**4. 팀 구성**](#👨🏻‍💻-팀-구성)

### [**5. 기술 스택**](#🛠️-기술-스택)

### [**6. 아키텍처**](#🎨-아키텍처)

### [**7. 주요기능**](#💡-주요기능)

### [**8. 시연영상**](#🎬-시연-영상)

### [**9. UCC**](#ucc)

### [**프로젝트 산출물**](#📄-프로젝트-산출물)

# 📌 서비스 개요

- 개발 기간 : 2024.04.08 ~ 2024.05.20 (6주)
- 개요 : 개발자들의 깃 커밋을 독려하기 위한 프로젝트
- 타겟 : 개발자

# ☁ 기획 배경

- 매일 깃허브에 커밋을 하고자 하는 개발자를 독려하기 위함

# 🏛 서비스 기능 소개

- Github 소셜로그인
- 캐릭터 얼굴 이미지 AI 생성
- 배경화면 이미지 AI 생성
- 캐릭터 레벨 별 모션 생성
- 캐릭터 키우기 (밥먹기, 산책, 샤워하기, 채팅하기, 미니게임)
- 캐릭터 스탯으로 경험치 상승량 증가
- Github 커밋 기반 밥 짓기
- 통합 검색 (캐릭터, 사용자)
- 캐릭터 명예의 전당
- 나의 캐릭터 도감 (키운 캐릭터, 독립, 사망)
- 사용자 랭킹 (Best, Worst)


# 👨🏻‍💻팀 구성

| [송윤재](https://github.com/Song-YoonJae)                                                       | [고수림](https://github.com/sulim0314)                                                      | [권송아](https://github.com/songahh)                                                     | [김희연](https://github.com/heeyeon3050)                                                   | [이유로](https://github.com/rheeeuro)                                                     |                                                  
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | 
| <img src="https://avatars.githubusercontent.com/u/76997543?v=4" width="150" height="150"> | <img src="https://avatars.githubusercontent.com/u/125880884?v=4" width="150" height="150"> | <img src="https://avatars.githubusercontent.com/u/77879519?v=4" width="150" height="150"> | <img src="https://avatars.githubusercontent.com/u/111184269?v=4" width="150" height="150"> | <img src="https://avatars.githubusercontent.com/u/47638660?v=4" width="150" height="150"> | 
| 팀장, 백엔드                                                                               | 백엔드, 서기                                                                                    | 백엔드, AI                                                                             | 백엔드, PM                                                                                | 프론트엔드                                                                                                                                                                        |
| 캐릭터 이미지 생성<br/>배경화면 생성<br/>경험치 로직 구현<br/>정보 수정<br/>                            | aws-amplify & <br/>Cognito 사용자 인증<br/>Github커밋 기반 밥 짓기      | 레벨별 모션 생성<br/>스탯 로직 구현                                       | 캐릭터 이미지 생성<br/>채팅, 감정분석<br/>캐릭터 도감, 명예의 전당<br/>랭킹, 검색                                    | 전체 프론트엔드<br/>aws-amplify 로그인<br/>api 캐싱/로딩 관리<br/>애니메이션 관리<br/>cloudfront,s3자동 배포    |  

<br/>

# 🛠️ 기술 스택

**Front**
<br/>
<img src="https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=black" width="auto" height="25">
<img src="https://img.shields.io/badge/reactnative-00a4d3?style=for-the-badge&logo=react&logoColor=black" width="auto" height="25">
<img src="https://img.shields.io/badge/reactquery-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" width="auto" height="25">
<img src="https://img.shields.io/badge/recoil-3578E5?style=for-the-badge&logo=recoil&logoColor=white" width="auto" height="25">
<img src="https://img.shields.io/badge/tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" width="auto" height="25">

**Back**
<br/>
<img src="https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=AmazonAWS&logoColor=white"/>
<br/>


**Cooperation**
<br/>
<img src="https://img.shields.io/badge/gitlab-FC6D26?style=for-the-badge&logo=gitlab&logoColor=white" width="auto" height="25">
<img src="https://img.shields.io/badge/jira-0052CC?style=for-the-badge&logo=jira&logoColor=white" width="auto" height="25">
<img src="https://img.shields.io/badge/notion-000000?style=for-the-badge&logo=notion&logoColor=white" width="auto" height="25">

<br/>

# 🎨 아키텍처
![아키텍처](./assets/aws.png)

<br/>

# 💡 주요기능

### 1. 사용자 인증
![사용자인증](./assets/login.gif)

### 2. 커밋 기반 밥 짓기
![커밋기반밥짓기](./assets/prepare-meal.gif)

### 3. 캐릭터 얼굴 AI 생성
![캐릭터얼굴](./assets/create_character.gif)

### 4. 배경화면 AI 생성
![배경화면](./assets/background.gif)

### 5. 채팅 및 감정분석
![채팅](./assets/chat_comprehend.gif)

### 6. 캐릭터 모션
![캐릭터모션](./assets/motions.gif)

### 7. 캐릭터 도감
![캐릭터도감](./assets/dogam.gif)

### 8. 캐릭터 경험치
![캐릭터경험치](./assets/exp.gif)

### 9. 캐릭터 스탯
![캐릭터스탯](./assets/stat.gif)

### 10. 명예의 전당 오르기
![명예의전당오르기](./assets/tofame.gif)

### 11. 명예의 전당
![명예의전당](./assets/fame.gif)

### 12. 사용자 랭킹
![사용자랭킹](./assets/ranking.gif)

### 13. 통합검색
![통합검색](./assets/search.gif)


<br/>

# 🎬 UCC
https://www.youtube.com/watch?v=w9rcBkjkh_k

<br/>

# 📄 프로젝트 산출물

### [1. 요구사항 명세서](https://chocolate-mint-5ac.notion.site/2f50c6e01a2f4712a7bdd678e81c9b08?pvs=4)

![Required](./assets/기능.png)

### [2. ERD]

![ERD](./assets/erd.png)

### [3. API 명세서](https://chocolate-mint-5ac.notion.site/API-2e3285f3edd247fbae97d6e0d96f6108?pvs=4)

![API](./assets/api.png)
<br/>

# 참고

### 노션
https://chocolate-mint-5ac.notion.site/e907d66188dc4f538f8a2c04d010f0db?pvs=4
