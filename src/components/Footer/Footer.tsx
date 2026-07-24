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

        {/* Middle: builder shoutout. Every backdrop on the site is someone's
            build, so they get top billing rather than a footnote. */}
        <div className={styles.mid}>
          <p className={styles.shoutout}>
            Shoutout to these absolute goats for building these sick backdrops
          </p>
          <p className={styles.shoutoutNames}>
            <a
              href="https://forums.terraria.org/index.php?threads/flor3nce2456s-builds-collection.3055/"
              rel="noopener noreferrer"
              target="_blank"
            >
              flor3nce2456
            </a>
            <span className={styles.shoutoutSep}>·</span>
            <a
              href="https://forums.terraria.org/index.php?threads/ballin-houses-by-eiv.1222/"
              rel="noopener noreferrer"
              target="_blank"
            >
              Eiv
            </a>
          </p>
        </div>

        {/* Right: attribution - CC BY-NC-SA requires crediting both wikis, and
            Terraria/Calamity trademarks belong to their respective owners. */}
        <div className={styles.right}>
          <p className={styles.note}>
            Unofficial fan project · not affiliated with or endorsed by Re-Logic
            or the Calamity Mod team.
          </p>
          <p className={styles.note}>
            Terraria is a trademark of Re-Logic. Game sprites and content remain
            the property of their respective owners.
          </p>
          <p className={styles.note}>
            Item data and sprites adapted from{' '}
            <a href="https://terraria.wiki.gg" rel="noopener noreferrer" target="_blank">terraria.wiki.gg</a>
            {' '}and{' '}
            <a href="https://calamitymod.wiki.gg" rel="noopener noreferrer" target="_blank">calamitymod.wiki.gg</a>
            {' '}under <a href="https://creativecommons.org/licenses/by-nc-sa/3.0/" rel="noopener noreferrer" target="_blank">CC BY-NC-SA 3.0</a>.
          </p>
          <p className={styles.note}>
            Backdrops are community builds and belong to their builders. If one is
            yours and you&rsquo;d like it credited differently or removed, email{' '}
            <a href="mailto:ezragillooly@gmail.com">ezragillooly@gmail.com</a>
            {' '}and it will be actioned.
          </p>
        </div>

      </div>
    </footer>
  );
}
