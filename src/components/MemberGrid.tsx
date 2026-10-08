import Link from 'next/link';
import { ARTISTS } from '@/lib/site';
import type { ArtistProfile } from '@/lib/types';
import styles from './MemberGrid.module.css';

export default function MemberGrid({ profiles }: { profiles: Map<string, ArtistProfile> }) {
  return (
    <div className={styles.container}>
      <ul className={styles.grid}>
        {ARTISTS.map((artist) => {
          const image = profiles.get(artist.slug)?.image?.url ?? '/artist-default.jpeg';
          return (
            <li key={artist.slug}>
              <Link href={`/artists/${artist.slug}`} className={styles.card}>
                <img src={image} alt={artist.name} />
                <span className={styles.name}>{artist.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
