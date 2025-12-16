# Render 배포 설정 수정

## 문제
Render에서 `Root directory "noise craft" does not exist` 오류 발생

## 원인
- Render 대시보드에서 Root Directory가 "noise craft" (공백 포함)로 잘못 설정됨
- `render.yaml` 파일에 `rootDir` 설정이 없었음

## 해결 방법

### 1. `render.yaml` 파일 수정 완료 ✅
- `noisecraft/render.yaml`: `rootDir: noisecraft` 추가
- `realtime/render.yaml`: `rootDir: realtime` 추가

### 2. Render 대시보드에서 수동 설정 필요

#### NoiseCraft 서비스
1. Render 대시보드 → `intersection-noisecraft` 서비스
2. Settings → Build & Deploy
3. **Root Directory**: `noisecraft` (공백 없음)로 설정
4. Save Changes

#### Realtime 서비스
1. Render 대시보드 → `intersection-realtime` 서비스
2. Settings → Build & Deploy
3. **Root Directory**: `realtime`로 설정
4. Save Changes

### 3. 재배포
- 설정 저장 후 자동으로 재배포됩니다
- 또는 Manual Deploy 버튼 클릭

## 확인 사항
- ✅ `render.yaml`에 `rootDir` 추가됨
- ⏳ Render 대시보드에서 Root Directory 수정 필요
- ⏳ 재배포 후 빌드 성공 확인

