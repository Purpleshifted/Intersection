# Frontend Source

Next.js 기반 프론트엔드 애플리케이션입니다.

## 구조

- `app/`: Next.js App Router 페이지
  - `page.tsx`: 시작 화면
  - `global/`: 글로벌 뷰 페이지
  - `mobile/`: 모바일/개인 뷰 페이지
- `components/`: React 컴포넌트
  - `intro/`: 시작 화면 컴포넌트
  - `global/`: 글로벌 뷰 컴포넌트
  - `mobile/`: 모바일 뷰 컴포넌트
  - `shared/`: 공유 컴포넌트
- `lib/`: 유틸리티 및 로직
  - `audio/`: 오디오 처리 로직
  - `game/`: 게임 로직
  - `socket/`: Socket.IO 클라이언트
- `context/`: React Context
  - `GameContext.tsx`: 게임 상태 관리
- `types/`: TypeScript 타입 정의

## 개발

```bash
yarn dev
```

## 빌드

```bash
yarn build
yarn start
```

## 환경 변수

- `NEXT_PUBLIC_WS_URL`: 실시간 서버 WebSocket URL
- `NEXT_PUBLIC_NOISECRAFT_WS_URL`: NoiseCraft 서버 URL
- `NEXT_PUBLIC_NOISECRAFT_PATCH_SRC`: 기본 오디오 패치 파일 경로
- `NEXT_PUBLIC_NOISECRAFT_PERSONAL_PATCH_SRC`: 개인 뷰용 오디오 패치 파일 경로

