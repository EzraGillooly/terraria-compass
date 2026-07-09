import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import styles from './Home.module.css';

const BASE = import.meta.env.BASE_URL;

// Real Terraria backgrounds that crossfade behind the hero
const SCENES = [
  'hero/bg/forest-4.png',
  'hero/bg/forest-6.png',
  'hero/bg/forest-9.png',
  'hero/bg/forest-10.png',
  'hero/bg/forest-14.gif',
  'hero/bg/forest-16.gif',
  'hero/bg/forest-17.png',
  'hero/bg/forest-19.gif',
  'hero/bg/ocean-4.png',
  'hero/bg/ocean-6.png',
  'hero/bg/ocean-7.png',
].map((p) => `${BASE}${p}`);
const CLOUD = (n: number) => `${BASE}hero/sky/cloud-${n}.png`;

export function Home() {
  // Start on a random background, then crossfade to the next every few seconds
  const [scene, setScene] = useState(() => Math.floor(Math.random() * SCENES.length));

  useEffect(() => {
    const id = setInterval(() => setScene((s) => (s + 1) % SCENES.length), 9000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
      {/* ── Hero: crossfading Terraria backgrounds ── */}
      <section className={styles.hero} aria-label="Homepage hero">
        {/* Crossfading real-Terraria backgrounds */}
        <div className={styles.dayScenes} aria-hidden="true">
          {SCENES.map((src, i) => (
            <div
              key={i}
              className={`${styles.scene} ${scene === i ? styles.sceneOn : ''}`}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>

        {/* Drifting Terraria clouds, kept to the upper third */}
        <div className={styles.clouds} aria-hidden="true">
          <img className={`${styles.cloud} ${styles.cl1} pixel-img`} src={CLOUD(1)} alt="" />
          <img className={`${styles.cloud} ${styles.cl2} pixel-img`} src={CLOUD(3)} alt="" />
          <img className={`${styles.cloud} ${styles.cl3} pixel-img`} src={CLOUD(8)} alt="" />
          <img className={`${styles.cloud} ${styles.cl4} pixel-img`} src={CLOUD(5)} alt="" />
        </div>

        <div className={styles.topWash} aria-hidden="true" />

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
            <Link to="/bosses" className={`${styles.btnPrimary} pixel-frame`}>
              Start with the bosses
              <svg className={styles.arrow} viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
                <path d="M6 3 L12 9 L6 15" fill="none" stroke="#000" strokeWidth="6" strokeLinecap="square" strokeLinejoin="miter" />
                <path d="M6 3 L12 9 L6 15" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" />
              </svg>
            </Link>
            <Link to="/loadouts" className={`${styles.btnSecondary} pixel-frame`}>Browse loadouts</Link>
          </div>
        </div>
      </section>
      </main>

      <Footer flush />
    </div>
  );
}
