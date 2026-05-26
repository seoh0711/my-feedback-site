# 사용자가 직접 해야 할 일 — 배포 절차서

이 사이트는 빌드/배포는 자동화되어 있지만, **GitHub 계정 권한이 필요한 일부 단계는 사용자가 직접** 해야 합니다. 아래 순서대로 진행하세요.

작성일: 2026-05-26
대상 호스팅: GitHub Pages (무료)

---

## 1. GitHub 리포지토리 생성

1. https://github.com/new 접속
2. **Repository name**: 원하는 이름 (예: `my-feedback-site`, `reader-notes`, 등)
3. **Public** 선택 (Private는 GitHub Pro 유료 계정이 있어야 Pages가 동작합니다 — 0원 운영을 위해 Public 권장)
4. **README, .gitignore, license는 추가하지 마세요** (로컬에 이미 파일이 있어서 충돌 가능)
5. "Create repository" 클릭

생성 직후 보이는 URL을 메모해두세요:
```
https://github.com/seoh0711/my-feedback-site
```

---

## 2. mkdocs.yml의 placeholder 치환 (중요)

`mkdocs.yml` 파일을 열어 다음 3곳의 `<YOUR_GITHUB_USERNAME>`, `<YOUR_REPO>`를 **실제 값으로 치환**하세요:

```yaml
site_url: https://<YOUR_GITHUB_USERNAME>.github.io/<YOUR_REPO>/
repo_url: https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO>
repo_name: <YOUR_GITHUB_USERNAME>/<YOUR_REPO>
```

https://seoh0711.github.io/my-feedback-site
https://github.com/seoh0711/my-feedback-site
seoh0711/my-feedback-site


예시 (사용자명이 `seoh`, 리포가 `reader-notes`인 경우):
```yaml
site_url: https://seoh.github.io/reader-notes/
repo_url: https://github.com/seoh/reader-notes
repo_name: seoh/reader-notes
```

**이 단계가 빠지면 Hypothesis 어노테이션이 분산됩니다.** `site_url`이 canonical URL로 동작하기 때문에, 실제 배포 URL과 정확히 일치해야 같은 페이지의 어노테이션이 한 곳에 모입니다.

---

## 3. 로컬에서 첫 push

프로젝트 루트(`@harness_독자피드백`)에서 PowerShell을 열고:

```powershell
git init
git add .
git commit -m "Initial commit: MkDocs + Hypothesis 사이트"
git branch -M main
git remote add origin https://github.com/<당신의-사용자명>/<리포이름>.git
git push -u origin main
```

- `git`이 설치되어 있지 않으면: https://git-scm.com/download/win 에서 설치
- 처음이라면 GitHub 인증을 묻는 창이 뜹니다 (브라우저 로그인 또는 PAT)

---

## 4. GitHub Pages 활성화 (Source = GitHub Actions)

이게 가장 빠뜨리기 쉬운 단계입니다.

1. 리포지토리 페이지 → **Settings** 탭
2. 좌측 메뉴에서 **Pages**
3. **Build and deployment** → **Source** 드롭다운에서 **GitHub Actions** 선택
   - "Deploy from a branch (gh-pages)" 방식이 **아닙니다**. Actions를 골라야 합니다.
4. 별도로 저장 버튼 없이 즉시 적용됩니다.

---

## 5. 배포 진행 상황 확인

push 직후 자동으로 워크플로우가 돌기 시작합니다.

1. 리포지토리 페이지 → **Actions** 탭
2. "Deploy MkDocs to GitHub Pages" 워크플로우 확인
3. 두 job (`build` → `deploy`) 모두 초록 체크가 뜨면 성공 (보통 1~3분)
4. `deploy` job의 출력에 `https://<당신의-사용자명>.github.io/<리포이름>/` URL이 표시됩니다.

빌드 실패 시: 로그를 열어 어느 단계에서 실패했는지 확인하세요. 가장 흔한 원인은 `mkdocs.yml` 문법 오류 또는 `--strict` 모드에서 잡힌 깨진 링크입니다.

