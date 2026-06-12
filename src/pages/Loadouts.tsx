import { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useAppState } from '../lib/app-context';
import { classes, getLoadoutByPhaseAndClass, phases } from '../lib/data';
import { isItemRelevantToDifficulty } from '../lib/difficulty';
import { useSubclassFilters } from '../lib/subclasses';
import { CLASS_COLORS, CLASS_STAT } from '../lib/classColors';
import type { ClassId, Item, PhaseId } from '../data/schema';
import type { SyntheticEvent } from 'react';
import styles from './Loadouts.module.css';

const BASE = import.meta.env.BASE_URL;
const WIKI = 'https://terraria.wiki.gg/wiki/Special:FilePath';

function makeWikiName(stem: string): string {
  const overrides: Record<string, string> = {
    'nights-edge': "Night's_Edge",
    'shield-of-cthulhu': 'Shield_of_Cthulhu',
    'cloud-in-a-bottle': 'Cloud_in_a_Bottle',
  };
  return overrides[stem] ?? stem.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('_');
}

function makeErrorHandler(wikiSrc: string, fallback: string) {
  return (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.dataset.stage === 'placeholder') return;
    if (img.dataset.stage !== 'wiki') { img.dataset.stage = 'wiki'; img.src = wikiSrc; return; }
    img.dataset.stage = 'placeholder';
    img.src = fallback;
  };
}

const FALLBACK_ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36'%3E%3Crect width='36' height='36' fill='%23F4EDDB'/%3E%3Ctext x='18' y='24' text-anchor='middle' font-size='18' fill='%236F664F' font-family='sans-serif'%3E%3F%3C/text%3E%3C/svg%3E";

/* ── Weapon tile ── */
function WeaponTile({ item, classColor, difficulty }: { item: Item; classColor: string; difficulty: string }) {
  const relevant = isItemRelevantToDifficulty(item.tags, difficulty as 'normal' | 'expert' | 'master');
  const stem     = item.icon.replace(/\.png$/i, '').split('/').pop() ?? '';
  const localSrc = `${BASE}icons/${item.icon}`;
  const wikiSrc  = `${WIKI}/${makeWikiName(stem)}.png`;

  return (
    <div
      className={styles.weaponTile}
      style={{ '--cc': classColor, opacity: relevant ? 1 : 0.45 } as React.CSSProperties}
      title={item.why ?? item.name}
    >
      <img
        src={localSrc}
        alt=""
        aria-hidden="true"
        className={`${styles.weaponTileImg} pixel-img`}
        width="36" height="36"
        loading="lazy"
        onError={makeErrorHandler(wikiSrc, FALLBACK_ICON)}
      />
      <div className={styles.weaponName}>{item.name}</div>
      {item.source && <div className={styles.weaponSource}>{item.source}</div>}
      {item.subclass && <span className={styles.weaponSub}>{item.subclass}</span>}
      {item.topPick && <span className={styles.weaponStar} aria-label="Top pick">★</span>}
    </div>
  );
}

/* ── Accessory row ── */
function AccTile({ item, classColor, difficulty }: { item: Item; classColor: string; difficulty: string }) {
  const relevant = isItemRelevantToDifficulty(item.tags, difficulty as 'normal' | 'expert' | 'master');
  const stem     = item.icon.replace(/\.png$/i, '').split('/').pop() ?? '';
  const localSrc = `${BASE}icons/${item.icon}`;
  const wikiSrc  = `${WIKI}/${makeWikiName(stem)}.png`;

  return (
    <li
      className={styles.accTile}
      style={{ opacity: relevant ? 1 : 0.45 } as React.CSSProperties}
    >
      <img
        src={localSrc}
        alt=""
        aria-hidden="true"
        className={`${styles.accIcon} pixel-img`}
        width="36" height="36"
        loading="lazy"
        onError={makeErrorHandler(wikiSrc, FALLBACK_ICON)}
      />
      <div className={styles.accInfo}>
        <div className={styles.accName}>{item.name}</div>
        {item.source && <div className={styles.accFrom}>{item.source}</div>}
      </div>
      {item.subclass && (
        <span
          className={styles.accType}
          style={{ '--cc': classColor } as React.CSSProperties}
        >
          {item.subclass}
        </span>
      )}
    </li>
  );
}

