'use client';

import { useEffect, useRef, useState } from 'react';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import styles from '@/components/admin/admin.module.css';
import { firebaseClient } from '@/lib/firebase-client';
import { deleteImages, uploadImage } from '@/lib/image-upload';
import { toArtistProfile } from '@/lib/posts';
import { ARTISTS, type Artist } from '@/lib/site';
import type { ArtistProfile } from '@/lib/types';
import { youTubeId } from '@/lib/youtube';

export default function ArtistSettingsPage() {
  const [profiles, setProfiles] = useState<Map<string, ArtistProfile> | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getDocs(collection(firebaseClient().db, 'artists')).then(
      (snap) => setProfiles(new Map(snap.docs.map((d) => [d.id, toArtistProfile(d.id, d.data())]))),
      () => setError('아티스트 정보를 불러오지 못했어요.'),
    );
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!profiles) return <p className={styles.muted}>불러오는 중…</p>;

  return (
    <>
      <h1 className={styles.heading}>아티스트 설정</h1>
      <p className={styles.hint}>메인 페이지에 보이는 사진과 아티스트 페이지의 대표 유튜브 영상을 설정해요.</p>
      <div className={styles.artistList}>
        {ARTISTS.map((artist) => (
          <ArtistCard
            key={artist.slug}
            artist={artist}
            initial={profiles.get(artist.slug) ?? toArtistProfile(artist.slug, undefined)}
          />
        ))}
      </div>
    </>
  );
}

function ArtistCard({ artist, initial }: { artist: Artist; initial: ArtistProfile }) {
  const [saved, setSaved] = useState(initial);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState(initial.youtubeUrl);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const invalidUrl = youtubeUrl.trim() !== '' && !youTubeId(youtubeUrl);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  function pickFile(next: File | undefined) {
    setFile(next ?? null);
    setPreview(next ? URL.createObjectURL(next) : null);
    setStatus('');
  }

  async function save() {
    setSaving(true);
    setStatus(file ? '이미지 업로드 중…' : '저장 중…');
    try {
      const image = file ? await uploadImage(file, `artists/${artist.slug}`) : saved.image;
      const next: ArtistProfile = { slug: artist.slug, image, youtubeUrl: youtubeUrl.trim() };
      await setDoc(doc(firebaseClient().db, 'artists', artist.slug), {
        image: next.image,
        youtubeUrl: next.youtubeUrl,
        updatedAt: Date.now(),
      });
      if (file && saved.image) await deleteImages([saved.image]);
      setSaved(next);
      setFile(null);
      setPreview(null);
      if (fileInput.current) fileInput.current.value = '';
      setStatus('저장했어요.');
    } catch (err) {
      console.error(err);
      setStatus('저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  }

  const imageUrl = preview ?? saved.image?.url;

  return (
    <section className={styles.artistCard}>
      <div className={styles.artistImage}>{imageUrl ? <img src={imageUrl} alt="" /> : <span>사진 없음</span>}</div>
      <div className={styles.form}>
        <h2 className={styles.subheading}>{artist.name}</h2>
        <label className={styles.field}>
          <span>메인 페이지 사진</span>
          <input ref={fileInput} type="file" accept="image/*" onChange={(e) => pickFile(e.target.files?.[0])} />
        </label>
        <label className={styles.field}>
          <span>대표 유튜브 영상 링크</span>
          <input
            name="youtubeUrl"
            value={youtubeUrl}
            placeholder="https://www.youtube.com/watch?v=..."
            onChange={(e) => {
              setYoutubeUrl(e.target.value);
              setStatus('');
            }}
          />
          {invalidUrl && <span className={styles.error}>유튜브 영상 링크가 아니에요.</span>}
        </label>
        <div className={styles.formActions}>
          <button type="button" className={styles.button} onClick={save} disabled={saving || invalidUrl}>
            저장
          </button>
          {status && <span className={styles.muted}>{status}</span>}
        </div>
      </div>
    </section>
  );
}
