# Git 푸시 문제 해결

## 문제
`fatal: could not read Username for 'https://github.com': Device not configured`

## 해결 방법

### 방법 1: Personal Access Token 사용 (HTTPS)

1. GitHub에서 Personal Access Token 생성:
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - "Generate new token (classic)" 클릭
   - 권한: `repo` 체크
   - 토큰 생성 후 복사

2. 푸시 시 사용:
```bash
cd /Users/hesse/intersection-submission
git push -u origin main
# Username: Purpleshifted (또는 GitHub 사용자명)
# Password: <생성한 Personal Access Token>
```

3. 자격 증명 저장 (선택):
```bash
git config --global credential.helper osxkeychain
```
이미 설정되어 있습니다.

### 방법 2: SSH 사용 (권장)

1. SSH 키 확인:
```bash
ls -la ~/.ssh/id_*.pub
```

2. SSH 키가 없으면 생성:
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

3. SSH 키를 GitHub에 추가:
```bash
cat ~/.ssh/id_ed25519.pub
# 출력된 내용을 복사하여 GitHub → Settings → SSH and GPG keys에 추가
```

4. 원격 URL을 SSH로 변경:
```bash
cd /Users/hesse/intersection-submission
git remote set-url origin git@github.com:Purpleshifted/intersection.git
```

5. 푸시:
```bash
git push -u origin main
```

### 방법 3: GitHub CLI 사용

```bash
# GitHub CLI 설치 (없는 경우)
brew install gh

# 로그인
gh auth login

# 푸시
git push -u origin main
```

## 현재 설정 확인

```bash
# 원격 URL 확인
git remote -v

# 자격 증명 헬퍼 확인
git config --global credential.helper
```

## 빠른 해결 (SSH 권장)

```bash
cd /Users/hesse/intersection-submission

# SSH 키 확인
if [ -f ~/.ssh/id_ed25519.pub ]; then
  echo "SSH 키가 있습니다:"
  cat ~/.ssh/id_ed25519.pub
  echo ""
  echo "이 키를 GitHub에 추가한 후:"
  echo "git remote set-url origin git@github.com:Purpleshifted/intersection.git"
  echo "git push -u origin main"
else
  echo "SSH 키를 생성하세요:"
  echo "ssh-keygen -t ed25519 -C \"your_email@example.com\""
fi
```

