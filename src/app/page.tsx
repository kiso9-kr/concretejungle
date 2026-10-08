import Link from 'next/link';
import MemberGrid from '@/components/MemberGrid';
import NewsList from '@/components/NewsList';
import { getArtistProfiles, getNewsFeed } from '@/lib/data';
import styles from './home.module.css';

export default async function Home({ searchParams }: { searchParams: Promise<{ tab?: string | string[] }> }) {
  const { tab } = await searchParams;
  const showNews = tab === 'news';

  return (
    <>
      <nav className={styles.tabs}>
        <Link href="/" className={showNews ? undefined : styles.active} aria-current={showNews ? undefined : 'page'}>
          Members
        </Link>
        <Link href="/?tab=news" className={showNews ? styles.active : undefined} aria-current={showNews ? 'page' : undefined}>
          News
        </Link>
      </nav>
      {showNews ? (
        <NewsList posts={await getNewsFeed()} />
      ) : (
        <MemberGrid profiles={await getArtistProfiles()} />
      )}
    </>
  );
}
