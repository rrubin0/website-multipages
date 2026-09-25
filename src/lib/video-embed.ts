// Click-to-play YouTube thumbnail-to-iframe swap for VideoEmbed.astro.
// Ported from the i3dmg video-embed pattern: no iframe (and no third-party
// weight) exists until the visitor clicks. Static MPA site — init runs at
// load and on every astro:page-load; no ClientRouter swap handling needed.
export function buildYoutubeIframe(videoId: string, ariaLabel: string): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  iframe.title = ariaLabel || 'YouTube video player';
  iframe.allow =
    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.className = 'video-embed__frame';
  return iframe;
}

export function initVideoEmbeds(): void {
  document.querySelectorAll<HTMLButtonElement>('.video-embed__thumb').forEach((btn) => {
    if (btn.dataset.videoEmbedBound === 'true') return;
    btn.dataset.videoEmbedBound = 'true';

    btn.addEventListener('click', () => {
      const videoId = btn.dataset.videoId;
      if (!videoId) return;
      btn.replaceWith(buildYoutubeIframe(videoId, btn.getAttribute('aria-label') || ''));
    });
  });
}
