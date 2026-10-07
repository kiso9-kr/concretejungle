import { SITE } from '@/lib/site';
import styles from './layout.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
      <a href={`https://www.instagram.com/${SITE.instagram}/`} target="_blank" rel="noopener noreferrer">
        @{SITE.instagram}
      </a>
    </footer>
  );
}
