'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseClient } from '@/lib/firebase-client';
import { isFirebaseConfigured } from '@/lib/firebase-config';
import styles from './admin.module.css';

type Status = 'loading' | 'configMissing' | 'signedOut' | 'notAdmin' | 'admin';

const NAV = [
  { href: '/admin', label: '글 목록' },
  { href: '/admin/write', label: '새 글 쓰기' },
  { href: '/admin/artists', label: '아티스트 설정' },
];

// 로그인한 계정이 Firestore의 admins 컬렉션에 등록돼 있을 때만 관리자 화면을 보여줘요.
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setStatus('configMissing');
      return;
    }

    const { auth, db } = firebaseClient();
    return onAuthStateChanged(auth, async (next) => {
      setUser(next);
      if (!next) {
        setStatus('signedOut');
        return;
      }
      setStatus('loading');
      const isAdmin = await getDoc(doc(db, 'admins', next.uid)).then(
        (snap) => snap.exists(),
        () => false,
      );
      if (auth.currentUser?.uid === next.uid) setStatus(isAdmin ? 'admin' : 'notAdmin');
    });
  }, []);

  const logout = () => signOut(firebaseClient().auth);

  if (status === 'configMissing') {
    return (
      <div className={styles.narrow}>
        <h1 className={styles.heading}>Firebase 설정 필요</h1>
        <p className={styles.muted}>
          프로젝트 루트의 <code>.env.local</code>에 Firebase 웹 앱 설정을 입력한 뒤 개발 서버를 다시 시작해 주세요.
        </p>
      </div>
    );
  }
  if (status === 'loading') return <p className={styles.muted}>불러오는 중…</p>;
  if (status === 'signedOut') return <LoginForm />;
  if (status === 'notAdmin') {
    return (
      <div className={styles.narrow}>
        <p>{user?.email} 계정은 관리자 권한이 없어요.</p>
        <button type="button" className={styles.button} onClick={logout}>
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div>
      <nav className={styles.nav}>
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className={pathname === item.href ? styles.navActive : undefined}>
            {item.label}
          </Link>
        ))}
        <span className={styles.navUser}>{user?.email}</span>
        <button type="button" className={styles.textButton} onClick={logout}>
          로그아웃
        </button>
      </nav>
      {children}
    </div>
  );
}

function loginErrorMessage(error: unknown): string {
  const code = (error as { code?: string }).code;
  if (code === 'auth/too-many-requests') return '시도가 너무 많아요. 잠시 후 다시 시도해 주세요.';
  if (code === 'auth/network-request-failed') return '네트워크 연결을 확인해 주세요.';
  return '이메일 또는 비밀번호가 올바르지 않아요.';
}

function LoginForm() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      await signInWithEmailAndPassword(firebaseClient().auth, String(form.get('email')), String(form.get('password')));
    } catch (err) {
      setError(loginErrorMessage(err));
      setBusy(false);
    }
  }

  return (
    <form className={`${styles.form} ${styles.narrow}`} onSubmit={handleSubmit}>
      <h1 className={styles.heading}>관리자 로그인</h1>
      <label className={styles.field}>
        <span>이메일</span>
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <label className={styles.field}>
        <span>비밀번호</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {error && <p className={styles.error}>{error}</p>}
      <button type="submit" className={styles.button} disabled={busy}>
        {busy ? '로그인 중…' : '로그인'}
      </button>
    </form>
  );
}
