# 배포 가이드

이 문서는 Intersection 프로젝트를 웹에 배포하는 방법을 설명합니다.

## 배포 아키텍처

이 프로젝트는 세 가지 서비스로 구성됩니다:

1. **Next.js 프론트엔드** (포트 3000)
2. **실시간 서버** (포트 3001) - Socket.IO
3. **NoiseCraft 서버** (포트 4000) - 오디오 서버

## 배포 옵션

### 옵션 1: Vercel (프론트엔드) + Render (백엔드) - 권장

#### 1단계: 프론트엔드를 Vercel에 배포

1. GitHub에 프로젝트를 푸시합니다.
2. [Vercel](https://vercel.com)에 로그인합니다.
3. "New Project"를 클릭하고 GitHub 저장소를 선택합니다.
4. 프로젝트 설정:
   - Framework Preset: Next.js
   - Root Directory: `.` (루트)
   - Build Command: `yarn build`
   - Output Directory: `.next`
5. 환경 변수 추가:
   ```
   NEXT_PUBLIC_WS_URL=wss://your-realtime-server.onrender.com/socket
   NEXT_PUBLIC_NOISECRAFT_WS_URL=https://your-noisecraft-server.onrender.com
   ```
6. "Deploy"를 클릭합니다.

#### 2단계: 실시간 서버를 Render에 배포

1. [Render](https://render.com)에 로그인합니다.
2. "New +" → "Web Service"를 선택합니다.
3. GitHub 저장소를 연결합니다.
4. 서비스 설정:
   - Name: `intersection-realtime`
   - Root Directory: `realtime`
   - Environment: Node
   - Build Command: `yarn install && yarn build`
   - Start Command: `yarn start`
   - Plan: Free (또는 유료 플랜)
5. 환경 변수:
   ```
   PORT=3001
   NODE_ENV=production
   ```
6. "Create Web Service"를 클릭합니다.
7. 배포가 완료되면 URL을 복사합니다 (예: `https://intersection-realtime.onrender.com`)

#### 3단계: NoiseCraft 서버를 Render에 배포

1. Render에서 "New +" → "Web Service"를 선택합니다.
2. 동일한 GitHub 저장소를 연결합니다.
3. 서비스 설정:
   - Name: `intersection-noisecraft`
   - Root Directory: `noisecraft`
   - Environment: Node
   - Build Command: `yarn install`
   - Start Command: `yarn start`
   - Plan: Free
4. 환경 변수:
   ```
   PORT=4000
   NODE_ENV=production
   ```
5. "Create Web Service"를 클릭합니다.

#### 4단계: 환경 변수 업데이트

Vercel의 환경 변수를 업데이트하여 실제 배포된 서버 URL을 사용합니다:

```
NEXT_PUBLIC_WS_URL=wss://intersection-realtime.onrender.com/socket
NEXT_PUBLIC_NOISECRAFT_WS_URL=https://intersection-noisecraft.onrender.com
```

Vercel을 다시 배포하면 변경사항이 적용됩니다.

### 옵션 2: Railway (전체 스택)

Railway는 모든 서비스를 하나의 프로젝트에서 관리할 수 있습니다.

1. [Railway](https://railway.app)에 로그인합니다.
2. "New Project" → "Deploy from GitHub repo"를 선택합니다.
3. 저장소를 선택합니다.
4. 세 개의 서비스를 생성합니다:

   **서비스 1: 프론트엔드**
   - Root Directory: `.`
   - Build Command: `yarn build`
   - Start Command: `yarn start`
   - Port: 3000

   **서비스 2: 실시간 서버**
   - Root Directory: `realtime`
   - Build Command: `yarn install && yarn build`
   - Start Command: `yarn start`
   - Port: 3001

   **서비스 3: NoiseCraft**
   - Root Directory: `noisecraft`
   - Build Command: `yarn install`
   - Start Command: `yarn start`
   - Port: 4000

5. 각 서비스의 환경 변수를 설정합니다.
6. 프론트엔드 서비스의 환경 변수에 다른 서비스의 URL을 설정합니다.

### 옵션 3: Docker Compose (VPS/서버)

자체 서버가 있는 경우 Docker Compose를 사용할 수 있습니다.

1. 서버에 Docker와 Docker Compose를 설치합니다.
2. 프로젝트를 클론합니다.
3. `docker-compose.yml` 파일을 확인합니다.
4. 실행:
   ```bash
   docker-compose up -d
   ```

## 중요 사항

### WebSocket 연결

- Render의 무료 플랜은 서비스가 15분 동안 비활성화되면 슬립 모드로 전환됩니다.
- 첫 요청 시 깨어나는 데 시간이 걸릴 수 있습니다.
- 프로덕션 환경에서는 유료 플랜을 사용하거나 항상 실행되는 서비스를 고려하세요.

### CORS 설정

배포된 서버 간 통신을 위해 CORS를 올바르게 설정해야 합니다.

### HTTPS/SSL

모든 서비스는 HTTPS를 사용해야 합니다. Render와 Railway는 자동으로 SSL 인증서를 제공합니다.

## 트러블슈팅

### WebSocket 연결 실패

- 환경 변수가 올바르게 설정되었는지 확인하세요.
- URL이 `wss://` (HTTPS) 또는 `ws://` (HTTP)로 시작하는지 확인하세요.
- 방화벽이나 프록시 설정을 확인하세요.

### 서비스 간 통신 문제

- 각 서비스의 URL이 올바른지 확인하세요.
- CORS 설정을 확인하세요.

## 비용 추정

- **Vercel**: 무료 플랜 (개인 프로젝트)
- **Render**: 무료 플랜 (제한적, 슬립 모드 있음) 또는 $7/월 (스타터 플랜)
- **Railway**: $5 크레딧/월 (무료 티어) 또는 유료 플랜

프로덕션 환경에서는 유료 플랜을 권장합니다.

