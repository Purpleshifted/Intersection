# 빠른 시작 가이드

## 로컬 개발 환경

### 1. 의존성 설치

```bash
yarn install
```

### 2. 서버 실행

세 개의 터미널이 필요합니다:

**터미널 1: Next.js 프론트엔드**
```bash
yarn dev
```

**터미널 2: 실시간 서버**
```bash
cd realtime
yarn dev
```

**터미널 3: NoiseCraft 서버**
```bash
cd noisecraft
yarn start
```

### 3. 브라우저 접속

- 웹 애플리케이션: http://localhost:3000
- NoiseCraft 서버: http://localhost:4000

## 프로덕션 빌드

```bash
# 전체 빌드
yarn prod:build

# 실행
yarn prod:start
```

## 문제 해결

### 포트 충돌
- Next.js: 기본 포트 3000
- 실시간 서버: 기본 포트 3001
- NoiseCraft: 기본 포트 4000

포트가 사용 중이면 환경 변수로 변경할 수 있습니다.

### WebSocket 연결 실패
- 실시간 서버가 실행 중인지 확인하세요.
- 브라우저 콘솔에서 에러 메시지를 확인하세요.

