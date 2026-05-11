import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import type { PhaseDef, PhaseId } from '../../data/schema';
import styles from './PhaseTimeline.module.css';

interface PhaseTimelineProps {
  activePhaseId: PhaseId;
  onSelect: (id: PhaseId) => void;
  phase: PhaseDef;
  phases: PhaseDef[];
}

const ERA_GROUPS: Array<{ label: string; ids: PhaseId[] }> = [
  { label: 'Pre-Hardmode', ids: ['pre-bosses', 'pre-skeletron', 'pre-wof'] },
  { label: 'Hardmode',     ids: ['pre-mech', 'pre-plantera', 'pre-golem'] },
  { label: 'Endgame',      ids: ['pre-cultist', 'pre-moonlord', 'endgame'] },
];

const WIKI = 'https://terraria.wiki.gg/wiki/Special:FilePath';
const BASE = import.meta.env.BASE_URL;
const fallbackBossIcon =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'%3E%3Crect width='36' height='36' fill='%234A6830'/%3E%3Ctext x='18' y='24' text-anchor='middle' font-size='18' fill='%23C8D4A4' font-family='sans-serif'%3E%3F%3C/text%3E%3C/svg%3E";

/** Maps each phase to local and wiki boss head/portrait icons. */
const BOSS_ICONS: Record<PhaseId, [string, string]> = {
  'pre-bosses':   [`${BASE}icons/bosses/king-slime.png`,       `${WIKI}/King_Slime_Head_Boss.png`],
  'pre-skeletron':[`${BASE}icons/bosses/eye-of-cthulhu.png`,   `${WIKI}/Eye_of_Cthulhu_Head_Boss.png`],
  'pre-wof':      [`${BASE}icons/bosses/skeletron.png`,         `${WIKI}/Skeletron_Head_Boss.png`],
  'pre-mech':     [`${BASE}icons/bosses/wall-of-flesh.png`,     `${WIKI}/Wall_of_Flesh_Head_Boss.png`],
  'pre-plantera': [`${BASE}icons/bosses/skeletron-prime.png`,   `${WIKI}/Skeletron_Prime_Head_Boss.png`],
  'pre-golem':    [`${BASE}icons/bosses/plantera.png`,          `${WIKI}/Plantera_Head_Boss.png`],
  'pre-cultist':  [`${BASE}icons/bosses/golem.png`,             `${WIKI}/Golem_Head_Boss.png`],
  'pre-moonlord': [`${BASE}icons/bosses/lunatic-cultist.png`,   `${WIKI}/Lunatic_Cultist_Head_Boss.png`],
  'endgame':      [`${BASE}icons/bosses/moon-lord.png`,         `${WIKI}/Moon_Lord_Head_Boss.png`],
};

interface PhaseNodeProps {
  phaseDef: PhaseDef;
  activePhaseId: PhaseId;
  activeOrder: number;
  onSelect: (id: PhaseId) => void;
}

function PhaseNode({ phaseDef, activePhaseId, activeOrder, onSelect }: PhaseNodeProps) {
  const isActive              = phaseDef.id === activePhaseId;
  const isPast                = phaseDef.order < activeOrder;
  const [localSrc, wikiFallback] = BOSS_ICONS[phaseDef.id as PhaseId];

  const handleError = (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;

    if (img.dataset.iconFallbackStage === 'placeholder') {
      return;
    }

    if (img.dataset.iconFallbackStage !== 'wiki') {
      img.dataset.iconFallbackStage = 'wiki';
      img.src = wikiFallback;
      return;
    }

    img.dataset.iconFallbackStage = 'placeholder';
    img.src = fallbackBossIcon;
  };

  return (
    <button
      type="button"
      className={styles.node}
      data-active={String(isActive)}
      data-past={String(isPast)}
      aria-label={phaseDef.name}
      aria-pressed={isActive}
      onClick={() => onSelect(phaseDef.id as PhaseId)}
    >
      <img
        src={localSrc}
        alt=""
        aria-hidden="true"
        className={`${styles.nodeIcon} pixel-img`}
        width="36"
        height="36"
        loading="lazy"
        decoding="async"
        onError={handleError}
      />
      {/* Tooltip on hover */}
      <span className={styles.tooltip} role="tooltip">
        {phaseDef.name}
      </span>
    </button>
  );
}

export function PhaseTimeline({ activePhaseId, onSelect, phase, phases }: PhaseTimelineProps) {
  const [showCues, setShowCues] = useState(false);
  const activeOrder = phases.find((p) => p.id === activePhaseId)?.order ?? 0;

  return (
    <div className={styles.root}>
      {/* Era groups */}
      <div className={styles.eras}>
        {ERA_GROUPS.map((era) => (
          <div className={styles.era} key={era.label}>
            <div className={styles.eraLabel}>[ {era.label.toUpperCase()} ]</div>
            <div className={styles.track}>
              {era.ids.map((id, i) => {
                const phaseDef = phases.find((p) => p.id === id);
                if (!phaseDef) return null;
                return (
                  <div className={styles.nodeWrap} key={id}>
                    {i > 0 && <span className={styles.connector} aria-hidden="true" />}
                    <PhaseNode
                      phaseDef={phaseDef}
                      activePhaseId={activePhaseId}
                      activeOrder={activeOrder}
                      onSelect={onSelect}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Active phase label + "How do I know?" */}
      <div className={styles.phaseInfo}>
        <span className={styles.activePhaseName}>{phase.name}</span>
        <span className={styles.separator}>·</span>
        <span className={styles.triggerText}>
          Ends when: <strong>{phase.triggeredBy}</strong>
        </span>
        <span className={styles.separator}>·</span>
        <button
          type="button"
          className={styles.cuesToggle}
          aria-expanded={showCues}
          onClick={() => setShowCues((v) => !v)}
        >
          How do I know I&apos;m here?
        </button>
      </div>

      {showCues && (
        <ul className={styles.cuesList}>
          {phase.cues.map((cue) => (
            <li key={cue}>{cue}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
