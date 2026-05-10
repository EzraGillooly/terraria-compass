import type { ReactNode } from 'react';
import { Header } from '../Header';
import styles from './AppShell.module.css';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <>
      <a className={styles.skipLink} href="#main">
        Skip to main content
      </a>
      <Header />
      <main className={styles.main} id="main">
        {children}
      </main>
    </>
  );
}
