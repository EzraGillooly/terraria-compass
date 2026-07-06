import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        {/* Left: brand */}
        <div className={styles.left}>
          <div className={styles.brand}>
            Terraria Compass
          </div>
          <p className={styles.tagline}>Your compass through Terraria.</p>
        </div>

        {/* Middle: reserved for something fun */}
        <div className={styles.mid} aria-hidden="true" />

        {/* Right: attribution */}
        <div className={styles.right}>
          <p className={styles.note}>Fan project · not affiliated with Re-Logic.</p>
          <p className={styles.note}>
            Icons from <a href="https://terraria.wiki.gg" rel="noopener noreferrer" target="_blank">terraria.wiki.gg</a> · CC BY-NC-SA 3.0
          </p>
        </div>

      </div>
    </footer>
  );
}
