import styles from './Loading.module.css';

const BASE = import.meta.env.BASE_URL;

interface LoadingProps {
  /** Optional label shown under the spinner and read by screen readers. */
  label?: string;
  /** Icon size in px (default 50 - the sprite's native size). */
  size?: number;
}

/** Terraria sunflower loading spinner - use anywhere the app is fetching/pending. */
export function Loading({ label = 'Loading…', size = 50 }: LoadingProps) {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <img
        className={`${styles.icon} pixel-img`}
        src={`${BASE}brand/sunflower-loading.gif`}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
      />
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
}
