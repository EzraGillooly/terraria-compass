import { Component, type ReactNode } from 'react';

/**
 * A last-resort net under the lazy routes. retryChunk already reloads once on a
 * stale chunk, so this only shows if something still fails after that - and even
 * then the reader gets a button, never a blank white screen.
 */
export class RouteError extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div
        role="alert"
        style={{
          minHeight: '60vh', display: 'grid', placeItems: 'center',
          textAlign: 'center', padding: '24px', gap: '14px',
          color: 'var(--ink-soft)', fontFamily: 'var(--body)',
        }}
      >
        <div>
          <p style={{ fontSize: 16, marginBottom: 14 }}>
            This page didn&apos;t load. A refresh usually fixes it.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="pixel-frame"
            style={{
              padding: '9px 16px 7px', fontFamily: 'var(--body)', fontWeight: 800,
              fontSize: 13, color: '#fff', cursor: 'pointer',
              // @ts-expect-error - CSS custom properties on style
              '--px-fill': 'var(--accent)', '--px-border': '#000', '--px-u': '1px',
            }}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
