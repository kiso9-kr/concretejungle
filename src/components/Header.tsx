import Link from 'next/link';
import { SITE } from '@/lib/site';
import styles from './layout.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" aria-label="메인 페이지로 이동">
        <img src={SITE.logo} alt={SITE.name} className={styles.logo} />
      </Link>
    </header>
  );
}
