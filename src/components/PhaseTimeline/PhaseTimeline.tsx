import { useState } from 'react';
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

/** Boss sprite that represents "you are working toward this checkpoint" */
const BOSS_ICONS: Record<PhaseId, string> = {
  'pre-bosses':   `${WIKI}/King_Slime.png`,
  'pre-skeletron':`${WIKI}/Eye_of_Cthulhu_Head_Boss.png`,
  'pre-wof':      `${WIKI}/Skeletron_Head_Boss.png`,
  'pre-mech':     `${WIKI}/Wall_of_Flesh.png`,
  'pre-plantera': `${WIKI}/Skeletron_Prime_Head_Boss.png`,
  'pre-golem':    `${WIKI}/Plantera.png`,
  'pre-cultist':  `${WIKI}/Golem.png`,
  'pre-moonlord': `${WIKI}/Lunatic_Cultist.png`,
  'endgame':      `${WIKI}/Moon_Lord_Head_Boss.png`,
};

interface PhaseNodeProps {
  phaseDef: PhaseDef;
  activePhaseId: PhaseId;
  activeOrder: number;
  onSelect: (id: PhaseId) => void;
}

function PhaseNode({ phaseDef, activePhaseId, activeOrder, onSelect }: PhaseNodeProps) {
  const isActive = phaseDef.id === activePhaseId;
  const isPast   = phaseDef.order < activeOrder;
  const iconSrc  = BOSS_ICONS[phaseDef.id as PhaseId];

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
        src={iconSrc}
        alt=""
        aria-hidden="true"
        className={`${styles.nodeIcon} pixel-img`}
        width="36"
        height="36"
        loading="lazy"
        decoding="async"
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
