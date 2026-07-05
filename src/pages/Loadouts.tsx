import { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useAppState } from '../lib/app-context';
import { classes, getLoadoutByPhaseAndClass, phases } from '../lib/data';
import { isItemRelevantToDifficulty } from '../lib/difficulty';
import { useSubclassFilters } from '../lib/subclasses';
import { CLASS_COLORS } from '../lib/classColors';
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

const FALLBACK_ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36'%3E%3Crect width='36' height='36' fill='%23E6F2ED'/%3E%3Ctext x='18' y='24' text-anchor='middle' font-size='18' fill='%234F6E60' font-family='sans-serif'%3E%3F%3C/text%3E%3C/svg%3E";

function iconSrcs(icon: string) {
  const stem = icon.replace(/\.png$/i, '').split('/').pop() ?? '';
  return { local: `${BASE}icons/${icon}`, wiki: `${WIKI}/${makeWikiName(stem)}.png` };
}

/* ── Weapon tile ── */
function WeaponTile({ item, difficulty }: { item: Item; difficulty: string }) {
  const relevant = isItemRelevantToDifficulty(item.tags, difficulty as 'normal' | 'expert' | 'master');
  const { local, wiki } = iconSrcs(item.icon);

  return (
    <div
      className={`${styles.wtile} ${item.topPick ? styles.best : ''}`}
      style={{ opacity: relevant ? 1 : 0.45 }}
      title={item.why ?? item.name}
    >
      {item.topPick && <span className={styles.wStar} aria-label="Top pick">★</span>}
      <div className={styles.wIcon}>
        <img
          src={local} alt="" aria-hidden="true"
          className={`${styles.wtileImg} pixel-img`}
          width="34" height="34" loading="lazy"
          onError={makeErrorHandler(wiki, FALLBACK_ICON)}
        />
      </div>
      <div className={styles.wName}>{item.name}</div>
      {item.source && <div className={styles.wSource}>{item.source}</div>}
      {item.subclass && <span className={styles.wSub}>{item.subclass}</span>}
    </div>
  );
}

/* ── Accessory row ── */
function AccRow({ item, difficulty }: { item: Item; difficulty: string }) {
  const relevant = isItemRelevantToDifficulty(item.tags, difficulty as 'normal' | 'expert' | 'master');
  const { local, wiki } = iconSrcs(item.icon);

  return (
    <li className={styles.accRow} style={{ opacity: relevant ? 1 : 0.45 }}>
      <img
        src={local} alt="" aria-hidden="true"
        className={`${styles.accIcon} pixel-img`}
        width="30" height="30" loading="lazy"
        onError={makeErrorHandler(wiki, FALLBACK_ICON)}
      />
      <div className={styles.accInfo}>
        <div className={styles.accName}>{item.name}</div>
        {item.source && <div className={styles.accFrom}>{item.source}</div>}
      </div>
      {item.subclass && <span className={styles.accType}>{item.subclass}</span>}
    </li>
  );
}

