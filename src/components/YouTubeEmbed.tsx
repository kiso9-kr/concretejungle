import styles from './YouTubeEmbed.module.css';

export default function YouTubeEmbed({ id, title }: { id: string; title: string }) {
  return (
    <div className={styles.video}>
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
