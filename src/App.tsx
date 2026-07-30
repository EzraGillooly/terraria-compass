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
const Biomes = lazyRoute(() => import('./pages/Biomes').then((m) => ({ default: m.Biomes })));
const Loadouts = lazyRoute(() => import('./pages/Loadouts').then((m) => ({ default: m.Loadouts })));
const Crafting = lazyRoute(() => import('./pages/Crafting').then((m) => ({ default: m.Crafting })));
const Materials = lazyRoute(() => import('./pages/Materials').then((m) => ({ default: m.Materials })));

export default function App() {
  const { pathname } = useLocation();
  return (
    <RouteError resetKey={pathname}>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/bosses"    element={<Bosses />} />
          <Route path="/biomes"    element={<Biomes />} />
          <Route path="/loadouts"  element={<Loadouts />} />
          <Route path="/crafting"  element={<Crafting />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </RouteError>
  );
}
