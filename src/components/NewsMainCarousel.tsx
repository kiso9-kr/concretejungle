import Link from 'next/link';
import type { Post } from '@/lib/types';
import { newsPostHref } from '@/lib/posts';
import styles from './NewsList.module.css';

export default function NewsMainCarousel({ posts }: { posts: Post[] }) {
  return (
    <section className={styles.mainCarousel} aria-label="Main 뉴스">
      <ul className={styles.carouselTrack}>
        {posts.map((post) => (
          <li key={post.id} className={styles.carouselSlide}>
            <Link href={newsPostHref(post)} className={styles.carouselLink} aria-label={post.title}>
              <img src={post.images[0].url} alt={post.title} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
