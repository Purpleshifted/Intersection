# Intersection - Harmonic Composition Space

실시간 멀티플레이어 음악 합성 게임입니다. 플레이어들이 3D 공간에서 움직이며 서로 만나고, 화성학적 호환성에 따라 음악이 생성됩니다.

## 프로젝트 개요

이 프로젝트는 Next.js 기반의 웹 애플리케이션으로, 다음과 같은 특징을 가집니다:

- **실시간 멀티플레이어**: Socket.IO를 통한 실시간 플레이어 상호작용
- **화성학 기반 음악 생성**: Tonal.js를 활용한 화성 진행 및 호환성 계산
- **3D 공간 시각화**: Three.js를 활용한 3D 공간 렌더링
- **음악 합성**: NoiseCraft를 통한 실시간 오디오 생성

## 기술 스택

- **Frontend**: Next.js 16, React 19, Three.js, Tailwind CSS
- **Backend**: Node.js, Socket.IO, TypeScript
- **Audio**: NoiseCraft (Web Audio API)
- **Music Theory**: Tonal.js

## 프로젝트 구조

```
intersection-submission/
├── src/                    # Next.js 프론트엔드
│   ├── app/               # App Router 페이지
│   ├── components/        # React 컴포넌트
│   ├── lib/               # 유틸리티 및 로직
│   └── types/             # TypeScript 타입 정의
├── realtime/              # Socket.IO 실시간 서버
│   └── src/               # 서버 소스 코드
├── noisecraft/            # NoiseCraft 오디오 서버
│   ├── public/            # NoiseCraft 정적 파일
│   └── examples/          # 오디오 프로젝트 파일
└── public/                # 정적 리소스
```

## 설치 및 실행

### 사전 요구사항

- Node.js 18 이상
- Yarn 또는 npm

### 로컬 개발 환경 설정

1. 의존성 설치:
```bash
yarn install
```

2. 개발 서버 실행:
```bash
# Next.js 개발 서버 (터미널 1)
yarn dev

# 실시간 서버 (터미널 2)
cd realtime && yarn dev

# NoiseCraft 서버 (터미널 3)
cd noisecraft && yarn start
```

3. 브라우저에서 접속:
- 웹 애플리케이션: http://localhost:3000
- NoiseCraft 서버: http://localhost:4000

## 게임 플레이

1. **시작 화면**: 이름과 난이도(Easy/Medium/Hard)를 선택합니다.
2. **개인 뷰**: 자신의 파티클을 조작하여 공간을 탐색합니다.
3. **글로벌 뷰**: 전체 공간과 모든 플레이어를 관찰합니다.
4. **화성 상호작용**: 다른 플레이어와 만나면 화성학적 호환성에 따라 음악이 생성됩니다.

## 주요 기능

- **난이도 시스템**: 플레이어의 난이도에 따라 배정되는 음이 달라집니다.
- **화성 호환성**: 두 플레이어의 음이 화성학적으로 호환될 때 더 강한 중력이 작용합니다.
- **실시간 오디오**: 플레이어의 움직임과 상호작용에 따라 실시간으로 음악이 생성됩니다.

## 배포

### Vercel 배포 (권장)

1. GitHub에 프로젝트를 푸시합니다.
2. [Vercel](https://vercel.com)에 로그인하고 새 프로젝트를 생성합니다.
3. GitHub 저장소를 연결합니다.
4. 환경 변수 설정:
   - `NEXT_PUBLIC_WS_URL`: WebSocket 서버 URL (예: `wss://your-realtime-server.com/socket`)
5. 배포를 시작합니다.

**참고**: Vercel은 정적 사이트와 서버리스 함수만 지원하므로, 실시간 서버(`realtime`)와 NoiseCraft 서버는 별도로 배포해야 합니다.

### 실시간 서버 배포 (Render/Railway)

1. [Render](https://render.com) 또는 [Railway](https://railway.app)에 계정을 생성합니다.
2. 새 Web Service를 생성합니다.
3. GitHub 저장소를 연결하고 `realtime` 폴더를 루트로 설정합니다.
4. 빌드 명령: `yarn build`
5. 시작 명령: `yarn start`
6. 포트: `3001` (환경 변수로 설정)

### NoiseCraft 서버 배포

NoiseCraft 서버도 동일한 방식으로 Render/Railway에 배포할 수 있습니다.

## 환경 변수

### 프론트엔드 (.env.local)

```env
NEXT_PUBLIC_WS_URL=http://localhost:3001/socket
NEXT_PUBLIC_NOISECRAFT_WS_URL=http://localhost:4000
```

### 실시간 서버

```env
PORT=3001
HOST=0.0.0.0
```

## 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.

## 제작자

수업 프로젝트 - Harmonic Composition Space