export function Loadouts() {
  const { difficulty } = useAppState();
  const [phaseId, setPhaseId] = useState<PhaseId>('pre-bosses');
  const [classId, setClassId] = useState<ClassId>('melee');

  const loadout = getLoadoutByPhaseAndClass(phaseId, classId);
  const classDef = classes.find((c) => c.id === classId)!;
  const phaseName = phases.find((p) => p.id === phaseId)?.name ?? '';

  const safeLoadout = loadout ?? { phase: phaseId, class: classId, weapons: [], armor: [], accessories: [], buffs: [] };

  const { clearSubclassFilters, isAllSelected, isSubclassEnabled, selectedSubclassSet, toggleSubclass } =
    useSubclassFilters(classId);

  const bestWeapons = safeLoadout.weapons.filter((w) => w.topPick);
  const alsoWeapons = safeLoadout.weapons.filter((w) => !w.topPick);
  const matchSub = (w: Item) => selectedSubclassSet.size === 0 || !w.subclass || selectedSubclassSet.has(w.subclass);
  const filteredBest = bestWeapons.filter(matchSub);
  const filteredAlso = alsoWeapons.filter(matchSub);

  const armorSprite = safeLoadout.armor[0]?.icon;
  const armorImg = armorSprite ? iconSrcs(armorSprite) : null;

  return (
    <div className={styles.page}>
      <Header />
      <section className={styles.wrap}>

        {/* Header row: title + class rail */}
        <div className={styles.pageHead}>
          <div>
            <p className={styles.kick}>Class Loadouts</p>
            <h1 className={styles.title}>{classDef.name} <em>· {phaseName}</em></h1>
            <p className={styles.lede}>Pick your class and stage. Armor and accessory picks update with every choice.</p>
          </div>
          <div className={styles.classRail} role="group" aria-label="Select class">
            {classes.map((cls) => (
              <button
                key={cls.id}
                type="button"
                className={`${styles.cbtn} ${cls.id === classId ? styles.on : ''}`}
                aria-pressed={cls.id === classId}
                onClick={() => { setClassId(cls.id as ClassId); clearSubclassFilters(); }}
              >
                <span className={styles.cdot} style={{ background: CLASS_COLORS[cls.id] ?? 'var(--accent)' }} />
                {cls.name}
              </button>
            ))}
          </div>
        </div>

        {/* Phase stepper */}
        <div className={styles.stepper} role="group" aria-label="Select phase">
          {phases.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`${styles.step} ${p.id === phaseId ? styles.on : ''}`}
              aria-pressed={p.id === phaseId}
              onClick={() => setPhaseId(p.id as PhaseId)}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Bento grid */}
        <div className={styles.bento}>

          {/* Weapons (wide) */}
          <div className={styles.tileWide + ' ' + styles.tile}>
            <div className={styles.tlabel}><span>Weapons</span><span className={styles.em}>{classDef.name}</span></div>

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

            {filteredBest.length > 0 && (
              <div className={styles.weaponGroup}>
                <div className={styles.weaponGroupLabel}>Best in Slot</div>
                <div className={styles.weaponRow}>
                  {filteredBest.map((w) => <WeaponTile key={w.id} item={w} difficulty={difficulty} />)}
                </div>
              </div>
            )}

            {filteredAlso.length > 0 && (
              <div className={styles.weaponGroup}>
                <div className={styles.weaponGroupLabel}>Also Great</div>
                <div className={styles.weaponRow}>
                  {filteredAlso.map((w) => <WeaponTile key={w.id} item={w} difficulty={difficulty} />)}
                </div>
              </div>
            )}

            {filteredBest.length === 0 && filteredAlso.length === 0 && (
              <p className={styles.empty}>No weapons match your filters for this phase.</p>
            )}
          </div>

          {/* Armor */}
          <div className={styles.tile}>
            <div className={styles.tlabel}><span>Armor</span></div>
            {armorImg ? (
              <div className={styles.armor}>
                <div className={styles.armorDoll}>
                  <img
                    src={armorImg.local} alt={safeLoadout.armor[0].name}
                    className={`${styles.armorSprite} pixel-img`}
                    width="44" height="44" loading="lazy"
                    onError={makeErrorHandler(armorImg.wiki, FALLBACK_ICON)}
                  />
                </div>
                <div className={styles.armorInfo}>
                  {safeLoadout.armor.map((a) => (
                    <div key={a.id} className={styles.armorEntry}>
                      <div className={styles.armorName}>{a.name}</div>
                      {a.why && <div className={styles.armorPerk}>{a.why}</div>}
                    </div>
                  ))}
                  {safeLoadout.armor.length > 1 && (
                    <span className={styles.setBadge}>{safeLoadout.armor.length} sets</span>
                  )}
                </div>
              </div>
            ) : (
              <p className={styles.empty}>No armor data for this phase yet.</p>
            )}
          </div>

          {/* Accessories + Buffs */}
          <div className={styles.tile}>
            <div className={styles.tlabel}><span>Accessories</span></div>
            <ul className={styles.accList}>
              {safeLoadout.accessories.map((acc) => <AccRow key={acc.id} item={acc} difficulty={difficulty} />)}
              {safeLoadout.accessories.length === 0 && <li className={styles.empty}>No accessories data yet.</li>}
            </ul>
            {safeLoadout.buffs.length > 0 && (
              <div className={styles.buffWrap}>
                <div className={styles.buffLabel}>Buffs &amp; Consumables</div>
                <div className={styles.buffPills}>
                  {safeLoadout.buffs.map((b) => <span key={b.id} className={styles.buffPill}>{b.name}</span>)}
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
