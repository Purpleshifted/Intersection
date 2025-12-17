# 환경 변수 설정 가이드

## ⚠️ 중요: Render 프론트엔드 환경 변수 설정

프론트엔드 서비스(`intersection-llj7`)의 환경 변수가 설정되지 않아 WebSocket 연결이 실패하고 있습니다.

## 설정 방법

1. **Render 대시보드 접속**
   - https://dashboard.render.com
   - `intersection-llj7` 서비스 선택

2. **Environment 탭 클릭**

3. **다음 환경 변수 추가/수정:**

```
NEXT_PUBLIC_WS_URL=wss://intersection-w4uh.onrender.com/socket
NEXT_PUBLIC_NOISECRAFT_WS_URL=https://intersection-1.onrender.com
```

4. **"Save Changes" 클릭**

5. **재배포 필수!**
   - "Manual Deploy" → "Deploy latest commit" 클릭
   - 또는 자동 배포가 트리거될 때까지 대기

## 현재 서버 URL

- **프론트엔드**: `https://intersection-llj7.onrender.com`
- **Realtime 서버**: `https://intersection-w4uh.onrender.com`
- **NoiseCraft 서버**: `https://intersection-1.onrender.com`

## 확인 방법

배포 후 브라우저 콘솔에서 다음을 확인:
- `[Socket] Connecting to:` 로그에 올바른 URL이 표시되어야 함
- `wss://intersection-w4uh.onrender.com/socket` (올바름)
- `wss://intersection-realtime.onrender.com/socket` (잘못됨 - 환경 변수 미설정)

## 문제 해결

환경 변수를 설정했는데도 여전히 잘못된 URL로 연결된다면:
1. 재배포가 완료되었는지 확인
2. 브라우저 캐시 클리어 (Ctrl+Shift+R 또는 Cmd+Shift+R)
3. Render 로그에서 빌드 시 환경 변수가 제대로 주입되었는지 확인

