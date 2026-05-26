# Phase 3 — deploy-engineer 작업 요약

작성일: 2026-05-26
담당: deploy-engineer
상태: 완료 (워크플로우 YAML 문법 검증 통과)

## 생성한 파일

| 경로 | 역할 |
|------|------|
| `.github/workflows/deploy.yml` | GitHub Actions 워크플로우 — main push/workflow_dispatch 트리거, build → deploy 2-job |
| `_workspace/USER_ACTIONS.md` | 사용자가 직접 해야 할 6단계 + 커스텀 도메인 가이드 + FAQ |
| `_workspace/03_deploy-engineer_summary.md` | (이 파일) |

## 핵심 결정

### 액션 버전 (안정 stable 채택)
- `actions/checkout@v4`
- `actions/setup-python@v5` (cache: pip)
- `actions/configure-pages@v5`
- `actions/upload-pages-artifact@v3`
- `actions/deploy-pages@v4`

### 배포 방식: GitHub Actions 공식 Pages flow
- `mkdocs gh-deploy` (gh-pages 브랜치 push 방식) **사용 안 함**
- 이유: 빌드 환경을 CI에서 통제, 누가 무엇을 배포했는지 PR/Actions 기록으로 추적, 권한 관리 명확

### permissions (최소권한)
```yaml
contents: read       # 리포 체크아웃
pages: write         # Pages artifact 업로드
id-token: write      # OIDC 인증(deploy-pages 액션 요구사항)
```
이 3개가 빠지면 `deploy-pages`가 권한 오류로 실패함.

### concurrency 정책
```yaml
group: pages
cancel-in-progress: false
```
**`cancel-in-progress: false`** 채택. 이유: 빠른 연속 push 시 앞 배포가 중단되면 그 push의 결과물이 영구히 게시되지 않음. Pages 환경 자체가 deploy 동시성을 1로 제한하므로 큐잉만 되고 손실 없음.

### Python 버전
- `3.12` (site-builder의 로컬 환경과 일치)

### 빌드 명령
- `mkdocs build --strict` — strict 유지. 깨진 링크/누락 파일이 운영에 새지 않게.

### artifact path
- `path: site` (mkdocs 기본 출력 디렉토리, site-builder 빌드와 동일)

## 검증 결과

```
python -c "import yaml; d = yaml.safe_load(open('.github/workflows/deploy.yml')); ..."
OK
jobs: ['build', 'deploy']
permissions: {'contents': 'read', 'pages': 'write', 'id-token': 'write'}
```
- YAML 문법 통과
- jobs/permissions 구조 정상

## 제약 준수

- 유료 서비스 안내 0건 (Public 리포 + GitHub Pages만 사용)
- 새 Python 의존성 0개 (site-builder의 `requirements.txt` 그대로 사용)
- `mkdocs.yml` 수정 0건 (feedback-integrator 작업 영역 침범 회피)
- 사용자 placeholder 치환은 USER_ACTIONS.md 2번 단계에 명시

## qa-reviewer에게 — 배포 후 검증 체크리스트

배포가 실제로 일어난 뒤(사용자가 USER_ACTIONS.md 1~5단계 수행 완료 후) 다음을 점검:

- [ ] Actions 탭에서 `build` → `deploy` 두 job 모두 성공
- [ ] `deploy` job의 output URL이 정상 접속됨 (`https://{user}.github.io/{repo}/`)
- [ ] HTTPS로 정상 접속 (자물쇠 표시)
- [ ] `/sitemap.xml` 접근 가능
- [ ] `/404.html` 정상 (존재하지 않는 경로 접근 시 표시)
- [ ] 모바일 뷰포트(폭 ~375px)에서 nav/본문 가독성
- [ ] Hypothesis 사이드바 우측 화살표 표시 + 어노테이션 저장 후 새로고침 시 보존
- [ ] `mkdocs.yml`의 `site_url`과 실제 배포 URL이 정확히 일치 (Hypothesis anchoring 분산 방지)
- [ ] `view source`에서 canonical link가 `site_url`을 가리키는지

배포 전 정적 검증(현재 시점에서 가능한 것):
- [ ] `.github/workflows/deploy.yml` YAML 문법 — **통과**
- [ ] requirements.txt 존재 — **확인됨**
- [ ] `mkdocs build --strict`가 로컬에서 통과 — site-builder가 확인
- [ ] `mkdocs.yml`에 아직 `<YOUR_GITHUB_USERNAME>` placeholder가 남아 있는지 (USER_ACTIONS 2번 단계가 사용자에게 명시되어 있는지) — **명시됨**

## 미해결 / 다음 단계

- 실제 GitHub 사용자명/리포명 확정 → 사용자가 USER_ACTIONS.md 2번 단계에서 치환
- 커스텀 도메인 사용 여부 → 사용자 결정에 따라 USER_ACTIONS.md "선택" 섹션 진행
- 배포 후 qa-reviewer가 위 체크리스트 실행

## 비용 노트

| 항목 | 무료 한도 | 예상 사용량 |
|------|----------|------------|
| GitHub Pages (Public) | 100GB/월 트래픽 | 일반 도서/블로그 수준에서 충분 |
| GitHub Actions (Public) | 무제한 | 워크플로우 1회 ≈ 2~3분 |
| Hypothesis | 무제한 | - |
| Let's Encrypt HTTPS | 무료 | - |

**합계: 0원/월** — 0원 운영 원칙 준수.
