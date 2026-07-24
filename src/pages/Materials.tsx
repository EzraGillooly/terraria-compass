import { useMemo, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Header } from '../components/Header/Header';
import { Footer } from '../components/Footer/Footer';
import { useAppState } from '../lib/app-context';
import materialsData from '../data/packs/calamity/materials.json';
import styles from './Materials.module.css';

type Material = {
  id: string;
  name: string;
  source: string;
  wikiUrl?: string;
  station?: string;
  materials?: { id: string; name: string; qty: number }[];
};

const MATERIALS = materialsData as Material[];
const byId = new Map(MATERIALS.map((m) => [m.id, m]));

/* Recipes name world variants "Any Cobalt Bar", so a search for the plain item
   should still find it - and vice versa. */
const bare = (s: string) => s.toLowerCase().replace(/^any\s+/, '');

/** Rank matches so an exact/prefix hit for the linked-in name lands first. */
function search(query: string): Material[] {
  const q = query.trim().toLowerCase();
  if (!q) return MATERIALS;
  const qb = bare(q);
  const scored: [number, Material][] = [];
  for (const m of MATERIALS) {
    const name = m.name.toLowerCase();
    const nb = bare(name);
    if (name === q || nb === qb) scored.push([0, m]);
    else if (name.startsWith(q) || nb.startsWith(qb)) scored.push([1, m]);
    else if (name.includes(q) || nb.includes(qb)) scored.push([2, m]);
    else if (m.source.toLowerCase().includes(q)) scored.push([3, m]);
  }
  return scored.sort((a, b) => a[0] - b[0] || a[1].name.localeCompare(b[1].name))
    .map(([, m]) => m);
}

export function Materials() {
  const [params, setParams] = useSearchParams();
  const { packId } = useAppState();
  const query = params.get('q') ?? '';
  const inputRef = useRef<HTMLInputElement>(null);

  // arriving from an item modal: focus the box so the prefilled term can be edited
  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = useMemo(() => search(query), [query]);
  const exact = results[0] && bare(results[0].name) === bare(query.trim())
    ? results[0] : null;

  const setQuery = (q: string) => {
    if (q) setParams({ q }, { replace: true });
    else setParams({}, { replace: true });
  };

  return (
    <div className={styles.page}>
      <div
        className={styles.backdrop}
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}biomes/dungeon.png)` }}
        aria-hidden="true"
      />
      <div className={styles.backdropWash} aria-hidden="true" />
      <Header variant="photo" />
      <main className={styles.main}>
        <p className={styles.crumb}>
          <Link to="/loadouts">Loadouts</Link>
          <span className={styles.crumbSep}>/</span>
          Materials
        </p>
        <h1 className={styles.title}>Calamity <em>materials</em></h1>
        <p className={styles.lede}>
          Look up any crafting material to see how it&rsquo;s obtained. Materials that are
          themselves crafted list what they need.
        </p>

        {packId !== 'calamity' && (
          <p className={styles.notice}>
            This index covers the Calamity pack. Switch the Mod selector to Calamity to
            match the rest of the site.
          </p>
        )}

        <div className={`${styles.searchWrap} pixel-frame`}>
          <input
            ref={inputRef}
            type="search"
            className={styles.search}
            placeholder="Search materials - Rocket Boots, Auric Bar, Soul of Light..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search materials"
          />
        </div>

        <p className={styles.count}>
          {query
            ? `${results.length} match${results.length === 1 ? '' : 'es'} for “${query}”`
            : `${MATERIALS.length} materials`}
        </p>

        {results.length === 0 && (
          <p className={styles.empty}>
            No material called “{query}”. It may be an item rather than a material -
            try the <Link to="/loadouts">Loadouts</Link> page.
          </p>
        )}

        <ul className={styles.list}>
          {results.slice(0, 200).map((m) => (
            <li
              key={m.id}
              className={`${styles.card} pixel-frame ${m === exact ? styles.cardHit : ''}`}
            >
              <div className={styles.cardHead}>
                <h2 className={styles.name}>{m.name}</h2>
                {m.wikiUrl && (
                  <a className={styles.wiki} href={m.wikiUrl} target="_blank" rel="noreferrer">
                    wiki
                  </a>
                )}
              </div>
              <p className={styles.source}>{m.source || 'Source not recorded yet.'}</p>
              {m.materials && m.materials.length > 0 && (
                <div className={styles.recipe}>
                  <span className={styles.recipeCap}>
                    Crafted{m.station ? ` at ${m.station}` : ''} from
                  </span>
                  <ul className={styles.ing}>
                    {m.materials.map((ing) => (
                      <li key={ing.id}>
                        <span className={styles.qty}>{ing.qty}</span>
                        {byId.has(ing.id)
                          ? <button
                              type="button"
                              className={styles.jump}
                              onClick={() => setQuery(ing.name)}
                            >
                              {ing.name}
                            </button>
                          : ing.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
}
