# Realtime Server

Socket.IO 기반 실시간 멀티플레이어 게임 서버입니다.

## 기능

- 실시간 플레이어 위치 동기화
- 화성학 기반 중력 시스템
- 클러스터 감지 및 오디오 신호 생성
- 봇 시스템 (선택적)

## 개발

```bash
yarn install
yarn dev
```

## 빌드

```bash
yarn build
yarn start
```

## 환경 변수

- `PORT`: 서버 포트 (기본값: 3001)
- `HOST`: 바인딩 주소 (기본값: 0.0.0.0)
- `NODE_ENV`: 환경 모드 (development/production)
- `SOCKET_PATH`: Socket.IO 경로 (기본값: /socket)
- `BOT_COUNT`: 봇 개수 (기본값: 0)

## 배포

Render에서 배포 시 `render.yaml` 파일을 사용하거나 수동으로 설정:

- Root Directory: `realtime`
- Build Command: `yarn install && yarn build`
- Start Command: `yarn start`

