# 지금 바로 배포하기 🚀

## 빠른 배포 가이드 (10분 안에 완료)

### 1단계: Vercel에 프론트엔드 배포 (5분)

1. **Vercel 접속 및 로그인**
   - https://vercel.com 접속
   - "Sign Up" 또는 "Log In" 클릭
   - GitHub 계정으로 로그인 (권장)

2. **프로젝트 생성**
   - 대시보드에서 "Add New..." → "Project" 클릭
   - "Import Git Repository"에서 `Purpleshifted/Intersection` 선택
   - "Import" 클릭

3. **프로젝트 설정**
   - **Framework Preset**: Next.js (자동 감지됨)
   - **Root Directory**: `.` (기본값)
   - **Build Command**: `yarn build` (기본값)
   - **Output Directory**: `.next` (기본값)
   - **Install Command**: `yarn install` (기본값)
   
   ⚠️ **중요**: 환경 변수는 아직 설정하지 마세요. 나중에 추가합니다.

4. **배포 시작**
   - "Deploy" 버튼 클릭
   - 배포가 완료될 때까지 대기 (약 2-3분)
   - 배포 완료 후 URL을 복사하세요 (예: `https://intersection-xxx.vercel.app`)

---

### 2단계: Render에 실시간 서버 배포 (3분)

1. **Render 접속 및 로그인**
   - https://render.com 접속
   - "Get Started for Free" 또는 "Log In" 클릭
   - GitHub 계정으로 로그인

2. **새 Web Service 생성**
   - 대시보드에서 "New +" → "Web Service" 클릭
   - "Connect a repository"에서 `Purpleshifted/Intersection` 선택
   - "Connect" 클릭

3. **서비스 설정**
   - **Name**: `intersection-realtime`
   - **Region**: `Oregon (US West)` 또는 가장 가까운 지역
   - **Branch**: `main`
   - **Root Directory**: `realtime` ⚠️ **중요!**
   - **Environment**: `Node`
   - **Build Command**: `yarn install && yarn build`
   - **Start Command**: `yarn start`
   - **Plan**: `Free` (또는 `Starter $7/월` - 수업용 권장)

4. **환경 변수 추가**
   - "Advanced" 섹션 클릭
   - "Add Environment Variable" 클릭
   - 다음 변수 추가:
     ```
     Key: PORT
     Value: 3001
     ```
   - 다시 추가:
     ```
     Key: NODE_ENV
     Value: production
     ```

5. **배포 시작**
   - "Create Web Service" 클릭
   - 배포가 완료될 때까지 대기 (약 2-3분)
   - 배포 완료 후 URL을 복사하세요 (예: `https://intersection-realtime.onrender.com`)

---

### 3단계: Render에 NoiseCraft 서버 배포 (2분)

1. **새 Web Service 생성**
   - Render 대시보드에서 "New +" → "Web Service" 클릭
   - 동일한 저장소 `Purpleshifted/Intersection` 선택

2. **서비스 설정**
   - **Name**: `intersection-noisecraft`
   - **Region**: 실시간 서버와 동일한 지역
   - **Branch**: `main`
   - **Root Directory**: `noisecraft` ⚠️ **중요!**
   - **Environment**: `Node`
   - **Build Command**: `yarn install`
   - **Start Command**: `yarn start`
   - **Plan**: `Free`

3. **환경 변수 추가**
   - "Advanced" 섹션에서:
     ```
     Key: PORT
     Value: 4000
     ```
     ```
     Key: NODE_ENV
     Value: production
     ```

4. **배포 시작**
   - "Create Web Service" 클릭
   - 배포 완료 후 URL 복사 (예: `https://intersection-noisecraft.onrender.com`)

---

### 4단계: Vercel 환경 변수 설정 (1분)

1. **Vercel 대시보드로 돌아가기**
   - 프로젝트 선택 → "Settings" → "Environment Variables"

2. **환경 변수 추가**
   - "Add New" 클릭
   - 다음 변수들을 추가하세요 (실제 Render URL로 변경):

   ```
   Name: NEXT_PUBLIC_WS_URL
   Value: wss://intersection-realtime.onrender.com/socket
   ```
   ⚠️ **중요**: `wss://` (HTTPS용) 또는 `ws://` (HTTP용) 사용

   ```
   Name: NEXT_PUBLIC_NOISECRAFT_WS_URL
   Value: https://intersection-noisecraft.onrender.com
   ```

3. **재배포**
   - "Deployments" 탭으로 이동
   - 최신 배포 옆 "..." 메뉴 → "Redeploy" 클릭
   - 또는 자동으로 재배포될 수도 있습니다

---

### 5단계: 테스트

1. **Vercel URL로 접속**
   - 배포된 Vercel URL로 접속 (예: `https://intersection-xxx.vercel.app`)

2. **브라우저 개발자 도구 확인**
   - F12 또는 Cmd+Option+I
   - Console 탭에서 에러 확인
   - Network 탭에서 WebSocket 연결 확인

3. **게임 테스트**
   - 이름 입력 및 난이도 선택
   - 게임이 정상적으로 작동하는지 확인

---

## 중요 참고사항

### Render 무료 플랜 제한
- ⚠️ **15분 비활성 시 슬립 모드**: 서비스가 15분 동안 요청이 없으면 자동으로 슬립 모드로 전환됩니다.
- ⚠️ **첫 요청 지연**: 슬립 모드에서 깨어나는 데 30초~1분이 걸릴 수 있습니다.
- ✅ **해결책**: 수업 시간에 사용하려면 **Starter 플랜 ($7/월)**을 권장합니다.

### WebSocket URL 형식
- HTTPS 서버: `wss://` 사용
- HTTP 서버: `ws://` 사용
- Render는 HTTPS를 자동 제공하므로 `wss://` 사용

### 비용 추정
- **Vercel**: 무료 (개인 프로젝트)
- **Render Free**: 무료 (슬립 모드 있음)
- **Render Starter**: $7/월 × 2개 서비스 = $14/월 (권장)

---

## 문제 해결

### WebSocket 연결 실패
1. 환경 변수가 올바르게 설정되었는지 확인
2. Render 서비스가 실행 중인지 확인 (대시보드에서 확인)
3. URL이 `wss://`로 시작하는지 확인

### CORS 에러
- Render 서비스의 "Settings" → "Headers"에서 CORS 헤더 추가
- 또는 `realtime/src/index.ts`에서 CORS 설정 확인

### 서비스가 응답하지 않음
- Render 대시보드에서 서비스 상태 확인
- 로그 확인 ("Logs" 탭)
- 슬립 모드일 수 있으므로 첫 요청 시 잠시 대기

---

## 완료! 🎉

이제 웹에서 접속 가능한 서비스가 준비되었습니다!

**다음 단계:**
- Vercel URL을 공유하여 수업 시간에 사용
- 필요시 Render를 유료 플랜으로 업그레이드

