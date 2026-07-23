import { Navigate, Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { Bosses } from './pages/Bosses';
import { Biomes } from './pages/Biomes';
import { Loadouts } from './pages/Loadouts';
import { Crafting } from './pages/Crafting';
import { Materials } from './pages/Materials';

export default function App() {
  return (
    <Routes>
      <Route path="/"          element={<Home />} />
      <Route path="/bosses"    element={<Bosses />} />
      <Route path="/biomes"    element={<Biomes />} />
      <Route path="/loadouts"  element={<Loadouts />} />
      <Route path="/crafting"  element={<Crafting />} />
      <Route path="/materials" element={<Materials />} />
      <Route path="*"          element={<Navigate to="/" replace />} />
    </Routes>
  );
}
