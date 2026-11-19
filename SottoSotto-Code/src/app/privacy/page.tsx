import { pageMetadata, privacy } from '@/content';
import styles from '../pages.module.css';

export const metadata = pageMetadata('privacy', '/privacy/');

/** The existing policy, word for word (D25). No effects. */
export default function PrivacyPage() {
  return (
    <div className={`container ${styles.page}`}>
      {/* How far through the policy you are (CSS scroll timeline, D79). */}
      <div className={styles.progress} aria-hidden="true" />
      <article className={styles.legal}>
        <h1 className={styles.title}>{privacy.title}</h1>
        {privacy.blocks.map((block, i) => {
          switch (block.type) {
            case 'heading':
              return <h2 key={i}>{block.text}</h2>;
            case 'paragraph':
              return <p key={i}>{block.text}</p>;
            case 'list':
              return (
                <ul key={i}>
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              );
          }
        })}
      </article>
    </div>
  );
}
