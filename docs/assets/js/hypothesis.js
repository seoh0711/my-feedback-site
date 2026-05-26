// Hypothesis Web Annotation — client config
// 실제 임베드 스크립트(https://hypothes.is/embed.js)는 mkdocs.yml의
// extra_javascript에서 함께 로드합니다. 이 파일은 동작만 커스터마이징합니다.
// 참고: https://web.hypothes.is/help/embedding-hypothesis-in-websites-and-platform/
window.hypothesisConfig = function () {
  return {
    // 사이드바 진입 시 자동 열림 방지 — 본문 가독성을 먼저 보여 주고,
    // 독자가 우상단 화살표를 눌러 직접 열도록 한다.
    openSidebar: false,

    // 다른 독자가 남긴 하이라이트를 항상 본문 위에 표시 →
    // "여기 이미 의견이 있구나"를 시각적으로 알 수 있게 한다.
    showHighlights: 'always',

    // 깔끔한 톤(Material 테마와 잘 어울림)
    theme: 'clean',

    // 사이드바 상단에 표시할 환영 메시지(한국어)
    branding: {
      appBackgroundColor: '#ffffff',
      ctaBackgroundColor: '#3f51b5',
      ctaTextColor: '#ffffff'
    }
  };
};
