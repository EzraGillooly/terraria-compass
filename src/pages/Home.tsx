import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
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
  {
    title: 'Crafting',
    blurb: 'The recipes behind milestone weapons, armor sets, and key accessories.',
    to: '/crafting',
    icon: 'items/bee-keeper.png',
  },
];

export function Home() {
  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <section
        className={styles.hero}
        style={{ backgroundImage: `url(${BASE}hero/loadouts.png)` }}
        aria-label="Homepage hero"
      >
        <div className={styles.heroWash} aria-hidden="true" />

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

        <img
          src={sprite('bosses/eye-of-cthulhu.png')}
          alt=""
          aria-hidden="true"
          className={`${styles.heroSprite} pixel-img`}
          width="96"
          height="96"
          loading="lazy"
        />
      </section>

      {/* ── Explore section ── */}
      <section className={styles.exploreSection} aria-labelledby="explore-heading">
        <div className={styles.sectionHead}>
          <p className={styles.sectionKicker}>The Guide</p>
          <h2 id="explore-heading">Where do you <em>want to start?</em></h2>
          <p className={styles.sectionLede}>
            Four chapters covering everything from your first night to the Moon Lord.
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
