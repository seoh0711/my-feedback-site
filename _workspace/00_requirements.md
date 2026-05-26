# Phase 1 — 요구사항 정리

작성일: 2026-05-26
모드: 초기 실행 (신규 사이트 구축)

## 사용자 응답 요약

| 항목 | 값 |
|------|-----|
| 콘텐츠 톤 | 캐주얼 블로그/뉴스레터 |
| Hypothesis 피드백 정책 | 전체 공개 (기본) — 누구나 hypothes.is 로그인 후 공개 그룹에 어노테이션 |
| GitHub 리포지토리 / 도메인 | 미정 — placeholder로 진행 |
| 사이트 제목 | 임시 제목으로 진행 |

## 합리적 기본값 (사용자 미입력 항목)

- **사이트 제목**: `독자 피드백 사이트` (mkdocs.yml `site_name`)
- **한 줄 설명**: `독자가 문단별로 의견을 남기는 텍스트 콘텐츠 사이트` (mkdocs.yml `site_description`)
- **GitHub 사용자명**: `<YOUR_GITHUB_USERNAME>` (placeholder)
- **GitHub 리포지토리**: `<YOUR_REPO>` (placeholder)
- **site_url**: `https://<YOUR_GITHUB_USERNAME>.github.io/<YOUR_REPO>/`
- **콘텐츠 구조 (초기)**:
  - `index.md` — 사이트 소개
  - `about.md` — 저자/연재 소개
  - `posts/` — 글 디렉토리 (샘플 글 1~2개 포함)
    - `posts/2026-05-26-welcome.md` — 첫 글 샘플
    - `posts/2026-05-26-how-to-feedback.md` — 피드백 사용법 안내 (느슨하게)
  - `contribute.md` — 피드백 안내 페이지 (feedback-integrator가 작성)

- **nav 스타일**: 시간순/카테고리 nav (블로그 톤). Material 테마 `navigation.tabs` 활성화.
- **테마**: Material for MkDocs, 라이트/다크 토글, 한국어 가독성 CSS 포함
- **Hypothesis 그룹**: `__world__` (공개 그룹). `services` 명시 안 함 (기본 공개).

## 작업 분배 (Phase 2)

1. **site-builder** — mkdocs.yml, docs/ 골격, reading.css, requirements.txt
2. **feedback-integrator** — Hypothesis 임베드 JS, contribute.md (site-builder 후)
3. **deploy-engineer** — .github/workflows/deploy.yml, 사용자 절차서 (site-builder 후, feedback-integrator와 병렬)
4. **qa-reviewer** — 각 단계 후 incremental 검증

## 사용자가 나중에 채워야 할 placeholder

- `<YOUR_GITHUB_USERNAME>` — GitHub 사용자명
- `<YOUR_REPO>` — 리포지토리 이름
- `mkdocs.yml`의 `site_name`, `site_description`, `site_url`, `repo_url`
- (선택) 커스텀 도메인 사용 시 `docs/CNAME` 추가
