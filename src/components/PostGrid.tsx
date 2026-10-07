import Link from 'next/link';
import type { Post } from '@/lib/types';
import styles from './PostGrid.module.css';

export default function PostGrid({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return <p className="empty">No posts yet.</p>;

  return (
    <ul className={styles.grid}>
      {posts.map((post) => (
        <li key={post.id}>
          <Link href={`/posts/${post.id}`} className={styles.card}>
            {post.images[0] ? <img src={post.images[0].url} alt={post.title} /> : <div className={styles.placeholder} />}
            <span className={post.images[0] ? styles.title : `${styles.title} ${styles.visible}`}>{post.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
