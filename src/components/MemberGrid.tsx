import { ARTISTS } from '@/lib/site';
import type { ArtistProfile } from '@/lib/types';
import ArtistCard from './ArtistCard';
import styles from './MemberGrid.module.css';

export default function MemberGrid({ profiles }: { profiles: Map<string, ArtistProfile> }) {
  return (
    <div className={styles.container}>
      <ul className={styles.grid}>
        {ARTISTS.map((artist) => {
          const image = profiles.get(artist.slug)?.image?.url ?? '/artist-default.jpeg';
          return (
            <li key={artist.slug}>
              <ArtistCard slug={artist.slug} name={artist.name} image={image} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
