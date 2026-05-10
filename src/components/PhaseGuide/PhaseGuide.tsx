import type { PhaseDef } from '../../data/schema';
import styles from './PhaseGuide.module.css';

interface PhaseGuideProps {
  phase: PhaseDef;
}

export function PhaseGuide({ phase }: PhaseGuideProps) {
  return (
    <details className={styles.details} open>
      <summary className={styles.summary}>How do I know I&apos;m here?</summary>
      <div className={styles.content}>
        <div className={styles.description}>{phase.description}</div>
        <div>
          This phase ends when: <strong>{phase.triggeredBy}</strong>
        </div>
        <ul>
          {phase.cues.map((cue) => (
            <li key={cue}>{cue}</li>
          ))}
        </ul>
      </div>
    </details>
  );
}
