import type { ReactNode } from 'react';
import { Header } from '../Header';
import styles from './AppShell.module.css';

interface AppShellProps {
  children: ReactNode;
  topBar?: ReactNode;
}

export function AppShell({ children, topBar }: AppShellProps) {
  return (
    <>
      <a className={styles.skipLink} href="#main">
        Skip to main content
      </a>
      <Header />
      {topBar && (
        <div className={styles.topBar}>
          {topBar}
        </div>
      )}
      <main className={styles.main} id="main">
        {children}
      </main>
    </>
  );
}
