import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useAppState } from '../lib/app-context';
import { biomes } from '../data/biomes';
import styles from './Home.module.css';

const EXPLORE_CARDS = [
  {
    num: '01',
    title: 'Boss Progression',
    blurb: 'Boss order, summon methods, key drops, and what each fight unlocks.',
    to: '/bosses',
    color: '#E84A4A',
  },
  {
    num: '02',
    title: 'Biomes & Bestiary',
    blurb: 'Every environment, its mobs, and the best items to farm per biome.',
    to: '/biomes',
    color: '#6EC96E',
  },
  {
    num: '03',
    title: 'Weapons & Loadouts',
    blurb: 'Class-specific weapon picks, armor, and accessories by progression phase.',
    to: '/loadouts',
    color: '#9F7AE0',
  },
  {
    num: '04',
    title: 'Crafting Trees',
    blurb: 'The recipes behind milestone weapons, armor sets, and accessories.',
    to: '/crafting',
    color: '#F2C24A',
  },
];

const BIOME_CHIPS = biomes.slice(0, 6);

export function Home() {
  const { isDayMode } = useAppState();

  return (
    <div className={styles.page} data-night={String(!isDayMode)}>
      {/* ── Hero ── */}
      <section className={styles.hero} aria-label="Homepage hero">
        <div className={styles.heroPhoto} />
        <div className={styles.heroWash} />

        <Header variant="photo" />

        <div className={styles.heroBody}>
          <p className={styles.kicker}>Your compass through a Terraria adventure</p>
          <h1 className={styles.heroTitle}>
            Your <em>Compass</em><br />Through<br />Terraria.
          </h1>
          <p className={styles.heroLede}>
            Boss order, biome tips, weapon picks, and what to wear into each fight —
            for players who got a little lost between Day 1 and the Wall of Flesh.
          </p>
          <div className={styles.ctaRow}>
            <Link to="/bosses" className={styles.btnLine}>Start the Journey</Link>
            <Link to="/loadouts" className={styles.btnGhost}>Explore Loadouts</Link>
          </div>
        </div>

        <div className={styles.heroFoot}>
          <div className={styles.biomeSwitcher} role="list">
            {BIOME_CHIPS.map((b) => (
              <Link
                key={b.id}
                to="/biomes"
                className={styles.bChip}
                style={{ '--chip-accent': b.palette.mid } as React.CSSProperties}
                role="listitem"
              >
                <span
                  className={styles.bChipDot}
                  style={{ background: b.palette.mid }}
                  aria-hidden="true"
                />
                {b.name}
              </Link>
            ))}
          </div>
          <span className={styles.heroReading}>
            <span
              className={styles.hrPip}
              style={{ background: isDayMode ? '#F2C24A' : '#4A5AA8' }}
              aria-hidden="true"
            />
            {isDayMode ? 'Daytime' : 'Nighttime'}
          </span>
        </div>
      </section>

      {/* ── Explore section ── */}
      <section className={styles.exploreSection} aria-labelledby="explore-heading">
        <div className={styles.sectionHead}>
          <p className={styles.sectionKicker}>The Guide</p>
          <h2 id="explore-heading">
            Where do you <em>want to start?</em>
          </h2>
          <p className={styles.sectionLede}>
            Four chapters covering everything from your first night to the Wall of Flesh.
          </p>
        </div>
        <div className={styles.exploreGrid}>
          {EXPLORE_CARDS.map((card) => (
            <Link
              key={card.num}
              to={card.to}
              className={styles.xcard}
              style={{ '--xcard-color': card.color } as React.CSSProperties}
            >
              <div
                className={styles.xcardTint}
                style={{ background: `linear-gradient(160deg, ${card.color}22 0%, transparent 60%)` }}
              />
              <div className={styles.xcardBody}>
                <div className={styles.xcardNum}>{card.num}</div>
                <h3 className={styles.xcardTitle}>{card.title}</h3>
                <p className={styles.xcardBlurb}>{card.blurb}</p>
                <span className={styles.xcardGo}>Open Chapter</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
