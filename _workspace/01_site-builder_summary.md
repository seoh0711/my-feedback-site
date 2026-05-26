# Phase 2 — site-builder 작업 요약

작성일: 2026-05-26
담당: site-builder
상태: 완료 (`mkdocs build --strict` 통과)

## 생성한 파일

| 경로 | 역할 |
|------|------|
| `mkdocs.yml` | 사이트 설정 (Material 테마, 라이트/다크 토글, 한국어, navigation.tabs/top, content.code.copy, 한국어 검색 인덱싱) |
| `requirements.txt` | mkdocs 1.6.1, mkdocs-material 9.5.42, mkdocs-material-extensions 1.3.1, pymdown-extensions 10.11.2 |
| `docs/index.md` | 홈 — 사이트 소개 + 최근 글 안내 (캐주얼 톤) |
| `docs/about.md` | 저자/연재 소개 placeholder + 마크다운 가이드 |
| `docs/posts/index.md` | 글 목록 (수동 링크 모음) |
| `docs/posts/2026-05-26-welcome.md` | 첫 글 샘플 (본문 4단락, 캐주얼 톤) |
| `docs/posts/2026-05-26-how-to-feedback.md` | 피드백 사용법 가벼운 소개 (3단락) |
| `docs/contribute.md` | 빈 placeholder 1줄 — **feedback-integrator가 덮어쓸 예정** |
| `docs/stylesheets/reading.css` | 한국어 가독성 CSS (line-height 1.8, 본문 폭 760px ≒ 70ch, `word-break: keep-all`, h1~h3 여백, blockquote/code) |

## mkdocs.yml 핵심 결정

- **테마**: `material`, `language: ko`
- **폰트**: 본문 Noto Sans KR / 코드 JetBrains Mono
- **팔레트**: 라이트(default/indigo) ↔ 다크(slate/indigo) 토글
- **features**: `navigation.instant`, `navigation.tracking`, `navigation.tabs`, `navigation.top`, `navigation.footer`, `search.suggest`, `search.highlight`, `content.code.copy`, `content.action.edit`, `toc.follow`
- **nav 구조**: 홈 / 소개 / 글(글 목록 + 첫 두 글) / 피드백 안내
- **markdown_extensions**: admonition, attr_list, md_in_html, footnotes, tables, pymdownx.details/superfences/highlight(anchor_linenums)/inlinehilite/tabbed/tasklist, toc(permalink)
- **plugins.search.lang**: `[ko, en]` (한국어 검색 정확도)
- **extra_css**: `stylesheets/reading.css` 등록
- **extra_javascript**: `[]` 비어 있음 — **feedback-integrator가 채울 자리**

## site_url / repo_url placeholder

- `site_url: https://<YOUR_GITHUB_USERNAME>.github.io/<YOUR_REPO>/`
- `repo_url: https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO>`
- `repo_name: <YOUR_GITHUB_USERNAME>/<YOUR_REPO>`

사용자가 실제 GitHub 계정/리포 결정 시 일괄 치환 필요 (deploy-engineer 절차서에 명시 요청).

## 빌드 결과

```
python -m mkdocs build --strict
INFO    -  Cleaning site directory
INFO    -  Building documentation to directory: .../site
INFO    -  Documentation built in 0.72 seconds
```

- 빌드 성공, strict 모드 통과 (경고/에러 0건)
- 출력 디렉토리: `site/` (프로젝트 루트 기준)
- 생성된 페이지: `index.html`, `about/`, `posts/`(+ 글 목록, 글 2개), `contribute/`, `search/`, `assets/`, `stylesheets/`, `sitemap.xml`, `404.html`

## 환경 메모

- Python 3.12.4 (시스템 설치본)
- 시스템 site-packages에 권한 이슈가 있어 `pip install --user -r requirements.txt`로 설치 성공
- mkdocs 실행 경로: `C:\Users\user\AppData\Roaming\Python\Python312\Scripts\mkdocs.exe` (PATH에 없음 → `python -m mkdocs build`로 호출)
- deploy-engineer는 GitHub Actions 환경에서 빌드할 것이므로 로컬 PATH 이슈는 무관

## feedback-integrator에게

1. `mkdocs.yml`의 `extra_javascript: []`를 채우세요. 예:
   ```yaml
   extra_javascript:
     - assets/js/hypothesis.js
   ```
2. `docs/assets/js/hypothesis.js` 경로에 Hypothesis 임베드 + hypothesisConfig 스크립트를 두면 됩니다. (현재 `docs/assets/` 디렉토리는 빈 상태이므로 생성 필요)
3. 또는 외부 CDN (`https://hypothes.is/embed.js`)를 `extra_javascript`에 직접 등록해도 됩니다. 그 경우 [[reading-css-link-pattern]] 처럼 별도 init 스크립트가 필요하니 두 파일로 나눠 두는 편이 깔끔합니다.
4. `docs/contribute.md`는 현재 빈 placeholder("# 피드백 안내\n\n_피드백 통합 단계에서 작성됩니다._")입니다. 이걸 덮어쓰세요. nav에는 이미 등록되어 있습니다.
5. `docs/posts/2026-05-26-how-to-feedback.md`가 `../contribute.md`로 링크를 걸어 두었으니, contribute.md를 작성할 때 그 흐름을 받아 주세요.

## deploy-engineer에게

1. 빌드 명령: `python -m mkdocs build --strict` (또는 `mkdocs build --strict` — Actions Python 환경은 PATH 문제 없음)
2. 빌드 출력: 프로젝트 루트의 `site/` 디렉토리 — 이걸 `actions/deploy-pages`의 artifact 경로로 지정
3. `requirements.txt`로 의존성 설치: `pip install -r requirements.txt`
4. `mkdocs.yml`의 `site_url` placeholder를 사용자가 실제 값으로 바꿔야 함 — 사용자 절차서에 1항으로 명시 권장
5. `repo_url` / `repo_name`도 동일하게 placeholder. `content.action.edit` 기능을 쓰려면 이 값이 정확해야 함

## qa-reviewer에게

검증 포인트:
- [ ] `mkdocs build --strict` 통과 — **확인됨** (0.72s)
- [ ] 깨진 링크 없음 — strict 빌드 통과로 자동 검증됨
- [ ] nav 4섹션 모두 존재 (홈/소개/글/피드백 안내)
- [ ] 라이트/다크 토글 작동 (브라우저 확인 필요 시 `python -m mkdocs serve`)
- [ ] 한국어 폰트 적용 / `word-break: keep-all` 적용
- [ ] `docs/contribute.md`가 placeholder 상태인지 (feedback-integrator 작업 후 다시 확인)
- [ ] `extra_javascript`가 비어 있는지 (feedback-integrator 작업 후 채워질 예정)

## 미해결 / 다음 단계

- 실제 GitHub username/repo 미정 (사용자 입력 대기)
- hypothes.is 임베드 미구현 → feedback-integrator로 전달
- 배포 워크플로우 미작성 → deploy-engineer로 전달
