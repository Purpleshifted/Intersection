# Render 환경 변수 수정 가이드 (긴급)

## 문제
프론트엔드가 잘못된 서버 URL을 사용하고 있습니다:
- ❌ `intersection-realtime.onrender.com` (존재하지 않음)
- ❌ `intersection-noisecraft.onrender.com` (존재하지 않음)

## 해결 방법

### 1. Render 대시보드 접속
1. [Render 대시보드](https://dashboard.render.com)에 로그인
2. 프론트엔드 서비스 (`intersection-llj7` 또는 유사한 이름) 선택

### 2. 환경 변수 수정
**Environment** 탭으로 이동하여 다음 환경 변수를 **정확히** 설정:

```
NEXT_PUBLIC_WS_URL=wss://intersection-w4uh.onrender.com/socket
NEXT_PUBLIC_NOISECRAFT_WS_URL=https://intersection-1.onrender.com
```

**중요:**
- `wss://` (WebSocket Secure) 사용
- `/socket` 경로 포함
- `https://` (NoiseCraft는 HTTP)
- URL 끝에 슬래시(`/`) 없음

### 3. 재배포
환경 변수 변경 후 **반드시 재배포**해야 합니다:
1. "Manual Deploy" 드롭다운 클릭
2. "Deploy latest commit" 선택
3. 빌드 완료 대기 (약 3-5분)

### 4. 확인
재배포 후 브라우저에서:
1. 하드 리프레시 (Cmd+Shift+R 또는 Ctrl+Shift+R)
2. 개발자 도구 콘솔 확인
3. 다음 로그가 나타나야 함:
   - `[GameContext] Environment check:` - 올바른 URL 표시
   - `[NoiseCraft] Environment check:` - 올바른 URL 표시
   - `[Socket] Connected:` - 연결 성공

## 현재 배포된 서버 URL
- **Realtime**: `https://intersection-w4uh.onrender.com`
- **NoiseCraft**: `https://intersection-1.onrender.com`
- **Frontend**: `https://intersection-llj7.onrender.com`

