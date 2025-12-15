# 🚀 배포 시작하기

## 빠른 시작 (3단계)

### 1단계: Vercel 배포
👉 **지금 바로**: https://vercel.com/new
- GitHub 저장소 `Purpleshifted/Intersection` 선택
- "Deploy" 클릭
- 완료!

### 2단계: Render에 실시간 서버 배포
👉 **지금 바로**: https://dashboard.render.com/new/web-service
- 저장소: `Purpleshifted/Intersection`
- **Root Directory**: `realtime` ⚠️
- Build: `yarn install && yarn build`
- Start: `yarn start`
- 환경 변수: `PORT=3001`, `NODE_ENV=production`

### 3단계: Render에 NoiseCraft 서버 배포
👉 **지금 바로**: https://dashboard.render.com/new/web-service
- 저장소: `Purpleshifted/Intersection`
- **Root Directory**: `noisecraft` ⚠️
- Build: `yarn install`
- Start: `yarn start`
- 환경 변수: `PORT=4000`, `NODE_ENV=production`

### 4단계: Vercel 환경 변수 설정
- Vercel → Settings → Environment Variables
- Render 서버 URL 추가
- Redeploy

---

## 상세 가이드
- `DEPLOY_NOW.md` - 단계별 상세 가이드
- `DEPLOY_CHECKLIST.md` - 체크리스트

---

## 예상 소요 시간
- **총 약 15분**
- Vercel: 3-5분
- Render (실시간): 3-5분
- Render (NoiseCraft): 3-5분
- 환경 변수 설정: 1분

