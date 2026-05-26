---
name: reader-feedback-site
description: 독자가 로그인 부담 없이 문단별 피드백을 남기는 텍스트 콘텐츠 웹사이트를 MkDocs + Hypothesis + GitHub Pages 무료 조합으로 구축·확장·운영. site-builder / feedback-integrator / deploy-engineer / qa-reviewer 4인 에이전트 팀을 자동 오케스트레이션. 새 콘텐츠 추가, 사이트 수정, 피드백 설정 변경, 재배포, "다시 빌드", "원고 추가", "이전 결과 보완", "이 페이지 수정" 같은 후속 요청까지 모두 처리. 책 원고/매뉴얼/문서/뉴스레터 형식의 텍스트 사이트를 만들거나 운영할 때 반드시 사용.
---

# Reader Feedback Site — 오케스트레이터

이 스킬은 **MkDocs + Hypothesis + GitHub Pages** 무료 조합으로 독자 피드백 사이트를 구축·운영하는 전체 워크플로우를 4인 에이전트 팀으로 실행한다.

## 팀 구성

| 에이전트 | 역할 | 주 사용 스킬 |
|---------|------|------------|
| `site-builder` | MkDocs 골격, 테마, 가독성 CSS | `mkdocs-setup` |
| `feedback-integrator` | Hypothesis 임베드, 독자 안내 페이지 | `hypothesis-embed` |
| `deploy-engineer` | GitHub Pages + GH Actions 배포 | `github-pages-deploy` |
| `qa-reviewer` | 각 단계 incremental 검증 | (자체 검증) |

**실행 모드:** 에이전트 팀 (Phase 2-4)
- 4명이 협업하며 산출물을 상호 참조한다
- 산출물 전달은 `_workspace/` 파일 기반, 실시간 소통은 SendMessage
- 진행 추적은 TaskCreate / TaskUpdate

## Phase 0: 컨텍스트 확인 — 실행 모드 판정

워크플로우 진입 시 가장 먼저 다음을 확인한다:

1. `_workspace/` 디렉토리 존재 여부
2. 사용자 요청 유형 (신규 / 부분 수정 / 새 입력)

| 상황 | 모드 | 행동 |
|------|------|------|
| `_workspace/` 없음 | **초기 실행** | Phase 1부터 전체 워크플로우 실행 |
| `_workspace/` 있음 + 부분 수정 요청 (예: "Hypothesis 그룹만 변경", "이 페이지 추가") | **부분 재실행** | 해당 에이전트(들)만 다시 호출, 다른 산출물 보존 |
| `_workspace/` 있음 + 사이트 재구축 요청 | **새 실행** | 기존 `_workspace/`를 `_workspace_prev/`로 이동 후 Phase 1부터 재실행 |

부분 재실행 판정 표:
| 사용자 요청 키워드 | 호출 에이전트 |
|-------------------|--------------|
| "테마", "폰트", "가독성", "nav 변경", "콘텐츠 추가" | site-builder |
| "어노테이션", "Hypothesis", "그룹", "피드백 안내" | feedback-integrator |
| "배포", "도메인", "Actions", "워크플로우" | deploy-engineer |
| "검증", "빌드 확인", "QA", "버그" | qa-reviewer |

## Phase 1: 요구사항 정리 (초기 실행만)

사용자에게 다음 항목을 확인한다. 답이 없으면 합리적 기본값으로 진행:

- 사이트 제목 / 한 줄 설명
- 콘텐츠 챕터 구조 (대략 목차)
- 사이트 톤 (공식 문서 / 캐주얼 블로그 / 책 원고)
- 피드백 정책: 전체 공개 / 특정 그룹만 / 익명 폼 병행
- GitHub 리포지토리명 (없으면 placeholder)
- 커스텀 도메인 (없으면 `{user}.github.io/{repo}`)

## Phase 2: 팀 구성 + 초기 작업 분배

```
TeamCreate(team_name="reader-feedback-site", members=[
  "site-builder",
  "feedback-integrator",
  "deploy-engineer",
  "qa-reviewer"
])
```

작업 의존성:
1. `site-builder` (mkdocs.yml + docs/ 골격)  ← 시작점
2. `feedback-integrator` (Hypothesis 임베드)  ← site-builder 후
3. `deploy-engineer` (Actions 워크플로우)     ← site-builder 후 (parallel with feedback-integrator)
4. `qa-reviewer` (incremental 검증)            ← 각 단계 직후

TaskCreate로 4개 작업을 만들고 `addBlockedBy`로 의존성 명시.

**모든 Agent 호출에 `model: "opus"` 지정.**

## Phase 3: 실행 — 협업 흐름

