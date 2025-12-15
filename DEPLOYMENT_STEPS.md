# 배포 단계별 가이드

## 단계 1: GitHub에 푸시

1. `GIT_SETUP.md` 파일을 참고하여 GitHub에 저장소를 생성하고 푸시합니다.

## 단계 2: Vercel에 프론트엔드 배포

1. [Vercel](https://vercel.com)에 로그인합니다 (GitHub 계정으로 로그인 권장).
2. "Add New..." → "Project"를 클릭합니다.
3. GitHub 저장소를 선택합니다.
4. 프로젝트 설정:
   - **Framework Preset**: Next.js (자동 감지됨)
   - **Root Directory**: `.` (루트)
   - **Build Command**: `yarn build` (기본값)
   - **Output Directory**: `.next` (기본값)
   - **Install Command**: `yarn install` (기본값)
5. "Environment Variables" 섹션에서 나중에 추가할 예정이므로 일단 "Deploy"를 클릭합니다.
6. 배포가 완료되면 URL을 복사합니다 (예: `https://intersection-xxx.vercel.app`)

## 단계 3: Render에 실시간 서버 배포

1. [Render](https://render.com)에 로그인합니다 (GitHub 계정으로 로그인 권장).
2. "New +" → "Web Service"를 클릭합니다.
3. GitHub 저장소를 연결합니다.
4. 서비스 설정:
   - **Name**: `intersection-realtime`
   - **Region**: 가장 가까운 지역 선택
   - **Branch**: `main`
   - **Root Directory**: `realtime`
   - **Environment**: `Node`
   - **Build Command**: `yarn install && yarn build`
   - **Start Command**: `yarn start`
   - **Plan**: Free (또는 Starter $7/월)
5. "Advanced" 섹션에서 환경 변수 추가:
   - `PORT`: `3001`
   - `NODE_ENV`: `production`
6. "Create Web Service"를 클릭합니다.
7. 배포가 완료되면 URL을 복사합니다 (예: `https://intersection-realtime.onrender.com`)

## 단계 4: Render에 NoiseCraft 서버 배포

1. Render에서 "New +" → "Web Service"를 다시 클릭합니다.
2. 동일한 GitHub 저장소를 선택합니다.
3. 서비스 설정:
   - **Name**: `intersection-noisecraft`
   - **Root Directory**: `noisecraft`
   - **Environment**: `Node`
   - **Build Command**: `yarn install`
   - **Start Command**: `yarn start`
   - **Plan**: Free
4. 환경 변수:
   - `PORT`: `4000`
   - `NODE_ENV`: `production`
5. "Create Web Service"를 클릭합니다.
6. 배포가 완료되면 URL을 복사합니다.

## 단계 5: Vercel 환경 변수 업데이트

1. Vercel 대시보드로 돌아갑니다.
2. 프로젝트 → "Settings" → "Environment Variables"로 이동합니다.
3. 다음 환경 변수를 추가합니다:
   ```
   NEXT_PUBLIC_WS_URL=wss://intersection-realtime.onrender.com/socket
   NEXT_PUBLIC_NOISECRAFT_WS_URL=https://intersection-noisecraft.onrender.com
   ```
   (실제 Render URL로 변경하세요)
4. "Save"를 클릭합니다.
5. "Deployments" 탭으로 가서 최신 배포를 "Redeploy"합니다.

## 단계 6: 테스트

1. Vercel URL로 접속합니다.
2. 브라우저 개발자 도구 콘솔을 열어 에러가 없는지 확인합니다.
3. 게임이 정상적으로 작동하는지 테스트합니다.

## 중요 참고사항

### Render 무료 플랜 제한사항

- 서비스가 15분 동안 비활성화되면 슬립 모드로 전환됩니다.
- 첫 요청 시 깨어나는 데 30초~1분이 걸릴 수 있습니다.
- 수업 시간에 사용하려면 유료 플랜(Starter $7/월)을 권장합니다.

### WebSocket URL 형식

- HTTPS 서버의 경우 `wss://`를 사용해야 합니다.
- HTTP 서버의 경우 `ws://`를 사용합니다.
- Render는 HTTPS를 자동으로 제공하므로 `wss://`를 사용하세요.

### CORS 문제

만약 CORS 에러가 발생하면:
1. Render 서비스의 "Settings" → "Headers"에서 CORS 헤더를 추가합니다.
2. 또는 `realtime/src/index.ts`에서 CORS 설정을 확인합니다.