---

## 6. 배포된 사이트 접속 + Hypothesis 확인

1. `https://<당신의-사용자명>.github.io/<리포이름>/` 접속 (URL 인덱싱까지 1~2분 더 걸릴 수 있음)
2. 화면 **우측 위 화살표 아이콘** 클릭 → Hypothesis 사이드바가 펼쳐짐
3. 사이드바 상단의 **공개(public) 그룹** 선택 (기본값)
4. 본문 텍스트를 드래그 → 노란 툴팁의 **Annotate** 클릭
5. hypothes.is 로그인 (계정 없으면 무료 가입 — 이메일만 있으면 됨)
6. 어노테이션 저장 → 페이지 새로고침 → 어노테이션이 다시 보이는지 확인

여기까지 되면 독자 피드백 사이트 운영 준비 완료입니다.

---

## (선택) 커스텀 도메인 연결

자체 도메인이 있다면:

1. 리포지토리 Settings → Pages → **Custom domain**에 도메인 입력 (예: `book.example.com`)
2. DNS 제공자 콘솔에서 CNAME 레코드 추가:
   - 이름(Name): `book` (또는 원하는 서브도메인)
   - 값(Value): `<당신의-사용자명>.github.io`
3. DNS 전파 대기 (수 분 ~ 24시간)
4. Settings → Pages 화면에서 **Enforce HTTPS** 체크박스 활성화 (체크박스가 활성화되기까지 몇 분 더 걸림)
5. `mkdocs.yml`의 `site_url`을 새 도메인으로 업데이트:
   ```yaml
   site_url: https://book.example.com/
   ```
6. commit & push → 재배포

**중요:** 5번을 빠뜨리면 Hypothesis 어노테이션이 기존 `github.io` URL과 새 도메인에 분산됩니다.

---

## 운영 비용 (모두 0원)

| 항목 | 비용 |
|------|------|
| GitHub Public 리포지토리 | 무료 (무제한) |
| GitHub Pages 호스팅 | 무료 (트래픽 100GB/월, 일반 도서/블로그 수준에서 충분) |
| GitHub Actions 빌드 | Public 리포는 무료 무제한 |
| Hypothesis 어노테이션 | 무료 (호스팅 비용 없음) |
| HTTPS (Let's Encrypt) | 무료 |
| **합계** | **0원/월** |

Private 리포지토리로 전환하려면 GitHub Pro($4/월)가 필요하므로, 그 단계 전에 확인해주세요.

---

## 자주 묻는 질문 (FAQ)

**Q. 배포 후 사이트가 404로 뜹니다.**
A. (1) Settings → Pages → Source가 "GitHub Actions"인지 재확인, (2) Actions 탭에서 워크플로우가 성공했는지 확인, (3) URL 마지막에 `/`가 있는지 확인 (예: `https://user.github.io/repo/`).

**Q. mkdocs.yml을 수정하면 어떻게 다시 배포되나요?**
A. 수정 → `git add` → `git commit` → `git push`만 하면 됩니다. push마다 자동으로 Actions가 다시 빌드/배포합니다.

**Q. 새 글을 추가하려면?**
A. `docs/posts/` 디렉토리에 `.md` 파일을 추가하고, `mkdocs.yml`의 `nav`에 등록한 뒤 push. 후속 자동화는 reader-feedback-site 스킬에 요청하세요.

**Q. 어노테이션 그룹을 비공개로 바꾸고 싶다면?**
A. `docs/assets/js/hypothesis.js`에서 `hypothesisConfig`의 그룹 설정을 변경해야 합니다. feedback-integrator에 요청하세요.

**Q. 배포가 안전한지 어떻게 확인하나요?**
A. `qa-reviewer` 단계가 배포 후 검증 항목을 점검합니다. URL 접속/HTTPS/sitemap/모바일 렌더링 등.
