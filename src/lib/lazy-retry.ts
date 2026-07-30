import { type ComponentType, lazy } from 'react';

/**
 * lazy() with recovery from a stale chunk.
 *
 * Pages and pack data are code-split into hashed files. After a deploy those
 * hashes change, so a browser holding the previous index.html asks for chunk
 * filenames that no longer exist - the import rejects and, with nothing to catch
 * it, the app white-screens until a hard reload.
 *
 * On the first such failure this reloads the page once, which fetches the
 * current index.html and its chunks. A sessionStorage flag makes it reload at
 * most once per session so a genuinely broken chunk cannot loop; the flag is
 * cleared as soon as any chunk loads, so a later stale chunk can recover again.
 */
const RELOAD_FLAG = 'tc.chunkReloaded';

export function retryChunk<T>(factory: () => Promise<T>): Promise<T> {
  return factory().then(
    (mod) => {
      sessionStorage.removeItem(RELOAD_FLAG);
      return mod;
    },
    (err) => {
      if (!sessionStorage.getItem(RELOAD_FLAG)) {
        sessionStorage.setItem(RELOAD_FLAG, '1');
        window.location.reload();
        // Never resolve: the reload replaces this document, so nothing should
        // render (and no error should surface) in the meantime.
        return new Promise<T>(() => {});
      }
      throw err;
    },
  );
}

/** lazy() for a route component, with the stale-chunk recovery above. */
export function lazyRoute<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(() => retryChunk(factory));
}
