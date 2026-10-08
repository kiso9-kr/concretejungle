import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PostContent from '@/components/PostContent';
import PostImageSlider from '@/components/PostImageSlider';
import { getNewsNeighbors, getPost } from '@/lib/data';
import { formatDate, newsPostHref } from '@/lib/posts';
import { getArtist, NEWS } from '@/lib/site';
import styles from './post.module.css';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).id);
  return { title: post?.title };
}

export default async function PostPage({ params, searchParams }: Props) {
  const post = await getPost((await params).id);
  const isNews = post?.category === NEWS;
  if (!post || (!isNews && !getArtist(post.category))) notFound();

  // News 목록에서 들어온 글은 뒤로가기·이전글·다음글이 News 목록 기준이에요.
  const fromNews = isNews || (post.showInNews && (await searchParams).from === 'news');
  const backHref = fromNews ? '/?tab=news' : `/artists/${post.category}`;
  const neighbors = fromNews ? await getNewsNeighbors(post.id) : null;

  return (
    <article>
      <Link href={backHref} className={styles.back}>
        ← Back
      </Link>

      <header className={styles.header}>
        {isNews && post.date && (
          <time className={styles.date} dateTime={post.date}>
            {formatDate(post.date)}
          </time>
        )}
        <h1 className={styles.title}>{post.title}</h1>
      </header>

      {post.images.length > 0 && (
        <PostImageSlider images={post.images.map(({ url }) => ({ url }))} />
      )}

      {post.content && <PostContent text={post.content} />}

      {post.links.length > 0 && (
        <ul className={styles.links}>
          {post.links.map((link) => (
            <li key={link.url}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.label || link.url} ↗
              </a>
            </li>
          ))}
        </ul>
      )}

      {neighbors && (
        <nav className={styles.pager}>
          {neighbors.prev ? (
            <Link href={newsPostHref(neighbors.prev)} className={styles.pagerLink}>
              <span className={styles.pagerLabel}>← Previous</span>
              <span className={styles.pagerTitle}>{neighbors.prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {neighbors.next && (
            <Link href={newsPostHref(neighbors.next)} className={`${styles.pagerLink} ${styles.pagerNext}`}>
              <span className={styles.pagerLabel}>Next →</span>
              <span className={styles.pagerTitle}>{neighbors.next.title}</span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
