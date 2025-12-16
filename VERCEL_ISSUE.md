# Vercel 빌드 에러 근본 원인 분석

## 문제
Vercel이 빌드 후 `/vercel/path0/noisecraft/.next/routes-manifest.json`을 찾으려고 시도하여 에러 발생

## 근본 원인

### 1. Yarn Workspaces 구조
- 프로젝트가 `yarn workspaces`를 사용 (`package.json`에 `"workspaces": ["realtime", "noisecraft"]`)
- Vercel이 빌드 후 검증 단계에서 **모든 워크스페이스를 스캔**함
- `noisecraft` 폴더에 `package.json`이 있어 별도 프로젝트로 인식될 수 있음

### 2. Vercel의 자동 감지 로직
- Vercel은 빌드 완료 후 `routes-manifest.json`을 찾을 때:
  1. 프로젝트 루트의 `.next` 폴더 확인
  2. **모든 하위 디렉토리도 스캔** (특히 `package.json`이 있는 폴더)
  3. `noisecraft/.next`를 찾으려고 시도

### 3. `.vercelignore`의 한계
- `.vercelignore`는 **빌드 전**에 파일을 제거함
- 하지만 Vercel의 **빌드 후 검증 단계**는 여전히 프로젝트 구조를 스캔함
- 빌드 중에 `noisecraft/.next`가 생성될 수 있음 (yarn workspaces 때문)

## 해결 방법

### 방법 1: Vercel 대시보드에서 Root Directory 명시 (권장)
Vercel 프로젝트 설정에서:
- **Root Directory**: `.` (루트)
- **Build Command**: `yarn build` (workspaces 빌드 제외)
- **Ignore Build Step**: `git diff --quiet HEAD^ HEAD -- noisecraft/ realtime/ || echo 'skip'`

### 방법 2: 빌드 스크립트 수정
현재 `build:vercel` 스크립트가 있지만, Vercel의 검증 단계가 빌드 후에 실행되므로 효과가 제한적

### 방법 3: Monorepo 설정 분리
- `noisecraft`와 `realtime`을 별도 저장소로 분리
- 또는 Vercel의 monorepo 기능 사용

## 현재 상태
- `.vercelignore`로 파일 제거 시도 ✅
- `build:vercel` 스크립트로 빌드 전/후 `.next` 제거 시도 ✅
- `next.config.ts`에 `outputFileTracingExcludes` 추가 ✅
- 하지만 Vercel의 내부 검증 로직이 여전히 `noisecraft` 폴더를 스캔함 ❌

## 권장 해결책
**Vercel 대시보드에서 프로젝트 설정 확인:**
1. Settings → General → Root Directory가 `.`로 설정되어 있는지 확인
2. Build & Development Settings에서 "Ignore Build Step" 추가 고려
3. 또는 Vercel의 monorepo 기능 활용

