import { Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Home } from './pages/Home';
import { Loading } from './components/Loading';
import { RouteError } from './components/RouteError';
import { lazyRoute } from './lib/lazy-retry';

/* Each page below is its own chunk, fetched when its route is first visited, so
   the initial download is the shell plus whichever page the visitor landed on -
   not all six. Home stays eager: it is the default route and the most common
   entry, so lazy-loading it would only add a spinner to the common case.

   lazyRoute (not lazy) so a chunk that 404s after a deploy reloads the page to
   fetch the current build instead of white-screening. */
const Bosses = lazyRoute(() => import('./pages/Bosses').then((m) => ({ default: m.Bosses })));
const Loadouts = lazyRoute(() => import('./pages/Loadouts').then((m) => ({ default: m.Loadouts })));
// Internal Calamity hardening audit. Unlisted; reachable at #/calamity-audit.
const CalamityAudit = lazyRoute(() => import('./pages/CalamityAudit').then((m) => ({ default: m.CalamityAudit })));
// Biomes, Crafting and Materials are hidden from the public for now. The pages
// still build; their routes fall through to the "*" redirect below. Restore the
// lazy imports, routes and nav links (Header.tsx) to bring them back.
// const Biomes = lazyRoute(() => import('./pages/Biomes').then((m) => ({ default: m.Biomes })));
// const Crafting = lazyRoute(() => import('./pages/Crafting').then((m) => ({ default: m.Crafting })));
// const Materials = lazyRoute(() => import('./pages/Materials').then((m) => ({ default: m.Materials })));

export default function App() {
  const { pathname } = useLocation();
  return (
    <RouteError resetKey={pathname}>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/bosses"    element={<Bosses />} />
          <Route path="/loadouts"  element={<Loadouts />} />
          <Route path="/calamity-audit" element={<CalamityAudit />} />
          {/* /biomes, /crafting, /materials are hidden for now - they fall
              through to this redirect instead of rendering. */}
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </RouteError>
  );
}
