export const FALLBACK_LOGO = '/logo-tintuc247.svg';

export function getArticleImage(article = {}) {
  return article.imageUrl || FALLBACK_LOGO;
}

export function useFallbackImage(event) {
  if (event.currentTarget.src.endsWith(FALLBACK_LOGO)) return;
  event.currentTarget.src = FALLBACK_LOGO;
  event.currentTarget.classList.add('fallback-logo-image');
}
