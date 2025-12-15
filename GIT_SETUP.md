# Git 저장소 설정 가이드

## 1. GitHub 저장소 생성

1. [GitHub](https://github.com)에 로그인합니다.
2. 우측 상단의 "+" 버튼을 클릭하고 "New repository"를 선택합니다.
3. 저장소 이름을 입력합니다 (예: `intersection-harmonic-composition`)
4. "Public" 또는 "Private"를 선택합니다.
5. "Initialize this repository with a README"는 체크하지 마세요 (이미 README가 있습니다).
6. "Create repository"를 클릭합니다.

## 2. 로컬 저장소와 연결

터미널에서 다음 명령어를 실행하세요:

```bash
cd /Users/hesse/intersection-submission

# 원격 저장소 추가 (YOUR_USERNAME과 YOUR_REPO_NAME을 실제 값으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 첫 커밋 (이미 준비됨)
git commit -m "Initial commit: Intersection Harmonic Composition Space"

# 메인 브랜치로 푸시
git branch -M main
git push -u origin main
```

## 3. 확인

GitHub 저장소 페이지에서 파일들이 올바르게 업로드되었는지 확인하세요.