export function Loadouts() {
  const { difficulty } = useAppState();
  const [phaseId, setPhaseId]  = useState<PhaseId>('pre-bosses');
  const [classId, setClassId]  = useState<ClassId>('melee');

  const loadout  = getLoadoutByPhaseAndClass(phaseId, classId);
  const classDef = classes.find((c) => c.id === classId)!;
  const classColor = CLASS_COLORS[classId] ?? '#E7C66B';

  const safeLoadout = loadout ?? { phase: phaseId, class: classId, weapons: [], armor: [], accessories: [], buffs: [] };

  const { clearSubclassFilters, isAllSelected, isSubclassEnabled, selectedSubclassSet, toggleSubclass } =
    useSubclassFilters(classId);

  const allWeapons   = safeLoadout.weapons;
  const bestWeapons  = allWeapons.filter((w) => w.topPick);
  const alsoWeapons  = allWeapons.filter((w) => !w.topPick);
  const filteredBest = selectedSubclassSet.size === 0 ? bestWeapons : bestWeapons.filter((w) => !w.subclass || selectedSubclassSet.has(w.subclass));
  const filteredAlso = selectedSubclassSet.size === 0 ? alsoWeapons : alsoWeapons.filter((w) => !w.subclass || selectedSubclassSet.has(w.subclass));

  const armorItem    = safeLoadout.armor[0] ?? null;

  return (
    <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>
      {/* ── Banner ── */}
      <div className={styles.banner}>
        <div className={styles.bannerPhoto} />
        <div className={styles.bannerWash} />
        <Header variant="photo" />
        <div className={styles.bannerBody}>
          <p className={styles.bannerCrumb}><a href="/#/">Home</a> › Class Loadouts</p>
          <h1 className={styles.bannerTitle}>Class <em>Loadouts</em></h1>
          <p className={styles.bannerLede}>
            Pick your class and stage. Hover weapon tiles for full stats. Accessory and armor recommendations update with every choice.
          </p>
        </div>
      </div>

      {/* ── Main content ── */}
      <section className={styles.section}>

        {/* Choose your class */}
        <div className={styles.sectionHead}>
          <p className={styles.sectionKicker}>Step 01</p>
          <h2>Choose your <em>class</em></h2>
          <p className={styles.sectionLede}>Each class plays differently. Subclass filters narrow to your preferred weapon style.</p>
        </div>

        <div className={styles.classTabs} role="group" aria-label="Select class">
          {classes.map((cls) => {
            const color = CLASS_COLORS[cls.id] ?? '#E7C66B';
            return (
              <button
                key={cls.id}
                type="button"
                className={`${styles.classTab} ${cls.id === classId ? styles.on : ''}`}
                style={{ '--cc': color } as React.CSSProperties}
                aria-pressed={cls.id === classId}
                onClick={() => { setClassId(cls.id as ClassId); clearSubclassFilters(); }}
              >
                <div className={styles.classEmblem}>
                  <div className={styles.classEmblemInner} />
                </div>
                <div className={styles.classText}>
                  <span className={styles.className}>{cls.name}</span>
                  <span className={styles.classStat}>{CLASS_STAT[cls.id]}</span>
                  <span className={styles.classSub}>{cls.blurb}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Phase tabs */}
        <div className={styles.sectionHead} style={{ marginTop: 'var(--space-8)' }}>
          <p className={styles.sectionKicker}>Step 02</p>
          <h2>Select your <em>phase</em></h2>
        </div>

        <div className={styles.phaseTabs}>
          {phases.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className={`${styles.phaseTab} ${p.id === phaseId ? styles.on : ''}`}
              aria-pressed={p.id === phaseId}
              onClick={() => setPhaseId(p.id as PhaseId)}
            >
              <span className={styles.phaseStep}>{String(i + 1).padStart(2, '0')}</span>
              <span className={styles.phaseName}>{p.name}</span>
            </button>
          ))}
        </div>

        {/* Weapons block */}
        <div
          className={styles.loBlock}
          style={{ '--cc': classColor } as React.CSSProperties}
        >
          <div className={styles.loBlockHead}>
            <div
              className={styles.loBlockBar}
              style={{ background: classColor }}
            />
            <h3>[ Weapons — {classDef.name} ]</h3>
          </div>

          {/* Subclass filter */}
          {classDef.subclasses.length > 0 && (
            <div className={styles.subclassRow}>
              <button
                type="button"
                className={`${styles.subclassChip} ${isAllSelected ? styles.on : ''}`}
                onClick={clearSubclassFilters}
                aria-pressed={isAllSelected}
              >
                All
              </button>
              {classDef.subclasses.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  className={`${styles.subclassChip} ${!isAllSelected && isSubclassEnabled(sc.id) ? styles.on : ''}`}
                  aria-pressed={!isAllSelected && isSubclassEnabled(sc.id)}
                  onClick={() => toggleSubclass(sc.id)}
                >
                  {sc.name}
                </button>
              ))}
            </div>
          )}

          {/* Best in slot */}
          {filteredBest.length > 0 && (
            <div className={styles.weaponGroup}>
              <div className={styles.weaponGroupLabel}>Best in Slot</div>
              <div className={styles.weaponRow}>
                {filteredBest.map((w) => (
                  <WeaponTile key={w.id} item={w} classColor={classColor} difficulty={difficulty} />
                ))}
              </div>
            </div>
          )}

          {/* Also great */}
          {filteredAlso.length > 0 && (
            <div className={styles.weaponGroup}>
              <div className={styles.weaponGroupLabel}>Also Great</div>
              <div className={styles.weaponRow}>
                {filteredAlso.map((w) => (
                  <WeaponTile key={w.id} item={w} classColor={classColor} difficulty={difficulty} />
                ))}
              </div>
            </div>
          )}

          {filteredBest.length === 0 && filteredAlso.length === 0 && (
            <p className={styles.empty}>No weapons match your filters for this phase.</p>
          )}
        </div>

        {/* Armor + Accessories columns */}
        <div className={styles.bottomCols}>
          {/* Armor */}
          <div className={styles.loBlock}>
            <div className={styles.loBlockHead}>
              <div className={styles.loBlockBar} style={{ background: classColor }} />
              <h3>[ Armor ]</h3>
            </div>
            {armorItem ? (
              <div className={styles.armorBlock}>
                <div className={styles.armorPortrait}>
                  <img
                    src={`${BASE}icons/${armorItem.icon}`}
                    alt={armorItem.name}
                    className={`${styles.armorSprite} pixel-img`}
                    width="64" height="64"
                    loading="lazy"
                    onError={makeErrorHandler(
                      `${WIKI}/${makeWikiName(armorItem.icon.replace(/\.png$/i,'').split('/').pop()??'')}.png`,
                      FALLBACK_ICON
                    )}
                  />
                  <div className={styles.armorDefenseBadge}>
                    <span className={styles.armorDefNum}>{safeLoadout.armor.length}</span>
                    <span className={styles.armorDefLabel}>sets</span>
                  </div>
                </div>
                <div className={styles.armorInfo}>
                  {safeLoadout.armor.map((a) => (
                    <div key={a.id} className={styles.armorEntry}>
                      <div className={styles.armorName}>{a.name}</div>
                      {a.why && <div className={styles.armorPerk}>{a.why}</div>}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className={styles.empty}>No armor data for this phase yet.</p>
            )}
          </div>

          {/* Accessories */}
          <div className={styles.loBlock}>
            <div className={styles.loBlockHead}>
              <div className={styles.loBlockBar} style={{ background: classColor }} />
              <h3>[ Accessories ]</h3>
            </div>
            <ul className={styles.accList}>
              {safeLoadout.accessories.map((acc) => (
                <AccTile key={acc.id} item={acc} classColor={classColor} difficulty={difficulty} />
              ))}
              {safeLoadout.accessories.length === 0 && (
                <li className={styles.empty}>No accessories data yet.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Buffs */}
        {safeLoadout.buffs.length > 0 && (
          <div className={styles.loBlock} style={{ marginTop: 'var(--space-4)' }}>
            <div className={styles.loBlockHead}>
              <div className={styles.loBlockBar} style={{ background: classColor }} />
              <h3>[ Buffs &amp; Consumables ]</h3>
            </div>
            <div className={styles.buffsList}>
              {safeLoadout.buffs.map((b) => {
                const stem = b.icon.replace(/\.png$/i,'').split('/').pop()??'';
                return (
                  <div key={b.id} className={styles.buffRow}>
                    <img
                      src={`${BASE}icons/${b.icon}`}
                      alt=""
                      aria-hidden="true"
                      className={`${styles.buffIcon} pixel-img`}
                      width="28" height="28"
                      loading="lazy"
                      onError={makeErrorHandler(`${WIKI}/${makeWikiName(stem)}.png`, FALLBACK_ICON)}
                    />
                    <span className={styles.buffName}>{b.name}</span>
                    {b.source && <span className={styles.buffSource}>{b.source}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
