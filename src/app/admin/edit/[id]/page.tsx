'use client';

import { use, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import PostForm from '@/components/admin/PostForm';
import styles from '@/components/admin/admin.module.css';
import { firebaseClient } from '@/lib/firebase-client';
import { toPost } from '@/lib/posts';
import type { Post } from '@/lib/types';

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<Post | null>();

  useEffect(() => {
    getDoc(doc(firebaseClient().db, 'posts', id)).then(
      (snap) => setPost(snap.exists() ? toPost(snap.id, snap.data()) : null),
      () => setPost(null),
    );
  }, [id]);

  if (post === undefined) return <p className={styles.muted}>불러오는 중…</p>;
  if (post === null) return <p className={styles.error}>글을 찾을 수 없어요.</p>;
  return <PostForm initial={post} />;
}
