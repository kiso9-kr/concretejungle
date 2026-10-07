export const SITE = {
  name: 'Concrete Jungle Archive',
  logo: '/logo.svg',
  email: 'concretejungle_archive@gmail.com',
  instagram: 'concretejungle_archive',
};

// 메인 페이지에 이 순서대로 표시돼요 (첫 줄 2개, 둘째 줄 3개).
export const ARTISTS = [
  { slug: 'moon-go-america', name: 'Moon go America' },
  { slug: 'kiso9', name: 'Kiso9' },
  { slug: 'xevi', name: 'Xevi' },
  { slug: 'konbu', name: 'konbu' },
  { slug: 'sejung', name: 'Sejung' },
] as const;

export type Artist = (typeof ARTISTS)[number];

export const NEWS = 'news';

export function getArtist(slug: string): Artist | undefined {
  return ARTISTS.find((artist) => artist.slug === slug);
}

export function categoryLabel(category: string): string {
  return category === NEWS ? 'News' : (getArtist(category)?.name ?? category);
}
