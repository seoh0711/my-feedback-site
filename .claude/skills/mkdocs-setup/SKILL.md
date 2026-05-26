---
name: mkdocs-setup
description: MkDocs 기반 정적 사이트의 초기 설정, mkdocs.yml 작성, Material 테마 적용, 한국어 가독성 최적화 CSS 작성, requirements.txt 구성 작업 수행. 정적 사이트 빌더로 텍스트 콘텐츠 페이지를 만들거나, 도서/문서/블로그/매뉴얼 형식의 웹사이트 골격이 필요할 때, MkDocs/Material for MkDocs/정적 사이트 등의 언급이 있을 때 반드시 사용.
---

# MkDocs Setup

## 언제 쓰는가

- 새 MkDocs 사이트를 초기화할 때 (mkdocs.yml + docs/ 구조 잡기)
- 기존 사이트에 새 챕터/섹션을 추가할 때
- 테마 변경, 한국어 가독성 개선, 플러그인 추가가 필요할 때
- "텍스트 위주 정적 사이트", "도서 형식", "문서 사이트"라는 표현이 등장할 때

## 작업 순서

### 1. 의존성 정의 (requirements.txt)

```
mkdocs>=1.6.0
mkdocs-material>=9.5.0
pymdown-extensions>=10.0
```

추가 플러그인이 필요한 경우만 라인 추가. 기본은 위 3개로 충분하다.

### 2. mkdocs.yml 작성

핵심 결정 사항:
- `site_name`, `site_description`, `site_url` (canonical URL — Hypothesis 정상 동작에 필수)
- 테마: `material` (기본), `language: ko`
- 폰트: 한국어 가독성 = Noto Sans KR / Pretendard
- 팔레트: 라이트/다크 둘 다 제공, 토글 가능
- features: `navigation.instant`, `navigation.top`, `search.suggest`, `content.code.copy`, `toc.follow` 등 가독성과 탐색에 도움이 되는 것 위주

이유: Material for MkDocs는 한국어 검색을 위해 `lang: [ko, en]` 설정이 필요. 안 그러면 한국어 검색 결과가 부정확.

### 3. 디렉토리 골격

```
mkdocs.yml
requirements.txt
docs/
├── index.md
├── assets/
│   ├── css/reading.css
│   └── js/hypothesis.js  (feedback-integrator가 채움)
└── {챕터}.md
```

### 4. 가독성 CSS (reading.css)

본문 폰트, 줄간격, 본문 너비를 한국어 장문 콘텐츠에 맞게 조정한다:

```css
:root {
  --md-text-font: "Noto Sans KR", "Pretendard", -apple-system, BlinkMacSystemFont, sans-serif;
}

.md-content {
  font-size: 17px;
  line-height: 1.8;
}

.md-typeset p {
  text-align: left;
  word-break: keep-all;
  overflow-wrap: anywhere;
  max-width: 70ch;
}

.md-typeset h1, .md-typeset h2, .md-typeset h3 {
  font-weight: 700;
  letter-spacing: -0.01em;
}

@media (max-width: 76.234375em) {
  .md-content { font-size: 16px; }
}
```

이유: 한국어는 `word-break: keep-all`이 없으면 단어가 어색하게 깨진다. 본문 폭 70ch는 한 줄 약 35~40자 정도로 장문 읽기에 적당.

### 5. 빌드 검증

```bash
pip install -r requirements.txt
mkdocs build --strict
```

`--strict`는 경고를 에러로 처리한다. 미사용 페이지, 깨진 링크, 누락 파일을 잡아준다. 이 단계를 건너뛰지 말 것.

## 자주 묻는 결정

| 질문 | 권장 |
|------|------|
| Material 무료 vs Insiders | 무료. Insiders는 후원자만, 무료 운영 원칙에 어긋남 |
| 검색 한국어 인덱싱 | `plugins.search.lang: [ko, en]` 필수 |
| nav 구조 자동 vs 수동 | 콘텐츠 5개 이하면 자동, 그 이상은 수동 정의가 가독성 좋음 |
| 다크모드 | 토글 제공 (위 mkdocs.yml 템플릿 기본 포함) |

## 안티패턴

- `--strict` 빌드 실패를 회피하려고 옵션을 빼는 것
- 한국어 가독성 무시한 영문 테마 기본값 그대로 사용
- nav 없이 자동 정렬에 맡겨 챕터 순서가 알파벳순으로 뒤바뀌는 것
- `site_url` 비워두기 (Hypothesis anchoring 분산의 원인)
