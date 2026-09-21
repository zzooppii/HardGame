# 🎲 Euro Masterpieces (명작 유로 보드게임 웹 플랫폼)

> **보드게임 긱(BGG) 역사상 가장 위대한 6대 전략 보드게임을 웹 브라우저에서 직접 즐길 수 있는 모듈식 온라인 보드게임 플랫폼입니다.**

---

## 🌟 프로젝트 개요

`Euro Masterpieces`는 정교한 경제 엔진과 치밀한 수싸움으로 전 세계 보드게이머들의 사랑을 받는 6종의 명작 유로 게임을 한 플랫폼에서 선택하여 즐길 수 있도록 구축된 웹 애플리케이션입니다.

- **1인 솔로 모드 (스마트 AI 봇 대전)**
- **로컬 패스 앤 플레이 (한 기기에서 교대 플레이)**
- **온라인 실시간 멀티플레이 (WebRTC P2P 기반 방 개설 및 링크 초대)**
- **모바일 반응형 완벽 지원 (아이폰, 갤럭시 등 스마트폰 뷰포트 최적화)**

---

## 🛠️ 기술 스택

- **Frontend**: React 19, TypeScript, Vite
- **State Management**: Zustand
- **Networking (P2P)**: PeerJS (WebRTC DataChannel)
- **Styling**: Vanilla CSS Design System (다크 우드 & 앰버 골드 럭셔리 유로 테마)
- **Icons & FX**: Lucide React, Canvas Confetti

---

## 🚀 로컬 실행 방법

### 1. 저장소 클론 및 패키지 설치
```bash
git clone https://github.com/zzooppii/HardGame.git
cd HardGame
npm install
```

### 2. 로컬 개발 서버 실행
```bash
npm run dev
```
- 로컬 브라우저: `http://localhost:5173/`
- 동일 Wi-Fi(모바일/타 PC): 터미널에 표시되는 네트워크 IP (예: `http://192.168.0.x:5173/`)

### 3. 프로덕션 빌드
```bash
npm run build
```
