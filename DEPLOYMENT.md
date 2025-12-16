# 배포 가이드

이 프로젝트는 **3개의 서비스**로 구성되어 있으며, 각각 별도로 배포해야 합니다.

## 배포 대상

### 1. Next.js 프론트엔드 (Vercel)
- **위치**: 프로젝트 루트 (`/`)
- **플랫폼**: Vercel
- **설정 파일**: `vercel.json`
- **빌드 명령**: `yarn build`
- **포트**: 3000 (로컬)

### 2. 실시간 서버 (Render)
- **위치**: `realtime/` 폴더
- **플랫폼**: Render
- **설정 파일**: `realtime/render.yaml`
- **빌드 명령**: `yarn install && yarn build`
- **시작 명령**: `yarn start`
- **포트**: 3001
- **환경 변수**: `PORT=3001`, `NODE_ENV=production`

### 3. NoiseCraft 오디오 서버 (Render)
- **위치**: `noisecraft/` 폴더
- **플랫폼**: Render
- **설정 파일**: `noisecraft/render.yaml`
- **빌드 명령**: `yarn install`
- **시작 명령**: `yarn start`
- **포트**: 4000
- **환경 변수**: `PORT=4000`, `NODE_ENV=production`

## 배포 순서

### 1단계: Vercel 배포 (프론트엔드)

1. [Vercel](https://vercel.com)에 로그인
2. "New Project" → GitHub 저장소 선택
3. 설정 확인:
   - Framework: Next.js
   - Root Directory: `.`
   - Build Command: `yarn build`
4. 환경 변수 추가 (나중에):
   ```
   NEXT_PUBLIC_WS_URL=wss://your-realtime-server.onrender.com/socket
   NEXT_PUBLIC_NOISECRAFT_WS_URL=https://your-noisecraft-server.onrender.com
   ```
5. "Deploy" 클릭

### 2단계: Render 배포 (실시간 서버)

1. [Render](https://render.com)에 로그인
2. "New +" → "Web Service"
3. GitHub 저장소 연결
4. 설정:
   - Name: `intersection-realtime`
   - Root Directory: `realtime`
   - Build Command: `yarn install && yarn build`
   - Start Command: `yarn start`
   - Plan: Free
5. 환경 변수:
   - `PORT=3001`
   - `NODE_ENV=production`
6. 배포 완료 후 URL 복사

### 3단계: Render 배포 (NoiseCraft 서버)

1. Render에서 "New +" → "Web Service" 다시 클릭
2. 동일한 저장소 선택
3. 설정:
   - Name: `intersection-noisecraft`
   - Root Directory: `noisecraft`
   - Build Command: `yarn install`
   - Start Command: `yarn start`
   - Plan: Free
4. 환경 변수:
   - `PORT=4000`
   - `NODE_ENV=production`
5. 배포 완료 후 URL 복사

### 4단계: Vercel 환경 변수 업데이트

1. Vercel 대시보드 → Settings → Environment Variables
2. 실제 배포된 서버 URL로 업데이트:
   ```
   NEXT_PUBLIC_WS_URL=wss://intersection-realtime.onrender.com/socket
   NEXT_PUBLIC_NOISECRAFT_WS_URL=https://intersection-noisecraft.onrender.com
   ```
3. Redeploy

## 중요 사항

- Render 무료 플랜은 15분 비활성 시 슬립 모드로 전환됩니다
- 첫 요청 시 깨어나는 데 시간이 걸릴 수 있습니다
- 프로덕션 환경에서는 유료 플랜을 권장합니다
