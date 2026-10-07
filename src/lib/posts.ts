import { NEWS } from './site';
import type { ArtistProfile, Post, StoredImage } from './types';

type Data = Record<string, unknown>;

const str = (value: unknown) => (typeof value === 'string' ? value : '');
const num = (value: unknown) => (typeof value === 'number' ? value : 0);

function toImage(value: unknown): StoredImage | null {
  const v = value as Data | null;
  return v && typeof v.url === 'string' ? { url: v.url, path: str(v.path) } : null;
}

export function toPost(id: string, data: Data): Post {
  const images = Array.isArray(data.images) ? data.images : [];
  const links = Array.isArray(data.links) ? data.links : [];
  return {
    id,
    category: str(data.category),
    title: str(data.title),
    content: str(data.content),
    date: str(data.date),
    images: images.map(toImage).filter((img): img is StoredImage => img !== null),
    links: links
      .map((link: Data) => ({ label: str(link?.label), url: str(link?.url) }))
      .filter((link) => link.url),
    showInNews: data.showInNews === true,
    createdAt: num(data.createdAt),
    updatedAt: num(data.updatedAt),
  };
}

export function toArtistProfile(slug: string, data: Data | undefined): ArtistProfile {
  return {
    slug,
    image: toImage(data?.image),
    youtubeUrl: str(data?.youtubeUrl),
  };
}

// 최신 글이 먼저 오도록 정렬 (날짜 → 작성 시각 순)
export function sortPosts(posts: Post[]): Post[] {
  return [...posts].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt,
  );
}

export function excerpt(text: string, max = 100): string {
  const chars = Array.from(text.replace(/\s+/g, ' ').trim());
  return chars.length > max ? `${chars.slice(0, max).join('')}…` : chars.join('');
}

export function formatDate(date: string): string {
  return date.replaceAll('-', '.');
}

export function today(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// News 목록에서 여는 글 주소. 아티스트 글은 ?from=news를 붙여서 뒤로가기가 News로 가요.
export function newsPostHref(post: Post): string {
  return post.category === NEWS ? `/posts/${post.id}` : `/posts/${post.id}?from=news`;
}
