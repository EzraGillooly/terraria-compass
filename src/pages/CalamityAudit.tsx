import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import loadoutsJson from '../data/packs/calamity/loadouts.json';
import phasesJson from '../data/packs/calamity/phases.json';
import { ItemModal } from '../components/ItemModal/ItemModal';
import type { Item } from '../data/schema';
import styles from './CalamityAudit.module.css';

/* Internal hardening view (not in the public nav). Reachable at #/calamity-audit.
   Reads the live Calamity loadout data, dedupes every item of one class by id,
   and flags the gaps we harden: weapons with no damage, armor with no craft
   recipe, accessories that are Expert-only. Rows open the same ItemModal the
   loadouts page uses. Flip AUDIT_CLASS to run the pass on the next class. */

const BASE = import.meta.env.BASE_URL;
const AUDIT_CLASS = 'ranger';
const AUDIT_CLASS_LABEL = AUDIT_CLASS.charAt(0).toUpperCase() + AUDIT_CLASS.slice(1);

type Kind = 'weapons' | 'accessories' | 'armor';
type Origin = 'crafted' | 'obtained' | 'unknown';

interface AnyItem {
  id?: string; name?: string; icon?: string; stats?: string; source?: string; station?: string;
  dropRate?: string; dropRateExpert?: string;
  materials?: { name: string; qty?: number }[];
  pieceRecipes?: { materials?: { name: string; qty?: number }[] }[];
  markers?: string[]; expertOnly?: boolean; classicAlt?: AnyItem;
}
interface Loadout {
  class: string; phase: string;
  weapons?: AnyItem[]; tools?: AnyItem[]; accessories?: AnyItem[];
  accessoryPool?: { items?: AnyItem[] }[]; armor?: AnyItem[];
}
interface Row {
  id: string; name: string; icon?: string; origin: Origin; phases: string[];
  stats?: string; hasRecipe: boolean; recipeText?: string;
  expertOnly: boolean; expertMarker: boolean; issue: boolean; raw: AnyItem;
}

const loadouts = loadoutsJson as unknown as Loadout[];
const phaseName = new Map<string, string>((phasesJson as { id: string; name: string }[]).map((p) => [p.id, p.name]));
const phaseOrder = new Map<string, number>((phasesJson as { id: string; order: number }[]).map((p) => [p.id, p.order]));

const baseId = (id: string) => id.replace(/^calpool-/, '');
function originOf(it: AnyItem): Origin {
  const src = (it.source ?? '').toLowerCase();
  if ((it.materials && it.materials.length) || it.pieceRecipes?.length || it.station || src.includes('craft')) return 'crafted';
  if (it.dropRate || it.dropRateExpert || /drop|found|purchas|bought|sold|fished/.test(src)) return 'obtained';
  return 'unknown';
}
const hasDamage = (stats?: string) => !!stats && /\d/.test(stats);
const armorHasRecipe = (it: AnyItem) => !!(it.materials?.length || it.pieceRecipes?.length);
const recipeText = (it: AnyItem): string | undefined => {
  const mats = it.materials?.length ? it.materials : it.pieceRecipes?.flatMap((r) => r.materials ?? []);
  if (!mats?.length) return undefined;
  return mats.map((m) => `${m.qty ?? ''} ${m.name}`.trim()).join(' · ');
};

