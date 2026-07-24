import styles from './Footer.module.css';

interface FooterProps {
  /** Drop the top margin so the footer sits flush against full-bleed content (e.g. Home). */
  flush?: boolean;
}

export function Footer({ flush = false }: FooterProps) {
  return (
    <footer className={`${styles.footer} ${flush ? styles.flush : ''}`}>
      <div className={styles.inner}>

        {/* Left: brand */}
        <div className={styles.left}>
          <div className={styles.brand}>
            Terraria Compass
          </div>
          <p className={styles.tagline}>Your compass through Terraria.</p>
        </div>

        <div className={styles.mid} aria-hidden="true" />

        {/* Right: attribution. CC BY-NC-SA is satisfied by naming both wikis and
            the license here; the per-image builder credits, the shoutout and the
            takedown contact live in ATTRIBUTIONS rather than bloating the footer. */}
        <div className={styles.right}>
          <p className={styles.note}>
            Unofficial fan project, not affiliated with or endorsed by Re-Logic.
            Terraria is a trademark of Re-Logic.
          </p>
          <p className={styles.note}>
            Data and sprites from{' '}
            <a href="https://terraria.wiki.gg" rel="noopener noreferrer" target="_blank">terraria.wiki.gg</a>
            {' '}and{' '}
            <a href="https://calamitymod.wiki.gg" rel="noopener noreferrer" target="_blank">calamitymod.wiki.gg</a>
            {' '}under <a href="https://creativecommons.org/licenses/by-nc-sa/3.0/" rel="noopener noreferrer" target="_blank">CC BY-NC-SA 3.0</a>.
            {' '}Backdrops by flor3nce2456 and Eiv &middot;{' '}
            <a
              href="https://github.com/EzraGillooly/terraria-compass/blob/main/docs/ATTRIBUTIONS.md"
              rel="noopener noreferrer"
              target="_blank"
            >
              credits &amp; contact
            </a>
          </p>
        </div>

      </div>
    </footer>
  );
}
