# 빠른 배포 가이드 (무료 플랜)

## 🚀 지금 바로 시작하기

### 1. Vercel 배포 (프론트엔드) - 2분

**직접 링크**: https://vercel.com/new

1. GitHub 계정으로 로그인
2. "Add New..." → "Project"
3. `Purpleshifted/Intersection` 저장소 선택
4. **설정 확인**:
   - Framework: Next.js (자동)
   - Root Directory: `.`
   - Build Command: `yarn build`
   - Output Directory: `.next`
5. **환경 변수는 나중에** - 일단 "Deploy" 클릭
6. 배포 완료 후 URL 복사 (예: `https://intersection-xxx.vercel.app`)

---

### 2. Render 배포 (실시간 서버) - 3분

**직접 링크**: https://dashboard.render.com/new/web-service

1. GitHub 계정으로 로그인
2. "New +" → "Web Service"
3. `Purpleshifted/Intersection` 저장소 연결
4. **중요 설정**:
   ```
   Name: intersection-realtime
   Region: Oregon (US West) 또는 Singapore
   Branch: main
   Root Directory: realtime  ⚠️ 중요!
   Environment: Node
   Build Command: cd realtime && yarn install && yarn build
   Start Command: cd realtime && yarn start
   Plan: Free
   ```
5. **환경 변수 추가** (Advanced 섹션):
   ```
   PORT = 3001
   NODE_ENV = production
   ```
6. "Create Web Service" 클릭
7. 배포 완료 후 URL 복사 (예: `https://intersection-realtime.onrender.com`)

---

### 3. Render 배포 (NoiseCraft 서버) - 2분

**직접 링크**: https://dashboard.render.com/new/web-service

1. "New +" → "Web Service" (다시)
2. 동일한 저장소 `Purpleshifted/Intersection` 선택
3. **중요 설정**:
   ```
   Name: intersection-noisecraft
   Region: 실시간 서버와 동일
   Branch: main
   Root Directory: noisecraft  ⚠️ 중요!
   Environment: Node
   Build Command: cd noisecraft && yarn install
   Start Command: cd noisecraft && yarn start
   Plan: Free
   ```
4. **환경 변수 추가**:
   ```
   PORT = 4000
   NODE_ENV = production
   ```
5. "Create Web Service" 클릭
6. 배포 완료 후 URL 복사

---

### 4. Vercel 환경 변수 설정 - 1분

1. Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
2. 다음 변수 추가 (실제 Render URL로 변경):

   **변수 1:**
   ```
   Name: NEXT_PUBLIC_WS_URL
   Value: wss://intersection-realtime.onrender.com/socket
   ```
   ⚠️ `wss://` 사용 (HTTPS용)

   **변수 2:**
   ```
   Name: NEXT_PUBLIC_NOISECRAFT_WS_URL
   Value: https://intersection-noisecraft.onrender.com
   ```

3. "Save" 클릭
4. Deployments 탭 → 최신 배포 → "Redeploy"

---

## ✅ 완료!

이제 Vercel URL로 접속하면 웹에서 게임을 플레이할 수 있습니다!

---

## ⚠️ 무료 플랜 제한사항

- **Render**: 15분 비활성 시 슬립 모드 (첫 요청 시 30초~1분 지연)
- **해결책**: 수업 전에 서비스를 "wake up" 시키거나 유료 플랜 사용

## 🔗 유용한 링크

- Vercel: https://vercel.com/dashboard
- Render: https://dashboard.render.com
- GitHub 저장소: https://github.com/Purpleshifted/Intersection

