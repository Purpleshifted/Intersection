# 배포 가이드

이 프로젝트는 **3개의 서비스**로 구성되어 있으며, 각각 별도로 배포해야 합니다.

## 배포 대상

### 1. Next.js 프론트엔드
- **위치**: 프로젝트 루트 (`/`)
- **플랫폼 옵션**:
  - **Netlify** (권장) - 무료, Next.js 완벽 지원
  - **Render** - 이미 백엔드에 사용 중, 통합 관리 가능
  - **Cloudflare Pages** - 무료, 빠른 CDN
  - **Vercel** - 문제 발생 시 대안 사용 권장
- **빌드 명령**: `yarn build`
- **포트**: 3000 (로컬)

> **Vercel 문제 발생 시**: `DEPLOYMENT_ALTERNATIVES.md` 참고

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

### 1단계: 프론트엔드 배포

#### 옵션 A: Netlify (권장) ⭐

1. [Netlify](https://netlify.com)에 로그인 (GitHub 계정)
2. "Add new site" → "Import an existing project"
3. GitHub 저장소 선택: `Purpleshifted/Intersection`
4. 빌드 설정:
   - **Base directory**: `.`
   - **Build command**: `yarn install && yarn build`
   - **Publish directory**: `.next`
   - **Framework preset**: Next.js (자동 감지)
5. 환경 변수 추가:
   ```
   NEXT_PUBLIC_WS_URL=wss://your-realtime-server.onrender.com/socket
   NEXT_PUBLIC_NOISECRAFT_WS_URL=https://your-noisecraft-server.onrender.com
   ```
6. "Deploy site" 클릭

#### 옵션 B: Render (통합 관리)

1. [Render](https://render.com) 대시보드에서 "New +" → "Web Service"
2. GitHub 저장소 연결: `Purpleshifted/Intersection`
3. 설정:
   - **Name**: `intersection-frontend`
   - **Root Directory**: `.`
   - **Build Command**: `yarn install && yarn build`
   - **Start Command**: `yarn start`
   - **Plan**: Free
4. 환경 변수 추가 후 배포

> **다른 옵션들**: `DEPLOYMENT_ALTERNATIVES.md` 참고

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

### 4단계: 프론트엔드 환경 변수 업데이트

배포한 플랫폼의 대시보드에서 환경 변수 업데이트:

**Netlify**: Site settings → Environment variables
**Render**: Environment 탭
**Vercel**: Settings → Environment Variables

환경 변수:
```
NEXT_PUBLIC_WS_URL=wss://intersection-realtime.onrender.com/socket
NEXT_PUBLIC_NOISECRAFT_WS_URL=https://intersection-noisecraft.onrender.com
```

업데이트 후 재배포

## 중요 사항

- Render 무료 플랜은 15분 비활성 시 슬립 모드로 전환됩니다
- 첫 요청 시 깨어나는 데 시간이 걸릴 수 있습니다
- 프로덕션 환경에서는 유료 플랜을 권장합니다
