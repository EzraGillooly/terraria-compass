import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import {
  recipeNodes,
  recipeRoots,
  pathToItem,
  rootContaining,
  type RecipeNode,
} from '../data/recipes';
import styles from './Crafting.module.css';

const BASE = import.meta.env.BASE_URL;

const FALLBACK_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Crect width='32' height='32' fill='%23223049'/%3E%3Ctext x='16' y='22' text-anchor='middle' font-size='16' fill='%237E93B5' font-family='sans-serif'%3E%3F%3C/text%3E%3C/svg%3E";

function Sprite({ node, size }: { node: RecipeNode; size: number }) {
  return (
    <img
      className={`${styles.sprite} pixel-img`}
      src={node.icon ? `${BASE}icons/${node.icon}` : FALLBACK_ICON}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      loading="lazy"
      onError={(e) => { e.currentTarget.src = FALLBACK_ICON; }}
    />
  );
}

/**
 * One item in the tree, rendered recursively. Craftable ingredients nest underneath;
 * base materials (drops, ores, purchases) are the leaves.
 */
function TreeNode({
  id, qty, expanded, onToggle, highlightId, trail,
}: {
  id: string;
  qty: number;
  expanded: Set<string>;
  onToggle: (key: string) => void;
  highlightId: string | null;
  trail: string[];
}) {
  const node = recipeNodes[id];
  const highlightRef = useRef<HTMLDivElement>(null);
  const isHighlighted = id === highlightId;

  useEffect(() => {
    if (isHighlighted) {
      highlightRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [isHighlighted]);

  if (!node) return null;

  // recipes can cycle (Shimmer transmutes items into each other) — stop if we loop
  const cyclic = trail.includes(id);
  const recipe = cyclic ? undefined : node.recipes[0];
  const key = [...trail, id].join('/');
  const isOpen = expanded.has(key);

  return (
    <li className={styles.node}>
      <div
        ref={highlightRef}
        className={`${styles.row} ${isHighlighted ? styles.highlighted : ''}`}
      >
        {recipe ? (
          <button
            type="button"
            className={styles.twisty}
            onClick={() => onToggle(key)}
            aria-expanded={isOpen}
            aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${node.name} recipe`}
            data-open={isOpen}
          >
            <span className={styles.twistyGlyph} aria-hidden="true" />
          </button>
        ) : (
          <span className={styles.twistySpacer} aria-hidden="true" />
        )}

        <span className={styles.slot}><Sprite node={node} size={32} /></span>

        <span className={styles.label}>
          <span className={styles.nameRow}>
            <a className={styles.name} href={node.wikiUrl} target="_blank" rel="noreferrer">
              {node.name}
            </a>
            {qty > 1 && <span className={styles.qty}>×{qty}</span>}
          </span>
          {recipe && <span className={styles.station}>{recipe.station}</span>}
          {!recipe && !cyclic && <span className={styles.base}>base material</span>}
        </span>
      </div>

      {recipe && isOpen && (
        <ul className={styles.children}>
          {recipe.ingredients.map((ingredient) => (
            <TreeNode
              key={ingredient.id}
              id={ingredient.id}
              qty={ingredient.qty}
              expanded={expanded}
              onToggle={onToggle}
              highlightId={highlightId}
              trail={[...trail, id]}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/** Total count of each base material needed, flattened across the whole tree. */
function shoppingList(rootId: string): { node: RecipeNode; qty: number }[] {
  const totals = new Map<string, number>();
  const walk = (id: string, multiplier: number, trail: string[]) => {
    if (trail.includes(id)) return;
    const node = recipeNodes[id];
    if (!node) return;
    const recipe = node.recipes[0];
    if (!recipe) {
      totals.set(id, (totals.get(id) ?? 0) + multiplier);
      return;
    }
    for (const ingredient of recipe.ingredients) {
      walk(ingredient.id, multiplier * ingredient.qty, [...trail, id]);
    }
  };
  walk(rootId, 1, []);
  return [...totals.entries()]
    .flatMap(([id, qty]) => {
      const node = recipeNodes[id];
      return node ? [{ node, qty }] : [];
    })
    .sort((a, b) => b.qty - a.qty || a.node.name.localeCompare(b.node.name));
}

export function Crafting() {
  const [params, setParams] = useSearchParams();
  const requested = params.get('item');

  // an ?item= that isn't a root still opens the tree that contains it, highlighted
  const rootId = useMemo(
    () => (requested ? rootContaining(requested) : null),
    [requested],
  );
  const highlightId = requested && requested !== rootId ? requested : null;

  /**
   * Which branches are open is derived from the selected tree: a plain tree opens
   * fully, a deep-linked one opens just the path to the highlighted item. User
   * toggles are kept as an override that is discarded when the tree changes.
   */
  const treeKey = `${rootId ?? ''}:${highlightId ?? ''}`;
  const defaultExpanded = useMemo(() => {
    const keys = new Set<string>();
    if (!rootId) return keys;
    if (highlightId) {
      const path = pathToItem(rootId, highlightId) ?? [rootId];
      path.forEach((_, i) => keys.add(path.slice(0, i + 1).join('/')));
      return keys;
    }
    const openAll = (id: string, trail: string[]) => {
      if (trail.includes(id)) return;
      const recipe = recipeNodes[id]?.recipes[0];
      if (!recipe) return;
      keys.add([...trail, id].join('/'));
      for (const ingredient of recipe.ingredients) openAll(ingredient.id, [...trail, id]);
    };
    openAll(rootId, []);
    return keys;
  }, [rootId, highlightId]);

  const [override, setOverride] = useState<{ treeKey: string; keys: Set<string> } | null>(null);
  const expanded = override?.treeKey === treeKey ? override.keys : defaultExpanded;

  const toggle = (key: string) => {
    const keys = new Set(expanded);
    if (keys.has(key)) keys.delete(key); else keys.add(key);
    setOverride({ treeKey, keys });
  };

  const root = rootId ? recipeNodes[rootId] : null;
  const materials = rootId ? shoppingList(rootId) : [];

  return (
    <div className={styles.page}>
      <div
        className={styles.backdrop}
        style={{ backgroundImage: `url(${BASE}biomes/dungeon.png)` }}
        aria-hidden="true"
      />
      <div className={styles.backdropWash} aria-hidden="true" />

      <Header variant="photo" />

      {/* hero lives inside <main> so no content sits outside a landmark */}
      <main>
        <section className={styles.hero}>
          <div className={styles.heroBody}>
            <p className={styles.crumb}>
              <Link to="/">Home</Link>
              <span className={styles.crumbSep}>/</span>
              Crafting
            </p>
            <h1 className={styles.heroTitle}>Crafting <em>Trees</em></h1>
            <p className={styles.heroLede}>
              Every ingredient for the game&apos;s deepest crafts, all the way down to the
              drops and ores you actually have to farm.
            </p>
          </div>
        </section>

        <div className={styles.main}>
        {root ? (
          <>
            <div className={styles.treeHead}>
              <button
                type="button"
                className={`${styles.back} pixel-frame pixel-hollow`}
                onClick={() => setParams({}, { replace: false })}
              >
                ‹ All trees
              </button>
              <div className={styles.treeTitle}>
                <span className={styles.treeSlot}><Sprite node={root} size={40} /></span>
                <span>
                  <h2 className={styles.treeName}>{root.name}</h2>
                  <span className={styles.treeMeta}>
                    {materials.length} base material{materials.length === 1 ? '' : 's'}
                  </span>
                </span>
              </div>
            </div>

            <div className={styles.treeLayout}>
              <div className={`${styles.treePanel} pixel-frame`}>
                <h3 className={styles.panelCap}>Tree</h3>
                <ul className={styles.tree}>
                  <TreeNode
                    id={root.id}
                    qty={1}
                    expanded={expanded}
                    onToggle={toggle}
                    highlightId={highlightId}
                    trail={[]}
                  />
                </ul>
              </div>

              <aside className={`${styles.matPanel} pixel-frame`}>
                <h3 className={styles.panelCap}>What to farm</h3>
                <ul className={styles.matList}>
                  {materials.map(({ node, qty }) => (
                    <li key={node.id} className={styles.matRow}>
                      <span className={styles.matSlot}><Sprite node={node} size={28} /></span>
                      <a className={styles.matName} href={node.wikiUrl} target="_blank" rel="noreferrer">
                        {node.name}
                      </a>
                      <span className={styles.matQty}>×{qty}</span>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </>
        ) : (
          <>
            {requested && (
              <p className={styles.notFound}>
                No crafting tree for that item yet — here&apos;s everything we do have.
              </p>
            )}
            <div className={styles.grid}>
              {recipeRoots.map((id) => {
                const node = recipeNodes[id];
                if (!node) return null;
                return (
                  <button
                    key={id}
                    type="button"
                    className={styles.card}
                    onClick={() => setParams({ item: id })}
                  >
                    <span className={styles.cardSlot}><Sprite node={node} size={40} /></span>
                    <span className={styles.cardName}>{node.name}</span>
                    <span className={styles.cardMeta}>
                      {shoppingList(id).length} material{shoppingList(id).length === 1 ? '' : 's'}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
        </div>
      </main>

      <div className={styles.footerLayer}>
        <Footer />
      </div>
    </div>
  );
}
