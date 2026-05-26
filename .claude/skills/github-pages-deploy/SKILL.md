---
name: github-pages-deploy
description: MkDocs(또는 다른 정적 사이트)를 GitHub Pages에 무료로 배포하는 작업 수행. GitHub Actions 워크플로우 작성, actions/deploy-pages 구성, 커스텀 도메인 + HTTPS 설정, 사용자가 직접 해야 할 절차서 작성을 포함. "GitHub Pages 배포", "무료 호스팅", "정적 사이트 배포", "CI/CD 워크플로우" 요청 시 반드시 사용.
---

# GitHub Pages Deploy

## 언제 쓰는가

- 정적 사이트를 무료로 배포하고 싶을 때 (특히 MkDocs, Hugo, Jekyll, Docusaurus)
- 기존 사이트의 배포 워크플로우를 점검하거나 업그레이드할 때
- 커스텀 도메인을 GitHub Pages에 연결할 때
- "0원 운영", "무료 호스팅" 같은 요구사항이 있을 때

## 핵심 결정: gh-deploy vs Actions

| 방식 | 장점 | 단점 |
|------|------|------|
| `mkdocs gh-deploy` (로컬→gh-pages 브랜치) | 명령 한 줄 | 빌드 환경이 로컬에 따라 다름, push 권한 필요 |
| GitHub Actions + actions/deploy-pages | 재현 가능, 협업 친화, 권한 관리 명확 | 워크플로우 파일 필요 |

**권장: GitHub Actions.** 이유: 로컬 환경(Python 버전, 폰트, OS)에 따른 빌드 차이를 없애고, 누가 변경했는지가 PR 단위로 추적된다.

## 표준 워크플로우 파일

`.github/workflows/deploy.yml`:
```yaml
name: Deploy MkDocs to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: pip
      - run: pip install -r requirements.txt
      - run: mkdocs build --strict
      - uses: actions/upload-pages-artifact@v3
        with:
          path: site

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

**중요 포인트:**
- `permissions`의 `pages: write`, `id-token: write` 없으면 deploy-pages가 실패함
- `concurrency` 블록은 동시 배포 충돌 방지
- artifact `path: site`는 mkdocs 출력 디렉토리 — 다른 정적 사이트면 해당 출력 경로로 변경 (Hugo `public`, Jekyll `_site`, Docusaurus `build`)

## 사용자가 직접 해야 하는 절차

배포는 GitHub 계정 권한이 필요해서 일부는 사용자 손이 필요하다. 절차서를 명확히 정리해 전달:

```markdown
## 배포 절차 (사용자 직접)

1. GitHub에서 새 리포지토리 생성 (Public 권장 — Private는 Pro 계정 필요)
2. 로컬에서:
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/{user}/{repo}.git
   git push -u origin main
3. 리포지토리 → Settings → Pages
   - Source: "GitHub Actions" 선택 (gh-pages 브랜치 방식 아님)
4. Actions 탭에서 배포 진행 상황 확인 (2~3분)
5. 완료 후 https://{user}.github.io/{repo}/ 접속

## 커스텀 도메인 (선택)

6. Settings → Pages → Custom domain에 도메인 입력 (예: book.example.com)
7. DNS 제공자에서 CNAME 레코드 추가: book → {user}.github.io
8. DNS 전파 대기 (수 분 ~ 24시간)
9. "Enforce HTTPS" 체크 활성화
10. mkdocs.yml의 site_url을 https://book.example.com/ 으로 업데이트 + 재배포
    (이게 빠지면 Hypothesis 어노테이션이 분산됨)
```

## 비용 점검

- 리포지토리: Public 무료
- GitHub Pages: 트래픽 100GB/월 무료 (소형 블로그/도서 수준 충분)
- GitHub Actions: Public 리포는 무료 무제한, Private는 월 2,000분 무료
- 커스텀 도메인 HTTPS: Let's Encrypt 무료
- 합계: **0원**

## 대안 호스팅 (필요 시)

| 서비스 | 특징 |
|--------|------|
| Cloudflare Pages | 무료, 빌드 무제한, 빠른 CDN, GitHub 연동 |
| Netlify | 무료 100GB/월, 폼 무료 100건/월 (익명 폼 대체 가능) |
| Vercel | 무료 100GB/월, 빌드 6,000분/월 |

기본은 GitHub Pages. 폼 기능이 함께 필요하면 Netlify를 고려.

## 안티패턴

- `permissions` 블록 누락 → deploy-pages가 권한 오류로 실패
- `mkdocs build` (--strict 없이) → 깨진 링크나 누락 파일이 운영 환경으로 새어 나감
- 커스텀 도메인 연결 후 `site_url` 업데이트 누락 → Hypothesis 어노테이션 분산
- `actions/checkout@v3` 등 옛 버전 사용 → 새 API와 호환성 떨어짐. v4 사용
