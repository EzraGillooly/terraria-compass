import { Link } from 'react-router-dom';
import type { ClassId, PhaseDef } from '../../data/schema';
import styles from './BossRoadmap.module.css';

interface BossRoadmapProps {
  classId: ClassId;
  phases: PhaseDef[];
}

export function BossRoadmap({ classId, phases }: BossRoadmapProps) {
  const roadmapEntries = phases
    .slice(0, -1)
    .map((phase, index) => ({ phase, targetPhase: phases[index + 1] }))
    .filter(
      (
        entry,
      ): entry is {
        phase: PhaseDef;
        targetPhase: PhaseDef;
      } => Boolean(entry.targetPhase),
    );

  return (
    <section aria-labelledby="boss-roadmap-heading" className={styles.section}>
      <h2 id="boss-roadmap-heading">Boss roadmap</h2>
      <ul className={styles.rail}>
        {roadmapEntries.map(({ phase, targetPhase }) => (
          <li key={phase.id}>
            <Link
              aria-label={`${phase.triggeredBy} — go to ${targetPhase.name}`}
              className={styles.link}
              to={`/phase/${targetPhase.id}/${classId}`}
            >
              <span className={styles.eyebrow}>Defeating</span>
              <span className={styles.label}>{phase.triggeredBy}</span>
              <span className={styles.target}>Opens {targetPhase.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
