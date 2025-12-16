# 배포 체크리스트 ✅

## 배포 전 확인사항

### ✅ 완료된 항목
- [x] GitHub 저장소 생성 및 푸시 완료
- [x] Vercel 설정 파일 (`vercel.json`) 준비
- [x] Render 설정 파일 (`realtime/render.yaml`, `noisecraft/render.yaml`) 준비
- [x] 모든 소스 코드 포함
- [x] 환경 변수 예시 파일 (`.env.example`) 준비

### 배포 순서

## 1️⃣ Vercel 배포 (프론트엔드)

**링크**: https://vercel.com/new

1. [ ] GitHub 계정으로 로그인
2. [ ] "Import Git Repository" → `Purpleshifted/Intersection` 선택
3. [ ] 프로젝트 설정 확인:
   - Framework: Next.js (자동)
   - Root Directory: `.`
   - Build Command: `yarn build`
   - Install Command: `yarn install`
4. [ ] "Deploy" 클릭
5. [ ] 배포 완료 후 URL 복사: `https://________________.vercel.app`

**예상 시간**: 3-5분

---

## 2️⃣ Render 배포 (실시간 서버)

**링크**: https://dashboard.render.com/new/web-service

1. [ ] GitHub 계정으로 로그인
2. [ ] "Connect a repository" → `Purpleshifted/Intersection` 선택
3. [ ] 서비스 설정:
   - **Name**: `intersection-realtime`
   - **Region**: `Oregon (US West)` 또는 가장 가까운 지역
   - **Branch**: `main`
   - **Root Directory**: `realtime` ⚠️ **중요!**
   - **Environment**: `Node`
   - **Build Command**: `yarn install && yarn build`
   - **Start Command**: `yarn start`
   - **Plan**: `Free`
4. [ ] "Advanced" → 환경 변수 추가:
   - `PORT` = `3001`
   - `NODE_ENV` = `production`
5. [ ] "Create Web Service" 클릭
6. [ ] 배포 완료 후 URL 복사: `https://________________.onrender.com`

**예상 시간**: 3-5분

---

## 3️⃣ Render 배포 (NoiseCraft 서버)

**링크**: https://dashboard.render.com/new/web-service

1. [ ] "New +" → "Web Service" 클릭
2. [ ] 동일한 저장소 `Purpleshifted/Intersection` 선택
3. [ ] 서비스 설정:
   - **Name**: `intersection-noisecraft`
   - **Region**: 실시간 서버와 동일
   - **Branch**: `main`
   - **Root Directory**: `noisecraft` ⚠️ **중요!**
   - **Environment**: `Node`
   - **Build Command**: `yarn install`
   - **Start Command**: `yarn start`
   - **Plan**: `Free`
4. [ ] "Advanced" → 환경 변수 추가:
   - `PORT` = `4000`
   - `NODE_ENV` = `production`
5. [ ] "Create Web Service" 클릭
6. [ ] 배포 완료 후 URL 복사: `https://________________.onrender.com`

**예상 시간**: 3-5분

---

## 4️⃣ Vercel 환경 변수 설정

**링크**: Vercel 대시보드 → 프로젝트 → Settings → Environment Variables

1. [ ] "Add New" 클릭
2. [ ] 환경 변수 1 추가:
   - **Key**: `NEXT_PUBLIC_WS_URL`
   - **Value**: `wss://[실시간서버URL]/socket`
   - 예: `wss://intersection-realtime.onrender.com/socket`
3. [ ] 환경 변수 2 추가:
   - **Key**: `NEXT_PUBLIC_NOISECRAFT_WS_URL`
   - **Value**: `https://[NoiseCraft서버URL]`
   - 예: `https://intersection-noisecraft.onrender.com`
4. [ ] "Save" 클릭
5. [ ] "Deployments" 탭 → 최신 배포 "Redeploy"

**예상 시간**: 1분

---

## 5️⃣ 테스트

1. [ ] Vercel URL로 접속
2. [ ] 브라우저 개발자 도구 (F12) → Console 확인
3. [ ] 게임 시작 테스트:
   - 이름 입력
   - 난이도 선택
   - 게임 플레이 확인
4. [ ] WebSocket 연결 확인 (Network 탭)

---

## 배포 완료 후

### 서비스 URL 기록
- Vercel 프론트엔드: `https://________________.vercel.app`
- Render 실시간 서버: `https://intersection-1.onrender.com`
- Render NoiseCraft: `https://intersection-1.onrender.com`

### 공유할 URL
**프론트엔드 URL만 공유하면 됩니다!** (Vercel URL)

---

## 문제 해결

### Render 서비스가 시작되지 않음
- 로그 확인: Render 대시보드 → "Logs" 탭
- 빌드 에러 확인
- 환경 변수 확인

### WebSocket 연결 실패
- 환경 변수가 올바르게 설정되었는지 확인
- URL이 `wss://`로 시작하는지 확인
- Render 서비스가 실행 중인지 확인

### CORS 에러
- Render 서비스의 "Settings" → "Headers" 확인
- 또는 `realtime/src/index.ts`에서 CORS 설정 확인

---

## 무료 플랜 제한사항

⚠️ **Render Free 플랜**:
- 15분 비활성 시 슬립 모드
- 첫 요청 시 30초~1분 지연 가능
- 수업 시간에 사용하려면 Starter 플랜($7/월) 권장

✅ **Vercel Free 플랜**:
- 제한 없음 (개인 프로젝트)
- 자동 배포
- 무료 SSL

