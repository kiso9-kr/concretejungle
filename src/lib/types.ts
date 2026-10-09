export interface StoredImage {
  url: string;
  path: string; // Firebase Storage 경로 (삭제할 때 사용)
}

export interface PostLink {
  label: string;
  url: string;
}

export interface Post {
  id: string;
  category: string; // 'news' 또는 아티스트 slug
  title: string;
  content: string;
  date: string; // YYYY-MM-DD
  images: StoredImage[]; // 첫 번째 이미지가 목록 썸네일
  links: PostLink[];
  showInNews: boolean; // 아티스트 글을 News 목록에도 표시
  main: boolean; // News 상단 캐러셀에 표시
  createdAt: number;
  updatedAt: number;
}

export interface ArtistProfile {
  slug: string;
  image: StoredImage | null;
  youtubeUrl: string;
}
