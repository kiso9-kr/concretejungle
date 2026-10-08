// 서버 컴포넌트에서 게시물을 읽는 함수들 (공개 읽기 전용).
import { cache } from 'react';
import { connection } from 'next/server';
import { getApps, initializeApp } from 'firebase/app';
import {
  collection,
  connectFirestoreEmulator,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where,
  type Firestore,
} from 'firebase/firestore/lite';
import { FIRESTORE_DATABASE_ID, firebaseConfig, emulatorsEnabled, isFirebaseConfigured } from './firebase-config';
import { sortPosts, toArtistProfile, toPost } from './posts';
import type { ArtistProfile, Post } from './types';
import { getArtist, NEWS } from './site';

const APP_NAME = 'server';

function db(): Firestore {
  const existing = getApps().find((app) => app.name === APP_NAME);
  if (existing) return getFirestore(existing, FIRESTORE_DATABASE_ID);
  const firestore = getFirestore(initializeApp(firebaseConfig, APP_NAME), FIRESTORE_DATABASE_ID);
  if (emulatorsEnabled) connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
  return firestore;
}

// 매 요청마다 최신 글을 읽도록 프리렌더링을 막아요.
async function firestore(): Promise<Firestore> {
  await connection();
  return db();
}

export async function getPostsByCategory(category: string): Promise<Post[]> {
  if (!isFirebaseConfigured) return [];
  const snap = await getDocs(query(collection(await firestore(), 'posts'), where('category', '==', category)));
  return sortPosts(snap.docs.map((d) => toPost(d.id, d.data())));
}

// generateMetadata와 페이지 본문이 같은 글을 읽을 때 한 번만 조회해요.
export const getPost = cache(async (id: string): Promise<Post | null> => {
  if (!isFirebaseConfigured) return null;
  const snap = await getDoc(doc(await firestore(), 'posts', id));
  return snap.exists() ? toPost(snap.id, snap.data()) : null;
});

export async function getArtistProfiles(): Promise<Map<string, ArtistProfile>> {
  if (!isFirebaseConfigured) return new Map();
  const snap = await getDocs(collection(await firestore(), 'artists'));
  return new Map(snap.docs.map((d) => [d.id, toArtistProfile(d.id, d.data())]));
}

export async function getArtistProfile(slug: string): Promise<ArtistProfile> {
  if (!isFirebaseConfigured) return toArtistProfile(slug, undefined);
  const snap = await getDoc(doc(await firestore(), 'artists', slug));
  return toArtistProfile(slug, snap.data());
}

// News 탭 목록: News 글과 'News에도 표시'를 체크한 아티스트 글을 최신순으로 함께 보여줘요.
export async function getNewsFeed(): Promise<Post[]> {
  if (!isFirebaseConfigured) return [];
  const posts = collection(await firestore(), 'posts');
  const [news, shared] = await Promise.all([
    getDocs(query(posts, where('category', '==', NEWS))),
    getDocs(query(posts, where('showInNews', '==', true))),
  ]);
  const artistPosts = shared.docs
    .map((d) => toPost(d.id, d.data()))
    .filter((post) => post.category !== NEWS && getArtist(post.category));
  return sortPosts([...news.docs.map((d) => toPost(d.id, d.data())), ...artistPosts]);
}

// 이전글 = 바로 전에 올린(더 오래된) 글, 다음글 = 바로 다음에 올린(더 최신) 글
export async function getNewsNeighbors(id: string): Promise<{ prev: Post | null; next: Post | null }> {
  const news = await getNewsFeed();
  const index = news.findIndex((post) => post.id === id);
  return {
    prev: index >= 0 ? (news[index + 1] ?? null) : null,
    next: index > 0 ? news[index - 1] : null,
  };
}
