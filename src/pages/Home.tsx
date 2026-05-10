import { BossRoadmap } from '../components/BossRoadmap';
import { Link } from 'react-router-dom';
import { classes, phases } from '../lib/data';
import styles from './Home.module.css';

export function Home() {
  const defaultClass = classes[0]?.id ?? 'melee';

  return (
    <div className={styles.layout}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Beginner-friendly progression companion</p>
        <h1>Terraria Compass</h1>
        <p className={styles.lead}>
          Pick a phase and a class, then get a practical answer for what to use
          right now instead of digging through the full wiki mid-playthrough.
        </p>
      </section>

      <BossRoadmap classId={defaultClass} phases={phases} />

      <section aria-labelledby="home-classes-heading">
        <h2 id="home-classes-heading">Choose a class</h2>
        <div className={styles.classGrid}>
          {classes.map((classDef) => (
            <Link
              className={styles.classCard}
              key={classDef.id}
              to={`/phase/pre-bosses/${classDef.id}`}
            >
              <span className={styles.className}>{classDef.name}</span>
              <span className={styles.classBlurb}>{classDef.blurb}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
