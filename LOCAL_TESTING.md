# 로컬 테스트 가이드

## 환경 변수 설정

1. **`.env.local` 파일 생성** (이미 생성됨)
   ```bash
   # 프로젝트 루트에 .env.local 파일이 있습니다
   ```

2. **환경 변수 확인**
   - `NEXT_PUBLIC_WS_URL=http://localhost:3001/socket`
   - `NEXT_PUBLIC_NOISECRAFT_WS_URL=http://localhost:4000`

## 로컬 서버 실행

### 1. 실시간 서버 (터미널 1)
```bash
cd realtime
yarn install
yarn dev
```
- 포트: 3001
- 확인: http://localhost:3001 에서 "ok" 메시지 확인

### 2. NoiseCraft 서버 (터미널 2)
```bash
cd noisecraft
yarn install
yarn start
```
- 포트: 4000
- 확인: http://localhost:4000 에서 NoiseCraft UI 확인

### 3. Next.js 프론트엔드 (터미널 3)
```bash
# 프로젝트 루트에서
yarn install
yarn dev
```
- 포트: 3000
- 확인: http://localhost:3000

## 테스트 시나리오

### 1. WebSocket 연결 테스트
1. 브라우저에서 http://localhost:3000 접속
2. 개발자 도구 콘솔 열기 (F12)
3. 다음 로그 확인:
   - `[GameContext] Environment check:` - 환경 변수 값 확인
   - `[Socket] Connecting to:` - 연결 시도 URL 확인
   - `[Socket] Connected:` - 연결 성공 확인

### 2. 파티클 렌더링 테스트
1. http://localhost:3000 접속
2. "play" 버튼 클릭
3. 이름 입력 및 난이도 선택
4. 게임 화면에서 파티클이 보이는지 확인

### 3. 오디오 테스트
1. 게임 화면에서 "Start Audio" 버튼 클릭
2. 콘솔에서 다음 로그 확인:
   - `[Mobile] NoiseCraft config:` - NoiseCraft 설정 확인
   - `[Mobile] Message from iframe:` - iframe 메시지 확인
   - `[Mobile] Project loaded` - 프로젝트 로드 확인

## 문제 해결

### WebSocket 연결 실패
- 실시간 서버가 실행 중인지 확인 (포트 3001)
- 콘솔에서 `[Socket] Connecting to:` 로그 확인
- `http://localhost:3001/socket`로 연결 시도하는지 확인

### 파티클이 안 보임
- 콘솔에서 `[Renderer] Not rendering` 로그 확인
- `selfId`가 설정되었는지 확인
- `shouldRender` 조건이 true인지 확인

### 오디오가 안 나옴
- NoiseCraft 서버가 실행 중인지 확인 (포트 4000)
- `[Mobile] NoiseCraft config:` 로그에서 URL 확인
- iframe이 로드되었는지 확인

## 환경 변수 디버깅

브라우저 콘솔에서 다음을 확인:
```javascript
// 환경 변수 확인 (빌드 시점에 주입됨)
console.log('NEXT_PUBLIC_WS_URL:', process.env.NEXT_PUBLIC_WS_URL);
console.log('NEXT_PUBLIC_NOISECRAFT_WS_URL:', process.env.NEXT_PUBLIC_NOISECRAFT_WS_URL);
```

**주의**: Next.js는 빌드 시점에 `NEXT_PUBLIC_*` 환경 변수를 번들에 포함시킵니다.
- 개발 모드(`yarn dev`)에서는 `.env.local` 파일을 자동으로 읽습니다
- 환경 변수를 변경한 후에는 개발 서버를 재시작해야 합니다

