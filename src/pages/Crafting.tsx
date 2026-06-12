import { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { craftingTrees, type CraftingTree } from '../data/crafting';
import styles from './Crafting.module.css';

const TIER_LABELS: Record<string, string> = {
  'pre-boss':   'Pre-Boss',
  'pre-hm':     'Pre-Hardmode',
  'hardmode':   'Hardmode',
  'endgame':    'Endgame',
};

const TIERS = ['pre-boss', 'pre-hm', 'hardmode', 'endgame'] as const;

const BASE = import.meta.env.BASE_URL;

/* Tiny pixel-art type marks (no emoji) */
function TypeMark({ type }: { type: string }) {
  const common = { width: 18, height: 18, viewBox: '0 0 8 8', shapeRendering: 'crispEdges' as const, 'aria-hidden': true };
  if (type === 'weapon') {
    return (
      <svg {...common}>
        <rect x="5" y="0" width="2" height="2" fill="currentColor" />
        <rect x="4" y="1" width="1" height="1" fill="currentColor" />
        <rect x="3" y="2" width="1" height="1" fill="currentColor" />
        <rect x="2" y="3" width="1" height="1" fill="currentColor" />
        <rect x="1" y="4" width="1" height="1" fill="currentColor" />
        <rect x="0" y="5" width="2" height="2" fill="currentColor" />
        <rect x="2" y="5" width="2" height="1" fill="currentColor" />
        <rect x="1" y="6" width="2" height="2" fill="currentColor" />
      </svg>
    );
  }
  if (type === 'armor') {
    return (
      <svg {...common}>
        <rect x="1" y="0" width="6" height="1" fill="currentColor" />
        <rect x="1" y="1" width="6" height="3" fill="currentColor" />
        <rect x="2" y="4" width="4" height="2" fill="currentColor" />
        <rect x="3" y="6" width="2" height="1" fill="currentColor" />
      </svg>
    );
  }
  if (type === 'accessory') {
    return (
      <svg {...common}>
        <rect x="3" y="0" width="2" height="1" fill="currentColor" />
        <rect x="2" y="2" width="4" height="1" fill="currentColor" />
        <rect x="1" y="3" width="1" height="3" fill="currentColor" />
        <rect x="6" y="3" width="1" height="3" fill="currentColor" />
        <rect x="2" y="6" width="4" height="1" fill="currentColor" />
      </svg>
    );
  }
  // material — flask
  return (
    <svg {...common}>
      <rect x="3" y="0" width="2" height="2" fill="currentColor" />
      <rect x="2" y="2" width="1" height="2" fill="currentColor" />
      <rect x="5" y="2" width="1" height="2" fill="currentColor" />
      <rect x="1" y="4" width="6" height="3" fill="currentColor" />
      <rect x="2" y="5" width="4" height="1" fill="#FFFFFF" opacity="0.5" />
    </svg>
  );
}

function CraftCard({ tree }: { tree: CraftingTree }) {
  return (
    <div className={styles.craftCard}>
      <div className={styles.craftOutput}>
        <div className={styles.craftIcon} aria-hidden="true">
          <TypeMark type={tree.type} />
        </div>
        <div className={styles.craftOutputInfo}>
          <div className={styles.craftTags}>
            <span className={styles.craftType}>{tree.type}</span>
            {tree.class && <span className={styles.craftClass}>{tree.class}</span>}
          </div>
          <div className={styles.craftName}>{tree.output}</div>
          {tree.dmg != null && (
            <div className={styles.craftDmg}>{tree.dmg} dmg</div>
          )}
          <div className={styles.craftStation}>at {tree.station}</div>
        </div>
      </div>

      <div className={styles.craftArrow}>
        <span aria-hidden="true">←</span>
        <span>requires</span>
      </div>

      <div className={styles.craftParts}>
        {tree.parts.map((part) => (
          <div key={part.name} className={styles.craftPart}>
            <div className={styles.craftPartName}>{part.name}</div>
            <div className={styles.craftPartFrom}>{part.from}</div>
          </div>
        ))}
      </div>

      {tree.note && <p className={styles.craftNote}>{tree.note}</p>}
    </div>
  );
}

export function Crafting() {
  const [activeTier, setActiveTier] = useState<string>('pre-hm');
  const filtered = craftingTrees.filter((t) => t.tier === activeTier);

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>
      {/* ── Banner ── */}
      <div className={styles.banner}>
        <div
          className={styles.bannerPhoto}
          style={{ backgroundImage: `url(${BASE}hero/crafting.png)` }}
        />
        <div className={styles.dither} aria-hidden="true" />
        <div className={styles.bannerWash} />
        <Header variant="photo" />
        <div className={styles.bannerBody}>
          <p className={styles.bannerCrumb}>
            <a href="/#/">Home</a> <span className={styles.crumbSep}>/</span> Crafting Trees
          </p>
          <h1 className={styles.bannerTitle}>Crafting <em>Trees</em></h1>
          <p className={styles.bannerLede}>
            The recipes behind milestone weapons, armor sets, and key accessories.
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <section className={styles.section}>
        <p className={styles.sectionKicker}>{'// Recipe tier'}</p>
        {/* Tier tabs */}
        <div className={styles.tierTabs}>
          {TIERS.map((tier) => (
            <button
              key={tier}
              type="button"
              className={`${styles.tierTab} ${activeTier === tier ? styles.on : ''}`}
              onClick={() => setActiveTier(tier)}
              aria-pressed={activeTier === tier}
            >
              {TIER_LABELS[tier]}
              <span className={styles.tierCount}>
                {craftingTrees.filter((t) => t.tier === tier).length}
              </span>
            </button>
          ))}
        </div>

        {/* Craft cards */}
        <div className={styles.craftList}>
          {filtered.map((tree) => (
            <CraftCard key={tree.id} tree={tree} />
          ))}
          {filtered.length === 0 && (
            <p className={styles.empty}>No crafting trees for this tier yet.</p>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