function collect(kind: Kind): Row[] {
  const by = new Map<string, {
    name: string; icon?: string; origin: Origin; phases: Set<string>;
    stats?: string; recipe: boolean; expertOnly: boolean; expertMarker: boolean; raw: AnyItem;
  }>();
  const push = (it: AnyItem, phase: string) => {
    if (!it?.id) return;
    const key = baseId(it.id);
    const e = by.get(key) ?? { name: it.name ?? key, icon: it.icon, origin: 'unknown' as Origin,
      phases: new Set<string>(), recipe: false, expertOnly: false, expertMarker: false, raw: it };
    e.phases.add(phase);
    if (it.icon) e.icon = it.icon;
    if (it.name) e.name = it.name;
    const o = originOf(it);
    if (o !== 'unknown') e.origin = o;
    if (!hasDamage(e.stats) && hasDamage(it.stats)) e.stats = it.stats;
    if (armorHasRecipe(it)) e.recipe = true;
    if (it.expertOnly === true) e.expertOnly = true;
    if ((it.markers ?? []).includes('expert')) e.expertMarker = true;
    if (Object.keys(it).length > Object.keys(e.raw).length) e.raw = it;
    by.set(key, e);
  };
  for (const l of loadouts) {
    if (l.class !== AUDIT_CLASS) continue;
    const p = l.phase;
    if (kind === 'weapons') {
      (l.weapons ?? []).forEach((w) => push(w, p));
    } else if (kind === 'accessories') {
      (l.accessories ?? []).forEach((a) => { push(a, p); if (a.classicAlt) push(a.classicAlt, p); });
      (l.accessoryPool ?? []).forEach((g) => (g.items ?? []).forEach((a) => push(a, p)));
    } else {
      (l.armor ?? []).forEach((a) => push(a, p));
    }
  }
  return [...by.entries()].map(([id, e]) => {
    const phases = [...e.phases].sort((a, b) => (phaseOrder.get(a) ?? 0) - (phaseOrder.get(b) ?? 0));
    const issue = kind === 'weapons' ? !hasDamage(e.stats) : kind === 'armor' ? !e.recipe : e.expertOnly;
    return { id, name: e.name, icon: e.icon, origin: e.origin, phases, stats: e.stats, hasRecipe: e.recipe,
      recipeText: recipeText(e.raw), expertOnly: e.expertOnly, expertMarker: e.expertMarker, issue, raw: e.raw };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

export function CalamityAudit() {
  const [kind, setKind] = useState<Kind>('weapons');
  const [origin, setOrigin] = useState<'all' | Origin>('all');
  const [issuesOnly, setIssuesOnly] = useState(false);
  const [modalItem, setModalItem] = useState<Item | null>(null);
  const rows = useMemo(() => collect(kind), [kind]);
  const shown = rows.filter((r) => (origin === 'all' || r.origin === origin) && (!issuesOnly || r.issue));
  const issueCount = rows.filter((r) => r.issue).length;
  const issueLabel = kind === 'weapons' ? 'no damage' : kind === 'armor' ? 'no recipe' : 'Expert-only';

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <h1 className={styles.h1}>Calamity {AUDIT_CLASS_LABEL} - hardening audit</h1>
        <p className={styles.sub}>
          Every unique {AUDIT_CLASS} item across all phases. Click a row to open its card. Fix an item once
          in the data and it updates on every phase that uses it.{' '}
          <Link to="/loadouts" className={styles.back}>Back to loadouts</Link>
        </p>
      </header>
      <div className={styles.controls}>
        <div className={styles.seg} role="tablist" aria-label="Item type">
          {(['weapons', 'accessories', 'armor'] as Kind[]).map((k) => (
            <button key={k} type="button" role="tab" aria-selected={kind === k}
              className={`${styles.segBtn} ${kind === k ? styles.on : ''}`} onClick={() => setKind(k)}>{k}</button>
          ))}
        </div>
        {kind !== 'armor' && (
          <div className={styles.seg} role="group" aria-label="Origin">
            {(['all', 'crafted', 'obtained'] as const).map((o) => (
              <button key={o} type="button" className={`${styles.segBtn} ${origin === o ? styles.on : ''}`}
                onClick={() => setOrigin(o)}>{o}</button>
            ))}
          </div>
        )}
        <label className={styles.check}>
          <input type="checkbox" checked={issuesOnly} onChange={(e) => setIssuesOnly(e.target.checked)} />
          Issues only
        </label>
        <span className={styles.count}>
          {shown.length} shown · <strong className={styles.issueText}>{issueCount} {issueLabel}</strong> / {rows.length} total
        </span>
      </div>
      <ul className={styles.list}>
        {shown.map((r) => (
          <li key={r.id}>
            <button type="button" className={`${styles.row} ${r.issue ? styles.rowIssue : ''}`}
              onClick={() => setModalItem(r.raw as unknown as Item)}>
              <img className={styles.icon} src={`${BASE}icons/${r.icon ?? ''}`} alt=""
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }} />
              <div className={styles.main}>
                <div className={styles.nameRow}>
                  <span className={styles.name}>{r.name}</span>
                  <span className={`${styles.badge} ${styles[`o_${r.origin}`]}`}>{r.origin}</span>
                  {kind === 'accessories' && r.expertOnly && <span className={`${styles.badge} ${styles.flag}`}>Expert-only</span>}
                  {kind === 'accessories' && r.expertMarker && <span className={`${styles.badge} ${styles.expert}`}>Expert tag</span>}
                  {kind !== 'accessories' && r.issue && <span className={`${styles.badge} ${styles.flag}`}>{issueLabel}</span>}
                </div>
                <div className={styles.detail}>
                  {kind === 'weapons' && <span className={r.stats ? '' : styles.missing}>{r.stats || 'no damage listed'}</span>}
                  {kind === 'armor' && (
                    <span className={r.hasRecipe ? '' : styles.missing}>
                      {r.recipeText || (r.hasRecipe ? 'has recipe' : 'no recipe listed')}
                    </span>
                  )}
                  {kind === 'accessories' && (
                    <span>
                      {r.expertOnly ? 'Gated: only obtainable in an Expert world' : 'Available in Classic'}
                      {r.expertOnly !== r.expertMarker && ' · flag mismatch (gate vs badge)'}
                    </span>
                  )}
                </div>
                <div className={styles.phases}>{r.phases.map((p) => phaseName.get(p) ?? p).join(' · ')}</div>
              </div>
            </button>
          </li>
        ))}
      </ul>
      <ItemModal item={modalItem} onClose={() => setModalItem(null)} />
    </div>
  );
}
