# Intersection - Harmonic Composition Space

**실시간 멀티플레이어 음악 합성 게임**

플레이어들이 3D 공간에서 움직이며 서로 만나고, 화성학적 호환성에 따라 음악이 생성되는 인터랙티브 웹 애플리케이션입니다.

## 🎯 프로젝트 목표

이 프로젝트는 **화성학과 게임플레이를 결합**하여 새로운 형태의 음악 경험을 제공합니다:

- **공간적 상호작용**: 플레이어들이 3D 공간에서 움직이며 서로 만남
- **화성학 기반 음악 생성**: 플레이어 간의 화성 호환성에 따라 실시간으로 음악이 생성됨
- **난이도 시스템**: 플레이어의 난이도(Easy/Medium/Hard)에 따라 배정되는 음이 달라짐
- **실시간 멀티플레이어**: Socket.IO를 통한 실시간 동기화

## ✨ 주요 기능

### 게임플레이
- **개인 뷰**: 자신의 파티클을 조작하여 공간을 탐색
- **글로벌 뷰**: 전체 공간과 모든 플레이어를 관찰
- **화성 상호작용**: 다른 플레이어와 만나면 화성학적 호환성에 따라 음악 생성
- **중력 시스템**: 화성 호환성이 높을수록 더 강한 중력이 작용하여 플레이어들이 자연스럽게 모임

### 기술적 특징
- **실시간 멀티플레이어**: Socket.IO 기반 실시간 동기화
- **화성학 계산**: Tonal.js를 활용한 화성 진행 및 호환성 계산
- **3D 시각화**: Three.js를 활용한 3D 공간 렌더링
- **실시간 오디오**: NoiseCraft를 통한 Web Audio API 기반 오디오 생성

## 🏗️ 아키텍처

이 프로젝트는 **3개의 독립적인 서비스**로 구성됩니다:

1. **Next.js 프론트엔드** (포트 3000)
   - 사용자 인터페이스
   - 3D 렌더링 및 게임 로직
   - 오디오 클라이언트

2. **실시간 서버** (포트 3001)
   - Socket.IO 기반 실시간 통신
   - 플레이어 위치 동기화
   - 화성학 계산 및 클러스터 감지

3. **NoiseCraft 오디오 서버** (포트 4000)
   - Web Audio API 기반 오디오 합성
   - 프로젝트 파일 저장/로드
   - 실시간 오디오 스트리밍

## 🚀 빠른 시작

### 사전 요구사항

- Node.js 18 이상
- Yarn 또는 npm

### 로컬 개발

1. **의존성 설치**
   ```bash
   yarn install
   ```

2. **서버 실행** (3개의 터미널 필요)

   터미널 1: Next.js 프론트엔드
   ```bash
   yarn dev
   ```

   터미널 2: 실시간 서버
   ```bash
   cd realtime && yarn dev
   ```

   터미널 3: NoiseCraft 서버
   ```bash
   cd noisecraft && yarn start
   ```

3. **브라우저에서 접속**
   - 웹 애플리케이션: http://localhost:3000
   - NoiseCraft 서버: http://localhost:4000

## 📦 프로젝트 구조

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
├── public/                # 정적 리소스
└── DEPLOYMENT.md          # 배포 가이드
```

각 폴더의 상세 정보는 해당 폴더의 `README.md`를 참고하세요.

## 🛠️ 기술 스택

- **Frontend**: Next.js 16, React 19, Three.js, Tailwind CSS
- **Backend**: Node.js, Socket.IO, TypeScript
- **Audio**: NoiseCraft (Web Audio API)
- **Music Theory**: Tonal.js

## 📚 문서

- [배포 가이드](./DEPLOYMENT.md) - 프로덕션 배포 방법
- [프론트엔드 문서](./src/README.md) - 프론트엔드 구조 및 개발 가이드
- [실시간 서버 문서](./realtime/README.md) - 실시간 서버 설정 및 개발
- [NoiseCraft 서버 문서](./noisecraft/README.md) - 오디오 서버 설정 및 개발

## 🎮 게임 플레이

1. **시작 화면**: 이름과 난이도(Easy/Medium/Hard)를 선택합니다.
2. **개인 뷰**: 자신의 파티클을 조작하여 공간을 탐색합니다.
3. **글로벌 뷰**: 전체 공간과 모든 플레이어를 관찰합니다.
4. **화성 상호작용**: 다른 플레이어와 만나면 화성학적 호환성에 따라 음악이 생성됩니다.

## 📝 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.
