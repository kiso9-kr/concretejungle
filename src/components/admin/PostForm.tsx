'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { firebaseClient } from '@/lib/firebase-client';
import { deleteImages, uploadImage } from '@/lib/image-upload';
import { today } from '@/lib/posts';
import { ARTISTS, NEWS } from '@/lib/site';
import type { Post, PostLink, StoredImage } from '@/lib/types';
import styles from './admin.module.css';

// 이미 저장된 이미지(stored) 또는 새로 고른 파일(file)
type ImageItem = { key: string; url: string; stored?: StoredImage; file?: File };

const EMPTY_LINK: PostLink = { label: '', url: '' };

function normalizeUrl(url: string): string {
  const value = url.trim();
  return !value || /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
}

function saveErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;
  if (code === 'storage/unauthorized') {
    return 'Storage 권한이 없어요. 기본 Firestore DB의 admins UID 문서와 Storage 규칙을 확인해 주세요.';
  }
  if (code === 'storage/canceled') return '이미지 업로드가 취소됐어요.';
  if (code === 'storage/retry-limit-exceeded' || code === 'storage/unknown') {
    return '이미지 업로드 중 네트워크 오류가 발생했어요. 연결과 Firebase Storage 설정을 확인해 주세요.';
  }
  if (code?.startsWith('storage/')) return `이미지 업로드 오류 (${code}). Firebase Storage 설정을 확인해 주세요.`;
  return '저장하지 못했어요. 잠시 후 다시 시도해 주세요.';
}

export default function PostForm({ initial }: { initial?: Post }) {
  const router = useRouter();
  const [category, setCategory] = useState(initial?.category ?? NEWS);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [date, setDate] = useState(initial?.date || today());
  const [content, setContent] = useState(initial?.content ?? '');
  const [images, setImages] = useState<ImageItem[]>(() =>
    (initial?.images ?? []).map((image) => ({ key: image.url, url: image.url, stored: image })),
  );
  const [showInNews, setShowInNews] = useState(initial?.showInNews ?? false);
  const [main, setMain] = useState(initial?.main ?? false);
  const [links, setLinks] = useState<PostLink[]>(initial?.links.length ? initial.links : [EMPTY_LINK]);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const previews = useRef<string[]>([]);
  const isNews = category === NEWS;

  useEffect(() => () => previews.current.forEach((url) => URL.revokeObjectURL(url)), []);

  function addFiles(files: FileList | null) {
    const added = Array.from(files ?? []).map((file) => {
      const url = URL.createObjectURL(file);
      previews.current.push(url);
      return { key: url, url, file };
    });
    setImages((prev) => [...prev, ...added]);
  }

  function moveImage(index: number, delta: number) {
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(index + delta, 0, item);
      return next;
    });
  }

  function updateLink(index: number, field: keyof PostLink, value: string) {
    setLinks((prev) => prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setStatus('제목을 입력해 주세요.');
      return;
    }
    setSaving(true);
    try {
      const { db } = firebaseClient();
      const id = initial?.id ?? doc(collection(db, 'posts')).id;
      const total = images.filter((item) => item.file).length;
      const saved: StoredImage[] = [];
      let uploaded = 0;
      for (const item of images) {
        if (item.file) {
          const imageNumber = ++uploaded;
          setStatus(`이미지 준비 중… (${imageNumber}/${total})`);
          saved.push(
            await uploadImage(item.file, `posts/${id}`, (progress) => {
              setStatus(`${progress} (${imageNumber}/${total})`);
            }),
          );
        } else if (item.stored) {
          saved.push(item.stored);
        }
      }
      setStatus('저장 중…');
      const now = Date.now();
      await setDoc(doc(db, 'posts', id), {
        category,
        title: title.trim(),
        content: content.trim(),
        date,
        images: saved,
        links: isNews
          ? []
          : links.map((link) => ({ label: link.label.trim(), url: normalizeUrl(link.url) })).filter((link) => link.url),
        showInNews: !isNews && showInNews,
        main: (isNews || showInNews) && main,
        createdAt: initial?.createdAt || now,
        updatedAt: now,
      });
      const kept = new Set(saved.map((image) => image.path));
      await deleteImages((initial?.images ?? []).filter((image) => !kept.has(image.path)));
      router.push('/admin');
    } catch (err) {
      console.error(err);
      setStatus(saveErrorMessage(err));
      setSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className={styles.heading}>{initial ? '글 수정' : '새 글 쓰기'}</h1>

      <label className={styles.field}>
        <span>카테고리</span>
        <select name="category" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value={NEWS}>News</option>
          {ARTISTS.map((artist) => (
            <option key={artist.slug} value={artist.slug}>
              {artist.name}
            </option>
          ))}
        </select>
      </label>

      {!isNews && (
        <label className={styles.checkbox}>
          <input type="checkbox" name="showInNews" checked={showInNews} onChange={(e) => setShowInNews(e.target.checked)} />
          News에도 표시
        </label>
      )}

      {(isNews || showInNews) && (
        <label className={styles.checkbox}>
          <input type="checkbox" name="main" checked={main} onChange={(e) => setMain(e.target.checked)} />
          News 첫 줄에 표시 (Main)
        </label>
      )}

      {(isNews || showInNews) && (
        <label className={styles.field}>
          <span>날짜</span>
          {!isNews && <span className={styles.hint}>News 목록은 이 날짜 기준으로 최신순 정렬돼요.</span>}
          <input type="date" name="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
      )}

      <label className={styles.field}>
        <span>제목</span>
        <input name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>

      <div className={styles.field}>
        <span>{isNews ? '대표 이미지' : '이미지'}</span>
        <p className={styles.hint}>
          첫 번째 이미지가 {isNews ? 'News 목록' : showInNews ? '아티스트 페이지와 News 목록' : '아티스트 페이지'}의 썸네일로 쓰여요. 화살표로 순서를 바꿀 수 있어요.
        </p>
        {images.length > 0 && (
          <ul className={styles.imageList}>
            {images.map((item, index) => (
              <li key={item.key}>
                <img src={item.url} alt="" />
                <div className={styles.imageActions}>
                  <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} aria-label="앞으로">
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(index, 1)}
                    disabled={index === images.length - 1}
                    aria-label="뒤로"
                  >
                    →
                  </button>
                  <button type="button" onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}>
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      <label className={styles.field}>
        <span>내용</span>
        <textarea name="content" value={content} onChange={(e) => setContent(e.target.value)} rows={14} />
      </label>

      {!isNews && (
        <div className={styles.field}>
          <span>관련 링크</span>
          {links.map((link, index) => (
            <div key={index} className={styles.linkRow}>
              <input
                placeholder="표시할 이름 (예: Instagram)"
                value={link.label}
                onChange={(e) => updateLink(index, 'label', e.target.value)}
              />
              <input
                placeholder="https://"
                value={link.url}
                onChange={(e) => updateLink(index, 'url', e.target.value)}
              />
              <button type="button" className={styles.textButton} onClick={() => setLinks((prev) => prev.filter((_, i) => i !== index))}>
                삭제
              </button>
            </div>
          ))}
          <button type="button" className={styles.textButton} onClick={() => setLinks((prev) => [...prev, EMPTY_LINK])}>
            + 링크 추가
          </button>
        </div>
      )}

      <div className={styles.formActions}>
        <button type="submit" className={styles.button} disabled={saving}>
          저장
        </button>
        <Link href="/admin" className={styles.textButton}>
          취소
        </Link>
        {status && <span className={styles.muted}>{status}</span>}
      </div>
    </form>
  );
}
