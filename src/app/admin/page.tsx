'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import styles from '@/components/admin/admin.module.css';
import { firebaseClient } from '@/lib/firebase-client';
import { deleteImages } from '@/lib/image-upload';
import { sortPosts, toPost } from '@/lib/posts';
import { ARTISTS, categoryLabel, NEWS } from '@/lib/site';
import type { Post } from '@/lib/types';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    getDocs(collection(firebaseClient().db, 'posts')).then(
      (snap) => setPosts(sortPosts(snap.docs.map((d) => toPost(d.id, d.data())))),
      () => setError('글 목록을 불러오지 못했어요.'),
    );
  }, []);

  async function remove(post: Post) {
    if (!confirm(`"${post.title}" 글을 삭제할까요? 되돌릴 수 없어요.`)) return;
    try {
      await deleteDoc(doc(firebaseClient().db, 'posts', post.id));
      await deleteImages(post.images);
      setPosts((prev) => prev?.filter((p) => p.id !== post.id) ?? null);
    } catch {
      alert('삭제하지 못했어요. 잠시 후 다시 시도해 주세요.');
    }
  }

  if (error) return <p className={styles.error}>{error}</p>;
  if (!posts) return <p className={styles.muted}>불러오는 중…</p>;

  const visible = filter === 'all' ? posts : posts.filter((post) => post.category === filter);

  return (
    <>
      <div className={styles.toolbar}>
        <h1 className={styles.heading}>글 목록</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="카테고리 필터">
          <option value="all">전체 ({posts.length})</option>
          {[NEWS, ...ARTISTS.map((a) => a.slug)].map((category) => (
            <option key={category} value={category}>
              {categoryLabel(category)} ({posts.filter((p) => p.category === category).length})
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <p className={styles.muted}>글이 없어요.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>카테고리</th>
              <th>제목</th>
              <th>날짜</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {visible.map((post) => (
              <tr key={post.id}>
                <td className={styles.nowrap}>
                  {categoryLabel(post.category)}
                  {post.showInNews && <span className={styles.muted}> · News</span>}
                  {post.main && <span className={styles.muted}> · Main</span>}
                </td>
                <td>
                  <Link href={`/posts/${post.id}`} target="_blank" className={styles.underline}>
                    {post.title}
                  </Link>
                </td>
                <td className={styles.nowrap}>{post.date}</td>
                <td className={`${styles.nowrap} ${styles.actions}`}>
                  <Link href={`/admin/edit/${post.id}`} className={styles.textButton}>
                    수정
                  </Link>
                  <button type="button" className={`${styles.textButton} ${styles.danger}`} onClick={() => remove(post)}>
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