```
[site-builder]
  → mkdocs.yml, docs/, requirements.txt, reading.css 생성
  → _workspace/01_site-builder_summary.md
  → SendMessage(feedback-integrator, deploy-engineer): "골격 완성"
  → qa-reviewer: build 검증 요청
       │
       ├─→ [feedback-integrator]
       │     → docs/assets/js/hypothesis.js, docs/contribute.md
       │     → mkdocs.yml의 extra_javascript 등록 (site-builder와 협의)
       │     → _workspace/02_feedback-integrator_summary.md
       │     → qa-reviewer: 임베드 검증 요청
       │
       └─→ [deploy-engineer]
             → .github/workflows/deploy.yml
             → 사용자 직접 절차서 작성
             → _workspace/03_deploy-engineer_summary.md
             → qa-reviewer: YAML 검증 요청

[qa-reviewer] (incremental, 각 단계 후 즉시)
  → _workspace/qa_*.log
  → 실패 시 해당 에이전트에게 즉시 SendMessage
  → 최종 _workspace/04_qa-reviewer_report.md
```

## Phase 4: 통합 산출물 정리

모든 검증 통과 후 사용자에게 다음을 보고:
1. 생성된 파일 트리 (최종 사이트 구조)
2. **사용자가 직접 해야 할 일** 체크리스트 (GitHub 리포 생성, Pages 활성화, DNS 등)
3. 로컬 미리보기 명령: `mkdocs serve` 후 `http://127.0.0.1:8000`
4. 첫 배포 후 검증 항목 (Hypothesis 사이드바, 어노테이션 동작)
5. 변경 이력 1줄 — CLAUDE.md에 추가

## 데이터 전달 프로토콜

| 전략 | 무엇을 |
|------|--------|
| 파일 기반 (`_workspace/`) | 모든 산출물·요약·QA 로그 |
| 태스크 기반 (TaskCreate) | 진행 추적, 의존성 |
| 메시지 기반 (SendMessage) | 단계 완료 통지, QA 실패 보고 |

`_workspace/` 파일명 규칙: `{phase}_{agent}_{artifact}.{ext}`
- 예: `01_site-builder_summary.md`, `qa_build.log`

## 에러 핸들링

| 에러 유형 | 전략 |
|----------|------|
| `mkdocs build --strict` 실패 | site-builder가 1회 재시도. 재실패 시 보고서에 명시하고 사용자 결정 요청. `--strict` 옵션을 임의로 제거하지 않음 |
| Hypothesis 동작 검증 실패 (자동화 불가) | qa-reviewer 보고서에 "사용자 직접 확인 필요" 항목으로 명시 |
| Actions 워크플로우 syntax 오류 | yamllint 결과 첨부, deploy-engineer 1회 재시도 |
| 에이전트 응답 없음 | 30초 대기 후 SendMessage 재시도. 2회 실패 시 산출물 없이 진행하되 보고서에 누락 명시 |
| 상충 데이터 (예: site-builder와 deploy-engineer가 다른 빌드 경로 가정) | 삭제하지 않고 둘 다 보고. 사용자가 결정 |

## 테스트 시나리오

### 정상 흐름 1: 신규 사이트 구축
- 입력: "독서 노트 사이트를 만들고 싶다. 5개 챕터, 카주얼 톤, 공개 피드백"
- 기대: 4개 에이전트가 순차/병렬 실행, `_workspace/` 4개 요약 파일 생성, 빌드 성공, 사용자에게 GitHub 절차서 전달

### 정상 흐름 2: 부분 재실행 (피드백 정책 변경)
- 입력: "비공개 베타 그룹으로 바꿔줘" (이미 사이트가 있는 상태)
- 기대: Phase 0에서 `_workspace/` 감지, feedback-integrator만 재호출, `hypothesis.js`의 services 설정 업데이트, 사용자에게 그룹 ID 입력 요청

### 에러 흐름 1: 빌드 실패
- 입력: 사용자가 임의로 추가한 .md 파일에 깨진 링크
- 기대: site-builder가 `--strict` 실패 감지 → qa-reviewer가 로그 분석 → SendMessage로 어느 파일·줄 번호인지 통지 → site-builder 수정 → 재빌드

### 에러 흐름 2: site_url 불일치
- 입력: 커스텀 도메인 연결 후 사용자가 `mkdocs.yml` 업데이트를 잊음
- 기대: qa-reviewer가 배포 후 site_url과 실제 URL 비교 → Hypothesis anchoring 분산 위험 보고 → site-builder에게 업데이트 요청

## 트리거 (description 보완)

다음 표현이 등장하면 반드시 이 스킬을 호출한다:
- "독자 피드백 사이트", "MkDocs 사이트 만들어", "원고 사이트 구축"
- "문단별 댓글", "in-line 코멘트", "Hypothesis 적용"
- "이 사이트에 챕터 추가", "이 페이지 수정", "다시 빌드", "재배포"
- "GitHub Pages 무료 배포", "정적 사이트 호스팅"

다음은 호출하지 않는다 (다른 스킬/도구가 적합):
- Next.js / React / 동적 사이트 → 일반 코드 어시스트
- 마크다운 파일 자체의 단순 편집 → Edit 도구 직접
- Hypothesis 자체에 대한 일반 질문 → WebFetch
