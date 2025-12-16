# Vercel 대안 배포 가이드

Vercel에서 문제가 발생할 경우 사용할 수 있는 무료 대안들입니다.

## 옵션 1: Netlify (권장) ⭐

### 장점
- ✅ Next.js 완벽 지원
- ✅ 무료 플랜 제공 (100GB 대역폭/월)
- ✅ 자동 배포 (GitHub 연동)
- ✅ 환경 변수 설정 쉬움
- ✅ Monorepo 지원

### 배포 방법

1. [Netlify](https://netlify.com)에 로그인 (GitHub 계정)
2. "Add new site" → "Import an existing project"
3. GitHub 저장소 선택: `Purpleshifted/Intersection`
4. 빌드 설정:
   - **Base directory**: `.` (루트)
   - **Build command**: `yarn build`
   - **Publish directory**: `.next`
   - **Framework preset**: Next.js (자동 감지)
5. 환경 변수 추가:
   ```
   NEXT_PUBLIC_WS_URL=wss://your-realtime-server.onrender.com/socket
   NEXT_PUBLIC_NOISECRAFT_WS_URL=https://your-noisecraft-server.onrender.com
   ```
6. "Deploy site" 클릭

### Netlify 설정 파일 (선택사항)

`netlify.toml` 파일 생성:
```toml
[build]
  command = "yarn build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 옵션 2: Cloudflare Pages

### 장점
- ✅ 무료 플랜 (무제한 요청)
- ✅ Next.js 지원 (Cloudflare Pages Functions)
- ✅ 빠른 CDN
- ✅ 자동 배포

### 배포 방법

1. [Cloudflare Pages](https://pages.cloudflare.com)에 로그인
2. "Create a project" → GitHub 저장소 연결
3. 빌드 설정:
   - **Framework preset**: Next.js
   - **Build command**: `yarn build`
   - **Build output directory**: `.next`
4. 환경 변수 추가 (Settings → Environment variables)
5. "Save and Deploy"

### 주의사항
- Cloudflare Pages는 일부 Next.js 기능이 제한될 수 있음
- Server-side rendering은 Cloudflare Workers로 처리

---

## 옵션 3: Render (이미 백엔드에 사용 중)

### 장점
- ✅ 이미 Render 계정이 있음
- ✅ 무료 플랜 제공
- ✅ Next.js 지원
- ✅ 모든 서비스를 한 곳에서 관리 가능

### 배포 방법

1. [Render](https://render.com) 대시보드에서 "New +" → "Web Service"
2. GitHub 저장소 연결: `Purpleshifted/Intersection`
3. 설정:
   - **Name**: `intersection-frontend`
   - **Root Directory**: `.` (루트)
   - **Environment**: Node
   - **Build Command**: `yarn build`
   - **Start Command**: `yarn start`
   - **Plan**: Free
4. 환경 변수:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_WS_URL=wss://intersection-realtime.onrender.com/socket
   NEXT_PUBLIC_NOISECRAFT_WS_URL=https://intersection-noisecraft.onrender.com
   ```
5. "Create Web Service" 클릭

### 주의사항
- Render 무료 플랜은 15분 비활성 시 슬립 모드
- 첫 요청 시 깨어나는 데 시간이 걸릴 수 있음

---

## 옵션 4: Railway

### 장점
- ✅ 무료 크레딧 $5/월
- ✅ Next.js 완벽 지원
- ✅ 간단한 설정
- ✅ Monorepo 지원

### 배포 방법

1. [Railway](https://railway.app)에 로그인
2. "New Project" → "Deploy from GitHub repo"
3. 저장소 선택: `Purpleshifted/Intersection`
4. 서비스 설정:
   - **Root Directory**: `.`
   - **Build Command**: `yarn build`
   - **Start Command**: `yarn start`
5. 환경 변수 추가
6. 배포 시작

---

## 비교표

| 서비스 | 무료 플랜 | Next.js 지원 | 설정 난이도 | 추천도 |
|--------|----------|-------------|------------|--------|
| **Netlify** | ✅ 100GB/월 | ⭐⭐⭐ 완벽 | ⭐ 쉬움 | ⭐⭐⭐⭐⭐ |
| **Cloudflare Pages** | ✅ 무제한 | ⭐⭐ 제한적 | ⭐⭐ 보통 | ⭐⭐⭐⭐ |
| **Render** | ✅ 제한적 | ⭐⭐⭐ 좋음 | ⭐ 쉬움 | ⭐⭐⭐⭐ |
| **Railway** | ✅ $5 크레딧 | ⭐⭐⭐ 완벽 | ⭐ 쉬움 | ⭐⭐⭐⭐ |

---

## 권장 사항

**가장 추천: Netlify**
- Vercel과 가장 유사한 경험
- Monorepo 문제 없음
- 설정이 간단하고 안정적

**두 번째 선택: Render**
- 이미 백엔드를 Render에 배포 중
- 모든 서비스를 한 곳에서 관리 가능
- 무료 플랜의 슬립 모드만 주의

---

## 빠른 전환 가이드 (Netlify)

1. Netlify에 가입/로그인
2. "Add new site" → GitHub 저장소 선택
3. 빌드 설정 자동 감지 (Next.js)
4. 환경 변수만 추가하면 완료!

**예상 시간: 5분**

