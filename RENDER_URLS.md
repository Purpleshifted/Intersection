# Render 서버 URL 확인

## 실제 배포된 서버들

1. **프론트엔드**: `https://intersection-llj7.onrender.com`
   - Next.js 앱
   - 환경 변수 설정 필요

2. **Realtime 서버**: `https://intersection-w4uh.onrender.com`
   - Socket.IO 서버
   - WebSocket 엔드포인트: `wss://intersection-w4uh.onrender.com/socket`

3. **NoiseCraft 서버**: `https://intersection-1.onrender.com`
   - 오디오 서버
   - HTTP 엔드포인트: `https://intersection-1.onrender.com`

## 환경 변수 설정 (프론트엔드)

Render 대시보드 → 프론트엔드 서비스 → Environment 탭에서 설정:

```
NEXT_PUBLIC_WS_URL=wss://intersection-w4uh.onrender.com/socket
NEXT_PUBLIC_NOISECRAFT_WS_URL=https://intersection-1.onrender.com
```

설정 후 **재배포** 필요!

