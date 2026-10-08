'use client';

import Link from 'next/link';
import { useState, type MouseEvent } from 'react';
import styles from './MemberGrid.module.css';

export default function ArtistCard({ slug, name, image }: { slug: string; name: string; image: string }) {
  const [revealed, setRevealed] = useState(false);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!window.matchMedia('(hover: none)').matches || revealed) return;
    event.preventDefault();
    setRevealed(true);
  }

  return (
    <Link href={`/artists/${slug}`} className={`${styles.card} ${revealed ? styles.revealed : ''}`} onClick={handleClick}>
      <img src={image} alt={name} />
      <span className={styles.name}>{name}</span>
    </Link>
  );
}