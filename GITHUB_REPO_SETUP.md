# GitHub 저장소 생성 및 푸시 가이드

## 현재 상황
- Personal Access Token: 있음 ✅
- 원격 저장소: `https://github.com/Purpleshifted/intersection.git` (아직 생성되지 않음)

## 해결 방법

### 1단계: GitHub에서 저장소 생성

1. [GitHub](https://github.com)에 로그인합니다.
2. 우측 상단의 "+" 버튼을 클릭하고 "New repository"를 선택합니다.
3. 저장소 설정:
   - **Repository name**: `intersection` (또는 원하는 이름)
   - **Description**: "Harmonic Composition Space - Real-time multiplayer music game"
   - **Visibility**: Public 또는 Private 선택
   - **⚠️ 중요**: "Initialize this repository with a README"는 **체크하지 마세요** (이미 README가 있습니다)
   - "Add .gitignore"도 선택하지 마세요
   - "Choose a license"도 선택하지 마세요
4. "Create repository"를 클릭합니다.

### 2단계: 로컬에서 푸시

저장소를 생성한 후, 다음 명령어를 실행하세요:

```bash
cd /Users/hesse/intersection-submission

# 원격 URL 확인 (이미 설정되어 있음)
git remote -v

# 만약 저장소 이름이 다르다면:
# git remote set-url origin https://github.com/Purpleshifted/YOUR_REPO_NAME.git

# 푸시
git push -u origin main
```

### 3단계: 인증

푸시 시 다음 정보를 입력하세요:
- **Username**: `Purpleshifted`
   - **Password**: `<YOUR_PERSONAL_ACCESS_TOKEN>` (Personal Access Token)

또는 자격 증명이 이미 저장되어 있다면 자동으로 사용됩니다.

## 빠른 명령어

```bash
cd /Users/hesse/intersection-submission

# 저장소 생성 후 푸시
git push -u origin main
```

## 문제 해결

### "Repository not found" 에러
- GitHub에서 저장소를 먼저 생성했는지 확인하세요.
- 저장소 이름이 정확한지 확인하세요.
- 토큰에 `repo` 권한이 있는지 확인하세요.

### 인증 실패
- Personal Access Token이 만료되지 않았는지 확인하세요.
- 토큰에 올바른 권한이 있는지 확인하세요 (최소 `repo` 권한 필요).

