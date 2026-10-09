'use client';

import Link from 'next/link';
import { useState } from 'react';
import { excerpt, newsPostHref } from '@/lib/posts';
import { categoryLabel, NEWS } from '@/lib/site';
import type { Post } from '@/lib/types';
import styles from './NewsList.module.css';

const POSTS_PER_PAGE = 3;

export default function NewsPaginatedList({ posts }: { posts: Post[] }) {
  const [page, setPage] = useState(1);
  const pageCount = Math.ceil(posts.length / POSTS_PER_PAGE);
  const pagePosts = posts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  return (
    <>
      <ul className={styles.list}>
        {pagePosts.map((post) => (
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
      {pageCount > 1 && (
        <nav className={styles.pagination} aria-label="News 목록 페이지">
          {Array.from({ length: pageCount }, (_, index) => {
            const pageNumber = index + 1;
            return (
              <button
                key={pageNumber}
                type="button"
                className={page === pageNumber ? styles.currentPage : styles.pageButton}
                aria-current={page === pageNumber ? 'page' : undefined}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            );
          })}
        </nav>
      )}
    </>
  );
}
