import styles from './PostContent.module.css';

const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

// 줄바꿈을 그대로 보여주고, 본문 속 링크는 클릭할 수 있게 만들어요.
export default function PostContent({ text }: { text: string }) {
  return (
    <div className={styles.content}>
      {text.split(URL_PATTERN).map((part, i) =>
        i % 2 === 1 ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer">
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </div>
  );
}
