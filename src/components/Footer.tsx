'use client';

import { useState } from 'react';
import { SITE } from '@/lib/site';
import styles from './layout.module.css';

export default function Footer() {
  const [copyStatus, setCopyStatus] = useState<'copied' | 'failed' | null>(null);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(SITE.email);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  }

  return (
    <footer className={styles.footer}>
      <button type="button" className={styles.emailButton} onClick={copyEmail}>
        {SITE.email}
        {copyStatus && (
          <span className={styles.copyStatus} aria-live="polite">
            {copyStatus === 'copied' ? '복사됨' : '복사하지 못했어요'}
          </span>
        )}
      </button>
      <a href={`https://www.instagram.com/${SITE.instagram}/`} target="_blank" rel="noopener noreferrer">
        @{SITE.instagram}
      </a>
    </footer>
  );
}
