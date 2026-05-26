# Phase 4 — qa-reviewer 종합 보고서

작성일: 2026-05-26
담당: qa-reviewer
대상: site-builder / feedback-integrator / deploy-engineer 산출물
모드: incremental 검증 (단계별 분리)

## 1. 한 줄 요약

**모든 자동 검증 항목 PASS.** Stage 1(site-builder), Stage 2(feedback-integrator), Stage 3(deploy-engineer) 전부 통과했고, 실제 어노테이션 UX 동작은 사용자 직접 확인이 필요한 항목으로 별도 정리.

## 2. 통과/실패 매트릭스

| Stage | 담당 | 자동 검증 결과 | 비고 |
|---|---|---|---|
| 1 | site-builder | PASS (10/10) | `mkdocs build --strict` 0.31s, 경고 0건 |
| 2 | feedback-integrator | PASS (7/7) | hypothesisConfig 정의, 스크립트 순서, contribute.md 본문, nav 노출 |
| 3 | deploy-engineer | PASS (7/7) | YAML 파싱, 권한/액션 버전/concurrency/needs 관계 모두 정상 |
| 4 | 사용자 직접 확인 | (자동화 불가) | 첫 배포 후 별도 점검 필요 |

자세한 항목별 로그:
- `_workspace/qa_stage1_build.log`
- `_workspace/qa_stage2_hypothesis.log`
- `_workspace/qa_stage3_deploy.log`

## 3. 핵심 동작 검증 하이라이트

