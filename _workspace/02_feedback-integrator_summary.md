# Phase 2 — feedback-integrator 작업 요약

작성일: 2026-05-26
담당: feedback-integrator
상태: 완료 (`mkdocs build --strict` 통과)

## 생성/수정한 파일

| 경로 | 작업 | 역할 |
|------|------|------|
| `docs/assets/js/hypothesis.js` | 신규 | `window.hypothesisConfig` 정의 (사이드바 기본 닫힘 / 하이라이트 항상 표시 / clean 테마 / 브랜드 색) |
| `mkdocs.yml` | 부분 수정 | `extra_javascript`에 두 항목 등록 — 다른 키는 그대로 |
| `docs/contribute.md` | 덮어쓰기 | placeholder → 캐주얼 톤 독자 안내 페이지 본문 |

## mkdocs.yml 변경 내역 (해당 키만)

```yaml
extra_javascript:
  - assets/js/hypothesis.js          # config 먼저 정의
  - https://hypothes.is/embed.js     # embed 본체
```

**중요**: `assets/js/hypothesis.js`가 `embed.js`보다 **먼저** 등록되어야 한다.
embed.js 내부가 `window.hypothesisConfig`를 읽어 클라이언트를 초기화하기 때문이다.
순서가 뒤바뀌면 config가 무시되고 기본값으로 동작한다.

`nav`, `theme`, `plugins`, `markdown_extensions`, `extra_css`, `site_url` 등 site-builder가
세팅한 다른 키는 일절 건드리지 않았다.

## hypothesisConfig 키 선택 이유

| 키 | 값 | 이유 |
|----|-----|------|
| `openSidebar` | `false` | 본문 가독성을 먼저 보여주고, 독자가 직접 우상단 화살표를 눌러 열도록. 첫 진입 시 사이드바가 본문 가리는 일 방지. |
| `showHighlights` | `'always'` | 다른 독자의 하이라이트가 본문 위에 항상 보여야 "여기 이미 의견이 있구나"가 직관적으로 전달됨. (대안 `'whenSidebarOpen'`은 폐쇄적이라 협업 분위기 약화) |
| `theme` | `'clean'` | Material for MkDocs와 잘 어울리는 미니멀 톤. `classic`은 사이드바 테두리가 두꺼워 디자인이 충돌. |
| `branding.*` | indigo 계열 | Material 테마 indigo 팔레트와 색조 맞춤. 브랜딩 키는 호스트 사이트 통일감용 비공식 옵션이지만 안전하게 작동. |

**일부러 설정하지 **않은** 키**:
- `services` (그룹 지정) — 정책이 **전체 공개**이므로 기본 `__world__` 그룹 사용. 비공개 그룹 ID를 박지 않는다.
- `usernameUrl`, `editAnnotationsUrl` — 셀프호스팅 시에만 필요. 표준 hypothes.is 서버 사용 중.
- `assetRoot`, `sidebarAppUrl` — 셀프호스팅용. 미설정 시 hypothes.is가 알아서 처리.

## contribute.md 콘텐츠 골격

1. 한눈에 보기 (드래그 → 도구창 → Annotate/Highlight)
2. 사이드바 여는 법 (우상단 `<` 화살표)
3. 메모 남기는 법 (단계별)
4. 공개 범위 (기본 공개 / Only Me)
5. 계정과 익명성 — **닉네임만 공개되나 완전 익명은 아님** 명시
6. 행동 규약 — 스포일러/인신공격/저작권/스팸
7. FAQ — 광고 차단기, 모바일, 메모 삭제

posts/2026-05-26-how-to-feedback.md의 짧은 도입을 받아 자연스럽게 이어지도록 톤 정렬.

## 빌드 검증

```
> python -m mkdocs build --strict
INFO    -  Cleaning site directory
INFO    -  Building documentation to directory: .../site
INFO    -  Documentation built in 0.31 seconds
```

strict 통과. 경고/에러 0건. 깨진 링크 없음 (외부 `https://hypothes.is/signup`, `https://hypothes.is/`는 strict 검사 대상 아님).

## qa-reviewer 확인 항목

- [ ] `docs/contribute.md`가 placeholder("_피드백 통합 단계에서 작성됩니다._")가 **아니라** 본문이 들어 있는지
- [ ] `mkdocs.yml`의 `extra_javascript`에 정확히 두 항목 — `assets/js/hypothesis.js` (먼저), `https://hypothes.is/embed.js` (나중)
- [ ] `docs/assets/js/hypothesis.js`에 `window.hypothesisConfig = function () { ... }` 정의 존재
- [ ] `python -m mkdocs serve` 후 브라우저로 임의 페이지 접속 시 **우상단에 Hypothesis 화살표 버튼이 보이는지** (실 동작 검증)
- [ ] 문장 드래그 시 작은 도구창(Annotate/Highlight)이 뜨는지
- [ ] 사이드바 첫 진입에서 자동으로 열리지 **않는지** (`openSidebar: false` 검증)
- [ ] `contribute.md`가 nav에 "피드백 안내"로 노출되는지

## deploy-engineer에게

- `extra_javascript`에 외부 CDN(`https://hypothes.is/embed.js`)이 포함됨 → 빌드 시점에는 영향 없으나, **CSP**(Content Security Policy)를 설정할 일이 생기면 `script-src`에 `https://hypothes.is` 허용 필요.
- **`site_url` placeholder는 반드시 사용자가 실제 배포 URL로 치환해야** Hypothesis 어노테이션이 흩어지지 않는다 (URL이 어노테이션의 1차 anchor). 사용자 절차서에 강조 요청.

## content-author 가이드 (전달 권장)

- 한 번 공개한 문단의 본문을 **크게 다시 쓰면 기존 어노테이션이 orphan**이 된다. 단순 오탈자 수정 정도는 anchoring이 유지됨.
- 문단 순서를 통째로 바꾸는 편집은 어노테이션을 끊는다.
- 따라서 "공개 후 큰 개고침"이 예상되는 글에는 contribute.md의 주의 admonition을 본문에도 살짝 언급해 두는 편이 친절.

## 미해결 / 다음 단계

- deploy-engineer: 위의 site_url 강조 + (선택) CSP 메모 반영
- qa-reviewer: 위 체크리스트로 incremental 검증
