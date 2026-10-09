import type { Post } from '@/lib/types';
import NewsMainCarousel from './NewsMainCarousel';
import NewsPaginatedList from './NewsPaginatedList';

export default function NewsList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return <p className="empty">No news yet.</p>;

  const mainPosts = posts.filter((post) => post.main && post.images[0]);

  return (
    <>
      {mainPosts.length > 0 && <NewsMainCarousel posts={mainPosts} />}
      <NewsPaginatedList posts={posts} />
    </>
  );
}