### 빌드 (가장 중요한 정합성)
```
python -m mkdocs build --strict
INFO    -  Documentation built in 0.31 seconds
```
- exit 0, 경고/에러 0건
- 깨진 내부 링크 0건 (`--strict`에 의해 자동 차단됨)
- 출력 site/에 index.html / contribute/index.html / posts/* / assets/js/hypothesis.js / stylesheets/reading.css 모두 생성

### Hypothesis 스크립트 로드 순서 (가장 흔한 임베드 오류 지점)
빌드된 `site/index.html`에서 추출한 실제 script src 순서:
```
['assets/js/hypothesis.js', 'https://hypothes.is/embed.js']
```
- config가 embed보다 먼저 로드됨 → hypothesisConfig가 정상적으로 인식될 조건 충족.
- 순서가 뒤집혔다면 모든 hypothesisConfig 옵션이 무시되는 흔한 함정인데, 여기서는 회피됨.

### 경계면 교차 검증 (서로 다른 파일이 동일 합의를 지키는지)
| 합의점 | A | B | 일치? |
|---|---|---|---|
| Hypothesis config 경로 | mkdocs.yml의 `assets/js/hypothesis.js` | 실제 파일 `docs/assets/js/hypothesis.js` | OK |
| 빌드 artifact 경로 | workflow의 `path: site` | mkdocs 기본 출력 `site/` | OK |
| 의존성 매니페스트 | workflow의 `pip install -r requirements.txt` | 리포 루트 `requirements.txt` 존재 | OK |
| Python 버전 | workflow `3.12` | site-builder 로컬 `3.12.4` | OK (마이너 일치) |
| 빌드 명령 옵션 | workflow `mkdocs build --strict` | site-builder가 strict로 검증 | OK |
| 공개 정책 | 요구사항 "전체 공개" | hypothesis.js에 `services`/`groups` 키 부재 | OK |
| nav ↔ 실제 파일 | nav의 모든 .md 항목 | docs/ 내 실제 파일 | OK (strict 빌드가 검증) |

## 4. 발견된 이슈

### 차단(Blocking) — 없음

### 비차단 메모 (개선/주의)
1. **mkdocs.yml의 `<YOUR_GITHUB_USERNAME>` / `<YOUR_REPO>` placeholder가 site/index.html에도 그대로 직조**됨. 이는 의도된 동작 (`USER_ACTIONS.md` 2번에서 사용자가 치환). 다만 사용자가 이 단계를 건너뛰고 push하면 첫 배포의 canonical URL이 깨져 Hypothesis 어노테이션이 분산된다. USER_ACTIONS.md에 강조되어 있어서 OK이지만, 첫 배포 직후 qa는 반드시 이 항목을 점검해야 한다.

2. **PyYAML이 `on:` 키를 boolean True로 파싱하는 알려진 현상.** GitHub Actions 런너는 정상 인식하므로 배포 동작에는 영향 없음. 보고용 메모로만 기록.

3. **외부 CDN(`https://hypothes.is/embed.js`)에 대한 의존**이 있다. 추후 CSP를 도입하면 `script-src`에 `https://hypothes.is`를 명시해야 함. 현재는 CSP 미설정이라 무관.

## 5. 사용자 직접 확인 필요 항목 (자동화 불가)

USER_ACTIONS.md 1~5단계를 완료한 **첫 배포 직후** 다음 항목을 확인하세요. 자동화가 어렵거나 불가능합니다.

### 배포 인프라
- [ ] Actions 탭에서 `build` → `deploy` 두 job 모두 초록 체크 (1~3분)
- [ ] `https://<user>.github.io/<repo>/` 접속 성공 (HTTPS 자물쇠)
- [ ] `/sitemap.xml` 200 OK
- [ ] 존재하지 않는 경로 접근 시 `/404.html` 정상 표시
- [ ] 모바일 뷰포트(폭 ~375px)에서 nav/본문 가독성

### Hypothesis UX
- [ ] 페이지 우상단에 Hypothesis **화살표(`<`) 아이콘** 표시
- [ ] 화살표 클릭 시 사이드바 펼쳐짐
- [ ] 본문 텍스트 드래그 시 **Annotate / Highlight 도구창** 출현
- [ ] 첫 진입 시 사이드바가 자동으로 열리지 **않음** (`openSidebar: false` 검증)
- [ ] 어노테이션 저장 후 페이지 새로고침 시 어노테이션 재로드됨
- [ ] 브라우저 콘솔에 에러 없음 (특히 CSP / mixed content / hypothes.is 차단 관련)

### URL 정합성 (Hypothesis anchoring의 1차 키)
- [ ] `mkdocs.yml`의 `site_url`이 실제 배포 URL과 정확히 일치
- [ ] 페이지 소스의 `<link rel="canonical">`이 `site_url`을 가리킴
- [ ] 커스텀 도메인 연결 시 `site_url`도 같이 업데이트했는가

## 6. 다음 단계 권장

1. **사용자**: USER_ACTIONS.md 1~5단계 실행 (리포 생성 → placeholder 치환 → push → Pages 활성화 → 배포 확인)
2. **사용자**: 위 "사용자 직접 확인 필요" 체크리스트로 첫 배포 직후 검증
3. **추후 콘텐츠 작업 시**: 한 번 공개한 문단을 크게 다시 쓰면 어노테이션이 orphan이 될 수 있음 (feedback-integrator 인계 메모). 큰 개고침은 공개 전 마무리하고, 공개 후에는 단순 오탈자 수정 정도로 한정 권장.
4. **선택 사항**: 커스텀 도메인 연결 시 USER_ACTIONS.md "(선택) 커스텀 도메인" 섹션 따라가기. 도메인 변경 시 `site_url`도 동시에 갱신해야 어노테이션이 분산되지 않음.

## 7. 자동 검증의 한계 (정직성)

다음은 이번 incremental 검증의 자동화 한계:
- 실제 브라우저에서의 어노테이션 저장/재로드는 자동화하지 않음 (Hypothesis 서버 의존, 계정 필요).
- `mkdocs serve`로 로컬 서버를 띄워 시각적 확인을 하는 단계는 자동 도구로 캡처하지 않음 (사용자 직접 확인 권장).
- GitHub Actions 실제 실행은 push 후에만 확인 가능 (정적 YAML 검증으로 대체).
- 광고 차단기/모바일 브라우저별 호환성은 환경 의존.

위 항목들은 `사용자 직접 확인 필요` 섹션에 모두 정리되어 있습니다.

---

**최종 결론**: 세 에이전트의 산출물은 자동 검증 기준으로 **전부 통과**. 차단 요소 없음. 사용자가 USER_ACTIONS.md 절차를 따라 첫 배포를 진행하면 됩니다.
