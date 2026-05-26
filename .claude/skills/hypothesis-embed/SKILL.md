---
name: hypothesis-embed
description: Hypothesis(hypothes.is) annotation 시스템을 정적 사이트에 임베드하여 독자가 문단/문장 단위로 피드백을 남기게 만드는 작업 수행. embed.js 삽입, hypothesisConfig 설정, 그룹/공개 정책 결정, 독자 안내 페이지 작성을 포함. "문단별 피드백", "annotation", "독자 댓글", "주석 기능", "hypothes.is", "in-line 코멘트", "원고 검토" 같은 요청에 반드시 사용.
---

# Hypothesis Embed

## 언제 쓰는가

- 정적 사이트(MkDocs, Hugo, Jekyll, Docusaurus 등)에 문단/문장 단위 피드백 기능을 추가할 때
- 책 원고/문서 초안에 독자나 동료의 in-line 코멘트를 받을 때
- "로그인 부담 없이" 또는 "익명에 가까운" 피드백 채널이 필요할 때
- 기존 Hypothesis 임베드의 동작이 이상하거나 설정을 변경할 때

## 작업 순서

### 1. embed.js 삽입

`docs/assets/js/hypothesis.js` (MkDocs의 경우):
```javascript
(function() {
  var script = document.createElement('script');
  script.src = 'https://hypothes.is/embed.js';
  script.async = true;
  document.head.appendChild(script);
})();
```

`mkdocs.yml`:
```yaml
extra_javascript:
  - assets/js/hypothesis.js
```

다른 프레임워크면 `<head>` 또는 layout 템플릿의 동등한 위치에 같은 스크립트 태그를 넣는다.

### 2. (선택) hypothesisConfig — 동작 커스터마이징

같은 파일 하단에 추가:
```javascript
window.hypothesisConfig = function() {
  return {
    showHighlights: 'always',  // 'always' | 'whenSidebarOpen' | 'never'
    openSidebar: false,
    theme: 'clean',            // 'classic' | 'clean'
  };
};
```

비공개 그룹만 받으려면 `services` 항목으로 그룹 ID 지정. 그룹 ID는 hypothes.is에서 그룹 생성 후 URL에서 확인 가능 (`/groups/{ID}/`).

### 3. 독자 안내 페이지 (필수)

독자 대부분은 Hypothesis가 처음이다. 별도 페이지로 명확히 안내한다:
- 가입 절차 (30초, 이메일만)
- 의견 남기는 방법 (드래그 → 말풍선 → Annotate)
- 공개 범위 (Public / Only Me)
- 익명 폼 대안 (만약 있다면)

`docs/contribute.md` 예시는 site-builder/feedback-integrator 에이전트의 정의 파일 참조.

### 4. site_url 확인

`mkdocs.yml`의 `site_url` 또는 동등한 canonical URL 설정이 **실제 배포 URL과 정확히 일치**해야 한다. 일치하지 않으면 어노테이션이 다른 URL로 분산되어 독자들이 서로의 의견을 볼 수 없게 된다.

이유: Hypothesis는 페이지 URL을 어노테이션의 1차 anchor로 사용한다. http vs https, www 유무, trailing slash 차이 모두 다른 URL로 취급된다.

## 정책 선택 가이드

| 상황 | 권장 설정 |
|------|----------|
| 공개 초안에 누구나 의견 가능 | Public (기본값), 안내 페이지에 가입 방법 명시 |
| 베타 독자만 의견 | Hypothesis Group 생성 + 가입 링크 공유, `services` 설정 |
| 의견은 받되 공개 토론은 원치 않음 | Public + "Only Me 사용 권장" 안내 + 별도 폼 |
| 완전 익명 필수 | Hypothesis 단독 안 됨. 익명 폼(Google Form, Tally) 병행 |

## 콘텐츠 작성자에게 안내할 사항

Hypothesis는 페이지의 **텍스트 + DOM 구조**로 어노테이션 위치를 anchoring한다. 따라서:
- 한 번 공개한 문단의 텍스트를 크게 바꾸면 기존 어노테이션이 orphan 처리됨
- 단순 오탈자 수정 정도는 보통 anchoring이 유지됨
- 단락 순서를 바꾸거나 문단을 통째로 들어내면 reattach 실패 가능성 높음
- 그러므로 "공개 후 콘텐츠 큰 변경" 빈도가 높은 페이지에는 어노테이션 권장하지 않거나, 변경 정책을 독자에게 알릴 것

## 안티패턴

- embed.js를 모든 페이지에 넣되 site_url을 비워두기 → 어노테이션이 dev URL과 prod URL로 분산
- 콘텐츠를 자주 갈아엎으면서 어노테이션 기능을 켜두기 → orphan 어노테이션 폭증
- 익명 보장 약속 후 Hypothesis(가입 필요) 단독 적용 → 약속 위반
- 광고 차단기 사용자에게 안내 없음 → 일부 차단기가 hypothes.is를 차단
