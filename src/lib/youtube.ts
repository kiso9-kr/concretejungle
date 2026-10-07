const VIDEO_ID = /^[\w-]{11}$/;

// watch?v=, youtu.be/, embed/, shorts/, live/ 형식의 링크에서 영상 ID를 꺼내요.
export function youTubeId(link: string): string | null {
  let url: URL;
  try {
    url = new URL(link.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www|m)\./, '');
  let id: string | null = null;
  if (host === 'youtu.be') {
    id = url.pathname.slice(1);
  } else if (host === 'youtube.com' || host === 'music.youtube.com' || host === 'youtube-nocookie.com') {
    id = url.pathname === '/watch'
      ? url.searchParams.get('v')
      : (url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/]+)/)?.[1] ?? null);
  }
  return id && VIDEO_ID.test(id) ? id : null;
}
