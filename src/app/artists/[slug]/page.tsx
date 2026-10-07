import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PostGrid from '@/components/PostGrid';
import YouTubeEmbed from '@/components/YouTubeEmbed';
import { getArtistProfile, getPostsByCategory } from '@/lib/data';
import { getArtist } from '@/lib/site';
import { youTubeId } from '@/lib/youtube';
import styles from './artist.module.css';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const artist = getArtist((await params).slug);
  return { title: artist?.name };
}

export default async function ArtistPage({ params }: Props) {
  const { slug } = await params;
  const artist = getArtist(slug);
  if (!artist) notFound();

  const [profile, posts] = await Promise.all([getArtistProfile(slug), getPostsByCategory(slug)]);
  const videoId = youTubeId(profile.youtubeUrl);

  return (
    <>
      <h1 className={styles.name}>{artist.name}</h1>
      {videoId && <YouTubeEmbed id={videoId} title={`${artist.name} video`} />}
      <PostGrid posts={posts} />
    </>
  );
}
