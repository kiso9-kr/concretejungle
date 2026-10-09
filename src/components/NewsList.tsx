import Link from 'next/link';
import { excerpt, newsPostHref } from '@/lib/posts';
import { categoryLabel, NEWS } from '@/lib/site';
import type { Post } from '@/lib/types';
import NewsMainCarousel from './NewsMainCarousel';
import styles from './NewsList.module.css';

export default function NewsList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return <p className="empty">No news yet.</p>;

  const mainPosts = posts.filter((post) => post.main && post.images[0]);

  return (
    <>
      {mainPosts.length > 0 && <NewsMainCarousel posts={mainPosts} />}
      {posts.length > 0 && (
        <ul className={styles.list}>
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={newsPostHref(post)} className={styles.item}>
                <div className={styles.thumb}>{post.images[0] && <img src={post.images[0].url} alt="" />}</div>
                <div>
                  {post.category !== NEWS && <p className={styles.category}>{categoryLabel(post.category)}</p>}
                  <h2 className={styles.title}>{post.title}</h2>
                  <p className={`${styles.excerpt} ${styles.desktopExcerpt}`}>{excerpt(post.content)}</p>
                  <p className={`${styles.excerpt} ${styles.mobileExcerpt}`}>{excerpt(post.content, 80)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
