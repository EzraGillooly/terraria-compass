import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>Terraria Compass is a fan project and is not affiliated with Re-Logic.</p>
        <p>
          Item icons and gameplay content are adapted from{' '}
          <a href="https://terraria.wiki.gg" rel="noopener noreferrer" target="_blank">
            terraria.wiki.gg
          </a>{' '}
          under{' '}
          <a
            href="https://creativecommons.org/licenses/by-nc-sa/3.0/"
            rel="noopener noreferrer"
            target="_blank"
          >
            CC BY-NC-SA 3.0
          </a>
          .
        </p>
        <p>
          Planned repository:{' '}
          <a
            href="https://github.com/ezragillooly/terraria-compass"
            rel="noopener noreferrer"
            target="_blank"
          >
            github.com/ezragillooly/terraria-compass
          </a>
        </p>
      </div>
    </footer>
  );
}
