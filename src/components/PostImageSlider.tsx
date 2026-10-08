'use client';

import { useState, type TouchEvent } from 'react';
import styles from '@/app/posts/[id]/post.module.css';

export default function PostImageSlider({ images }: { images: { url: string }[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStart === null) return;
    const delta = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(delta) > 48) {
      setActiveIndex((index) => (delta < 0 ? Math.min(index + 1, images.length - 1) : Math.max(index - 1, 0)));
    }
    setTouchStart(null);
  }

  const multipleImages = images.length > 1;

  return (
    <div className={styles.imageSlider} onTouchStart={(event) => setTouchStart(event.touches[0].clientX)} onTouchEnd={handleTouchEnd}>
      <div className={styles.imageViewport} aria-live="polite">
        <img src={images[activeIndex].url} alt={`게시물 이미지 ${activeIndex + 1}`} />
      </div>
      {multipleImages && (
        <div className={styles.imageControls}>
          <button
            type="button"
            className={styles.imageArrow}
            onClick={() => setActiveIndex((index) => Math.max(index - 1, 0))}
            disabled={activeIndex === 0}
            aria-label="이전 이미지"
          >
            ←
          </button>
          <span className={styles.imageCount} aria-label={`전체 ${images.length}장 중 ${activeIndex + 1}번째`}>
            {activeIndex + 1} / {images.length}
          </span>
          <button
            type="button"
            className={styles.imageArrow}
            onClick={() => setActiveIndex((index) => Math.min(index + 1, images.length - 1))}
            disabled={activeIndex === images.length - 1}
            aria-label="다음 이미지"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}