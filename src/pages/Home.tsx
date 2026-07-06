import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useAppState } from '../lib/app-context';
import styles from './Home.module.css';

const BASE = import.meta.env.BASE_URL;
const sprite = (path: string) => `${BASE}icons/${path}`;

const EXPLORE_CARDS = [
  {
    title: 'Bosses',
    blurb: 'Every boss in order, with summon methods, key drops, and what each fight unlocks.',
    to: '/bosses',
    icon: 'bosses/wall-of-flesh.png',
  },
  {
    title: 'Biomes',
    blurb: 'Every environment, its mobs, and the best loot to farm in each.',
    to: '/biomes',
    icon: 'bosses/plantera.png',
  },
  {
    title: 'Loadouts',
    blurb: 'Class-specific weapons, armor, and accessories for every progression stage.',
    to: '/loadouts',
    icon: 'items/blade-of-grass.png',
  },
];

// Deterministic star field (stable across renders, no layout jitter)
const STARS = Array.from({ length: 46 }, (_, i) => ({
  left: 6 + (i * 97) % 88,
  top: 5 + (i * 53) % 60,
  big: i % 6 === 0,
  delay: ((i * 0.37) % 3).toFixed(2),
}));

export function Home() {
  const { isDayMode } = useAppState();

  return (
    <div className={styles.page}>
      {/* ── Animated hero (follows the global day/night toggle) ── */}
      <section
        className={styles.hero}
        data-night={isDayMode ? 'false' : 'true'}
        aria-label="Homepage hero"
      >
        <div className={styles.sky} aria-hidden="true" />
        <div className={styles.topWash} aria-hidden="true" />

        {/* Day scene */}
        <div className={`${styles.clouds} ${styles.dayOnly}`} aria-hidden="true">
          <span className={`${styles.cloud} ${styles.c1}`} />
          <span className={`${styles.cloud} ${styles.c2}`} />
          <span className={`${styles.cloud} ${styles.c3}`} />
        </div>
        <div className={`${styles.sun} ${styles.dayOnly}`} aria-hidden="true" />

        {/* Night scene */}
        <div className={`${styles.stars} ${styles.nightOnly}`} aria-hidden="true">
          {STARS.map((s, i) => (
            <span
              key={i}
              className={`${styles.star} ${s.big ? styles.starBig : ''}`}
              style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s` }}
            />
          ))}
        </div>
        <div className={`${styles.moon} ${styles.nightOnly}`} aria-hidden="true" />

        <div className={styles.grass} aria-hidden="true" />

        <Header variant="photo" />

        <div className={styles.heroBody}>
          <p className={styles.kicker}>Your compass through Terraria</p>
          <h1 className={styles.heroTitle}>
            Never wonder <em>what&rsquo;s next</em> again.
          </h1>
          <p className={styles.heroLede}>
            Boss order, biome tips, and the right gear for every stage. Built for players
            who got a little lost between Day 1 and the Wall of Flesh.
          </p>
          <div className={styles.ctaRow}>
            <Link to="/bosses" className={styles.btnPrimary}>
              Start with the bosses <span className={styles.arrow} aria-hidden="true">→</span>
            </Link>
            <Link to="/loadouts" className={styles.btnSecondary}>Browse loadouts</Link>
          </div>
        </div>
      </section>

      {/* ── Explore section ── */}
      <section className={styles.exploreSection} aria-labelledby="explore-heading">
        <div className={styles.sectionHead}>
          <p className={styles.sectionKicker}>The Guide</p>
          <h2 id="explore-heading">Where do you <em>want to start?</em></h2>
          <p className={styles.sectionLede}>
            Three chapters covering everything from your first night to the Moon Lord.
          </p>
        </div>
        <div className={styles.exploreGrid}>
          {EXPLORE_CARDS.map((card) => (
            <Link key={card.to} to={card.to} className={styles.xcard}>
              <img
                src={sprite(card.icon)}
                alt=""
                aria-hidden="true"
                className={`${styles.xcardIcon} pixel-img`}
                width="48"
                height="48"
                loading="lazy"
              />
              <h3 className={styles.xcardTitle}>{card.title}</h3>
              <p className={styles.xcardBlurb}>{card.blurb}</p>
              <span className={styles.xcardGo} aria-hidden="true">Open →</span>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
