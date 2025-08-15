"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import styles from "./page.module.css";

const rituals = [
  {
    key: "fire",
    label: "Fire",
    icon: "🔥",
    desc: "for rage or release",
  },
  {
    key: "ocean",
    label: "Ocean",
    icon: "🌊",
    desc: "for grief or goodbye",
  },
  {
    key: "sky",
    label: "Sky",
    icon: "🌌",
    desc: "for secrets or shadows",
  },
];

function getFireDuration(wordCount: number) {
  if (wordCount <= 20) return 7000;
  if (wordCount <= 100) return 10000;
  if (wordCount <= 300) return 17000;
  return 25000;
}

// Add getOceanChunks function
function getOceanChunks(text: string) {
  const words = text
    .replace(/[\n\r]+/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  let i = 0;
  while (i < words.length) {
    const groupSize = 3 + Math.floor(Math.random() * 5); // 3-7 words
    const chunk = words.slice(i, i + groupSize).join(' ');
    if (chunk) chunks.push(chunk);
    i += groupSize;
  }
  return chunks;
}

export default function Home() {
  const [ritual, setRitual] = useState<'fire'|'ocean'|'sky'>("fire");
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<'entry'|'burning'|'gone'>("entry");
  const [burnAnim, setBurnAnim] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showSound, setShowSound] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const fireDuration = getFireDuration(wordCount);
  const [showGoneSub, setShowGoneSub] = useState(false);
  useEffect(() => {
    if (phase === "gone") {
      setShowGoneSub(false);
      const t = setTimeout(() => setShowGoneSub(true), 1200);
      return () => clearTimeout(t);
    }
  }, [phase]);
  const [ashPause, setAshPause] = useState(false);
  const [revealedChunks, setRevealedChunks] = useState(0);
  useEffect(() => {
    if (phase === "burning") {
      setRevealedChunks(0);
      let i = 0;
      function revealNext() {
        setRevealedChunks(i + 1);
        i++;
        if (i < burnChunks.length) {
          setTimeout(revealNext, 320);
        } else {
          setTimeout(() => setBurnAnim(true), 400);
        }
      }
      revealNext();
    } else {
      setRevealedChunks(0);
    }
  }, [phase, text]);

  // Remove typewriter/handwriting reveal and chunking logic
  // Restore burning text to simple line-by-line display and burn animation
  // Instead of burnChunks, just use text.split("\n")
  function getTextChunks(text: string) {
    // Split on whitespace and line breaks, but keep punctuation attached
    const words = text
      .replace(/[\n\r]+/g, ' ') // replace line breaks with space
      .split(/\s+/)
      .map(w => w.trim())
      .filter(Boolean);
    if (words.length <= 20) {
      return words;
    }
    // Deterministically group into 3-word phrases
    let i = 0;
    const chunks: string[] = [];
    const groupSize = 3;
    while (i < words.length) {
      const chunk = words.slice(i, i + groupSize).join(' ');
      if (chunk && !chunks.includes(chunk)) {
        chunks.push(chunk);
      }
      i += groupSize;
    }
    return chunks;
  }
  const burnChunks = getTextChunks(text);
  console.log('burnChunks:', burnChunks);

  // For burning: split text into words, keep line breaks for visual grouping
  const burnWords = text.split(/(\s+|\n)/g).filter(Boolean);

  const handleLetGo = () => {
    if (!text.trim()) return;
    if (ritual === "fire") {
      setBurnAnim(true);
      setShowVideo(true);
      setShowSound(true);
      setPhase("burning");
      setTimeout(() => {
        setPhase("gone");
        setShowVideo(false);
        setShowSound(false);
        setBurnAnim(false);
      }, fireDuration);
    } else if (ritual === "ocean") {
      setShowVideo(true);
      setShowSound(true);
      setPhase("burning");
      // Calculate the max (delay + duration) for all ocean chunks
      const oceanChunksArr = getOceanChunks(text);
      let maxTime = 0;
      // Use the same random duration logic as the animation for each word
      for (let i = 0; i < oceanChunksArr.length; i++) {
        const delay = i * 0.7;
        const duration = 7.5 + Math.random() * 2.5;
        const total = delay + duration;
        if (total > maxTime) maxTime = total;
      }
      setTimeout(() => {
        setPhase("gone");
        setShowVideo(false);
        setShowSound(false);
      }, (maxTime + 5.0) * 1000); // add 5s buffer after all words disappear
    } else if (ritual === "sky") {
      setShowVideo(true);
      setShowSound(true);
      setPhase("burning");
      // Use same logic as fire phase - word count correlation, but much longer for sky
      const skyDuration = getFireDuration(wordCount) + 12000; // 12 seconds longer than fire
      setTimeout(() => {
        setPhase("gone");
        setShowVideo(false);
        setShowSound(false);
      }, skyDuration);
    }
  };

  const [showVeil, setShowVeil] = useState(true);
  useEffect(() => {
    if (phase === "entry") {
      setShowVeil(true);
      const t = setTimeout(() => setShowVeil(false), 2500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Text ghost whispers
  const textGhosts = [
    "i wish i could forget",
    "he never said sorry",
    "i miss who i was",
    "i want to be seen",
    "i’m not angry, just tired",
    "i hope it gets better",
    "i wish i could say it out loud",
    "i’m not who they think",
    "i want to let go",
    "i wish i could forgive myself"
  ];
  const [ghostIdx, setGhostIdx] = useState(0);
  const [showGhost, setShowGhost] = useState(false);
  const [ghostPos, setGhostPos] = useState<{top?: string; left?: string; right?: string; bottom?: string; transform?: string}>(
    {top: '32px', left: '50%', transform: 'translateX(-50%)'}
  );
  useEffect(() => {
    if (phase !== "entry") return;
    setShowGhost(true);
    const interval = setInterval(() => {
      setGhostIdx(idx => (idx + 1) % textGhosts.length);
      setShowGhost(false);
      // Pick a random position: top, left, right, or bottom, with random offset
      const positions = [
        () => ({ top: `${16 + Math.random() * 24}px`, left: '50%', transform: 'translateX(-50%)' }), // top center
        () => ({ top: `${16 + Math.random() * 60}px`, left: `${8 + Math.random() * 24}%`, transform: 'none' }), // top left
        () => ({ top: `${16 + Math.random() * 60}px`, right: `${8 + Math.random() * 24}%`, left: 'auto', transform: 'none' }), // top right
        () => ({ bottom: `${16 + Math.random() * 32}px`, left: '50%', transform: 'translateX(-50%)' }), // bottom center
        () => ({ top: `${24 + Math.random() * 40}%`, left: `${8 + Math.random() * 84}%`, transform: 'none' }), // random in viewport
      ];
      setGhostPos(positions[Math.floor(Math.random() * positions.length)]());
      setTimeout(() => setShowGhost(true), 200);
    }, 5000);
    return () => clearInterval(interval);
  }, [phase]);

  // Remove whispers audio and toggle
  // Particle drift: only render on client
  const [showParticles, setShowParticles] = useState(false);
  type Particle = { left: number; bottom: number; delay: number; duration: number; opacity: number };
  const [particleData, setParticleData] = useState<Particle[]>([]);
  useEffect(() => {
    if (phase === "entry") {
      setShowParticles(true);
      setParticleData(Array.from({length: 18}).map(() => ({
        left: 18 + Math.random() * 64,
        bottom: Math.random() * 30 + 10,
        delay: Math.random() * 6,
        duration: 6.5 + Math.random() * 2.5,
        opacity: 0.06 + Math.random() * 0.08
      })));
    } else {
      setShowParticles(false);
    }
  }, [phase]);

  // Floating burn chunks state
  const [floatingChunks, setFloatingChunks] = useState<{text: string, key: string, x: number, y: number, delay: number}[]>([]);
  const [burnIdx, setBurnIdx] = useState(0);
  // Precompute X positions for short texts
  // No special positions for short texts; always randomize
  const _burnXPositions = null;
  useEffect(() => {
    if (phase !== "burning") {
      setFloatingChunks([]);
      setBurnIdx(0);
      return;
    }
    let active = true;
    // For short texts, show all at once
    if (burnChunks.length <= 18) {
      setFloatingChunks(
        burnChunks.map((chunk, idx) => ({
          text: chunk,
          key: `${idx}-${Date.now()}-${Math.random()}`,
          x: 6 + Math.random() * 88,
          y: 6 + Math.random() * 24,
          delay: 0.1 + Math.random() * 0.5,
        }))
      );
      setBurnIdx(burnChunks.length);
      return;
    }
    // For longer texts, use interval logic
    let nextIdx = burnIdx;
    function addChunk() {
      if (!active) return;
      if (floatingChunks.length >= 18 || nextIdx >= burnChunks.length) return;
      if (floatingChunks.some(c => c.text === burnChunks[nextIdx] && c.key.startsWith(`${nextIdx}-`))) {
        nextIdx++;
        setBurnIdx(nextIdx);
        return;
      }
      const _x = Math.random() * 100;
      const clampedX = 6 + Math.random() * 88;
      const y = 6 + Math.random() * 24;
      const delay = 0.1 + Math.random() * 0.5;
      const uniqueKey = `${nextIdx}-${Date.now()}-${Math.random()}`;
      setFloatingChunks(chunks => [
        ...chunks,
        { text: burnChunks[nextIdx], key: uniqueKey, x: clampedX, y, delay }
      ]);
      nextIdx++;
      setBurnIdx(nextIdx);
    }
    // Add initial batch
    for (let i = 0; i < 10 && burnIdx + i < burnChunks.length; i++) {
      addChunk();
    }
    const interval = setInterval(() => {
      addChunk();
    }, 700);
    return () => { active = false; clearInterval(interval); };
    // eslint-disable-next-line
  }, [phase, text]);

  // Remove faded out chunks
  function handleChunkFade(key: string) {
    setFloatingChunks(chunks => chunks.filter(c => c.key !== key));
  }

  const _oceanChunks = getOceanChunks(text);

  return (
    <div className={styles.nwPage}>
      <header className={styles.nwHeader} style={{display: phase === 'entry' ? undefined : 'none'}}>
      <h1 className={styles.nwTitle}>No One&apos;s Watching</h1>
        <p className={styles.nwSubtitle}>Say it. Feel it. Let it go.</p>
      </header>
      <main className={styles.nwMain}>
        {/* Embers in the scrolling region, only for entry and gone phases */}
        {phase === 'gone' && ritual === 'fire' && (
          <div className={styles.emberParticles} style={{position: 'absolute', top: 0, left: 0, width: '100vw', height: '100%', zIndex: 1, pointerEvents: 'none'}}>
            {Array.from({length: 12}).map((_, i) => (
              <div
                key={`scroll-ember-${i}-${Date.now()}-${Math.random()}`}
                className={styles.ember}
                style={{
                  left: `${6 + Math.random() * 88}%`,
                  bottom: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2.5}s`,
                  animationDuration: `${5.5 + Math.random() * 2.5}s`,
                  opacity: 0.3 + Math.random() * 0.5,
                }}
              />
            ))}
          </div>
        )}
        {phase === "entry" && showVeil && <div className={styles.veilOverlay}></div>}
        {phase === "entry" && <div className={styles.vignetteEntryOverlay}></div>}
        {phase === "entry" && showGhost && (
          <div className={styles.textGhost} key={ghostIdx} style={ghostPos}>{textGhosts[ghostIdx]}</div>
        )}
        {phase === "entry" && (
          <>
            <div className={styles.particleDriftArea}>
              {particleData.map((p, i) => (
                <div
                  key={i}
                  className={styles.particleDrift}
                  style={{
                    left: `${p.left}%`,
                    bottom: `${p.bottom}%`,
                    animationDelay: `${p.delay}s`,
                    animationDuration: `${p.duration}s`,
                    opacity: p.opacity,
                  }}
                />
              ))}
            </div>
            <div className={styles.shadowFigure} aria-hidden>
              <svg viewBox="0 0 120 180" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="60" cy="60" rx="38" ry="48" fill="#fff" fillOpacity="0.18"/>
                <ellipse cx="60" cy="120" rx="48" ry="60" fill="#fff" fillOpacity="0.13"/>
                <ellipse cx="60" cy="150" rx="32" ry="18" fill="#fff" fillOpacity="0.09"/>
              </svg>
            </div>
            <textarea
              ref={textareaRef}
              className={styles.nwTextarea}
              placeholder="Write anything. No one will ever read it. Not even the AI."
              value={text}
              onChange={e => {
                setText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              rows={1}
              style={{overflow: 'hidden'}}
              disabled={phase !== "entry"}
            />
            <div className={styles.nwRitualsWrap}>
              <div className={styles.nwRitualsLabel}>Choose your ritual</div>
              <div className={styles.nwRituals}>
                {rituals.map(r => (
                  <button
                    key={r.key}
                    className={
                      styles.nwRitual + (ritual === r.key ? " " + styles.nwRitualActive : "")
                    }
                    data-ritual={r.key}
                    onClick={() => setRitual(r.key as 'fire'|'ocean'|'sky')}
                    type="button"
                    aria-pressed={ritual === r.key}
                    disabled={phase !== "entry"}
                    style={{position: 'relative', zIndex: 1}}
                  >
                    <span className={styles.ritualGlow + ' ' +
                      (r.key === 'fire' ? styles.ritualGlowFire :
                        r.key === 'ocean' ? styles.ritualGlowOcean : styles.ritualGlowSky)}
                    ></span>
                    <span className={styles.nwRitualIcon}>{r.icon}</span>
                    <span className={styles.nwRitualLabel}>{r.label}</span>
                    <span className={styles.nwRitualDesc}>{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <button
              className={[
                styles.letGoDusk,
                ritual === 'fire' ? styles.letGoDuskFire :
                ritual === 'ocean' ? styles.letGoDuskOcean :
                ritual === 'sky' ? styles.letGoDuskSky : ''
              ].join(' ')}
              type="button"
              disabled={!text.trim()}
              onClick={handleLetGo}
            >
              Let it go
              <span className={styles.letGoRipple} aria-hidden></span>
            </button>
          </>
        )}
        {ritual === 'ocean' && phase === 'burning' && (
          <div className={styles.fireRitualWrap}>
            <video
              key={showVideo ? 'ocean-on' : 'ocean-off'}
              className={styles.fireVideoBg}
              src="/animations/ocean.mp4.mp4"
              autoPlay
              muted
              playsInline
              loop
              style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', objectFit: 'cover', zIndex: 0, pointerEvents: 'none'}}
            />
            {/* Ocean foam overlay */}
            <div className={styles.oceanFoamOverlay} />
            {/* Ocean overlay gradient */}
            <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1, pointerEvents: 'none', background: 'linear-gradient(to top, rgba(6,28,37,0.72) 60%, rgba(6,28,37,0.32) 100%)'}} />
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 2}}>
              {/* Calculate maxTime as in handleLetGo for ocean */}
              {(() => {
                const oceanChunksArr = getOceanChunks(text);
                let maxTime = 0;
                for (let i = 0; i < oceanChunksArr.length; i++) {
                  const delay = i * 1.2; // SLOWER: increase delay between words
                  const duration = 7.5 + Math.random() * 2.5;
                  const total = delay + duration;
                  if (total > maxTime) maxTime = total;
                }
                // All words must disappear at least 5s before maxTime
                const disappearTime = maxTime - 5;
                return oceanChunksArr.map((chunk, i) => {
                  // Clamp each word's delay+duration to disappearTime
                  const delay = i * 1.2; // SLOWER: increase delay between words
                  // If delay > disappearTime, skip rendering this word
                  if (delay > disappearTime) return null;
                  // duration so that delay+duration <= disappearTime
                  const maxDuration = Math.max(1, disappearTime - delay);
                  // Use a random duration up to maxDuration
                  const duration = Math.min(7.5 + Math.random() * 2.5, maxDuration);
                  return (
                    <OceanDriftWord
                      key={i}
                      text={chunk}
                      idx={i}
                      _total={oceanChunksArr.length}
                      oceanPhase={true}
                      forceDelay={delay}
                      forceDuration={duration}
                    />
                  );
                });
              })()}
            </div>
            {showSound && (
              <audio src="/sounds/ocean-waves-377295.mp3" autoPlay loop />
            )}
          </div>
        )}
        {ritual === 'sky' && phase === 'burning' && (
          <div className={styles.fireRitualWrap}>
            <video
              key={showVideo ? 'sky-on' : 'sky-off'}
              className={styles.fireVideoBg}
              src="/animations/nightsky.mp4.mp4"
              autoPlay
              muted
              playsInline
              loop
              style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', objectFit: 'cover', zIndex: 0, pointerEvents: 'none'}}
            />
            {/* Sky overlay gradient */}
            <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1, pointerEvents: 'none', background: 'linear-gradient(to bottom, rgba(0,0,16,0.3) 0%, rgba(0,0,16,0.1) 50%, rgba(0,0,16,0.4) 100%)'}} />
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 2}}>
              {getTextChunks(text).map((chunk, i) => (
                <SkyDriftWord
                  key={i}
                  text={chunk}
                  idx={i}
                  _total={getTextChunks(text).length}
                />
              ))}
            </div>
            {showSound && (
              <audio src="/sounds/nightsky.mp3.mp3" autoPlay loop />
            )}
          </div>
        )}
        {phase === "burning" && ritual === "fire" && (
          <div className={styles.fireRitualWrap}>
            <video
              key={showVideo ? 'fire-on' : 'fire-off'}
              className={styles.fireVideoBg}
              src="/animations/fire.mp4.mp4"
              autoPlay
              muted
              playsInline
              loop
              style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', objectFit: 'cover', zIndex: 0, pointerEvents: 'none'}}
            />
            <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 2}}>
              {floatingChunks.map(chunk => (
                <BurningWord
                  key={chunk.key}
                  text={chunk.text}
                  x={chunk.x}
                  y={chunk.y}
                  delay={chunk.delay}
                  onFade={() => handleChunkFade(chunk.key)}
                />
                ))}
            </div>
            {showSound && (
              <audio src="/sounds/fire-sound-334130.mp3" autoPlay />
            )}
          </div>
        )}
        {ashPause && (
          <div className={styles.ashPauseOverlay + ' ' + styles.ashPauseFadeOut}>
            <div className={styles.emberParticles}>
              {Array.from({length: 8}).map((_, i) => (
                <div
                  key={i}
                  className={styles.ember}
                  style={{
                    left: `${Math.random() * 100}%`,
                    bottom: `${Math.random() * 18}%`,
                    animationDelay: `${Math.random() * 2.5}s`,
                    animationDuration: `${2.2 + Math.random() * 1.8}s`,
                    opacity: 0.3 + Math.random() * 0.4,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        {phase === "gone" && !ashPause && (
          <div className={styles.fireRitualGoneCentered + ' ' + styles.finalFadeIn}>
            <div className={styles.vignetteOverlay}></div>
            {ritual === "fire" ? (
              <>
                <div className={styles.emberParticles} style={{left: 0, right: 0, bottom: 0, width: '100vw', height: '40vh', position: 'fixed', pointerEvents: 'none', zIndex: 11}}>
                  {Array.from({length: 18}).map((_, i) => {
                    const style: React.CSSProperties = {
                      left: '',
                      bottom: `${Math.random() * 38}%`,
                      animationDelay: `${Math.random() * 2.5}s`,
                      animationDuration: `${5.5 + Math.random() * 2.5}s`,
                      opacity: 0.5 + Math.random() * 0.5,
                      width: 6,
                      height: 6,
                      transform: undefined
                    };
                    if (i === 0) {
                      style.left = '0%';
                      style.transform = undefined;
                    } else if (i === 17) {
                      style.left = '100%';
                      style.transform = 'translateX(-100%)';
                    } else {
                      style.left = `${2 + Math.random() * 96}%`;
                      style.transform = undefined;
                    }
                    return (
                      <div
                        key={`ember-${i}-${Date.now()}-${Math.random()}`}
                        className={styles.ember}
                        style={style}
                      />
                    );
                  })}
                </div>
                <div className={styles.goneTextCompelling + ' ' + styles.goneTextTherapeutic}>
                  <div className={styles.goneTextMain}>It&apos;s gone now.</div>
                  {showGoneSub && (
                    <div className={styles.goneTextSub + ' ' + styles.goneTextRelease + ' ' + styles.goneTextSoft}>
                      You don&apos;t have to carry it anymore.
                    </div>
                  )}
                </div>
                <button className={styles.letGoMoreBtnFire + ' ' + styles.finalButtonFade} onClick={() => {
                  setText("");
                  setPhase("entry");
                }}>
                  Let something else go
                </button>
              </>
            ) : ritual === "ocean" ? (
              <>
                <div className={styles.emberParticles} style={{left: 0, right: 0, top: 0, width: '100vw', height: '100vh', position: 'fixed', pointerEvents: 'none', zIndex: 11}}>
                  {Array.from({length: 18}).map((_, i) => {
                    const style: React.CSSProperties = {
                      left: '',
                      top: '',
                      animationDelay: `${Math.random() * 2.5}s`,
                      animationDuration: `${5.5 + Math.random() * 2.5}s`,
                      opacity: 0.5 + Math.random() * 0.5,
                      width: 6,
                      height: 6,
                      transform: undefined,
                      background: 'linear-gradient(180deg, #e8f1f8 60%, #b8dcf3 100%)',
                      borderRadius: '50%',
                      filter: 'blur(1.5px)'
                    };
                    if (i === 0) {
                      style.left = '5%';
                      style.top = '10%';
                      style.transform = undefined;
                    } else if (i === 1) {
                      style.left = '10%';
                      style.top = '60%';
                      style.transform = undefined;
                    } else if (i === 2) {
                      style.left = '80%';
                      style.top = '20%';
                      style.transform = undefined;
                    } else if (i === 17) {
                      style.left = '95%';
                      style.top = '70%';
                      style.transform = 'translateX(-100%)';
                    } else {
                      style.left = `${5 + Math.random() * 90}%`;
                      style.top = `${10 + Math.random() * 60}%`;
                      style.transform = undefined;
                    }
                    return (
                      <div
                        key={`ember-${i}-${Date.now()}-${Math.random()}`}
                        className={styles.ember}
                        style={style}
                      />
                    );
                  })}
                </div>
                {/* Add a row of bubbles at the bottom scroll area, like fire embers */}
                <div className={styles.emberParticles} style={{position: 'absolute', top: 'auto', bottom: 0, left: 0, width: '100vw', height: '18vh', pointerEvents: 'none', zIndex: 12}}>
                  {Array.from({length: 12}).map((_, i) => (
                    <div
                      key={`scroll-bubble-${i}-${Date.now()}-${Math.random()}`}
                      className={styles.ember}
                      style={{
                        left: `${6 + Math.random() * 88}%`,
                        bottom: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2.5}s`,
                        animationDuration: `${5.5 + Math.random() * 2.5}s`,
                        opacity: 0.3 + Math.random() * 0.5,
                        width: 8,
                        height: 8,
                        background: 'linear-gradient(180deg, #e8f1f8 60%, #b8dcf3 100%)',
                        borderRadius: '50%',
                        filter: 'blur(1.5px)'
                      }}
                    />
                  ))}
                </div>
                <div className={styles.goneTextCompelling + ' ' + styles.goneTextTherapeutic}>
                  <div style={{
                    color: '#e2f4f3', 
                    textShadow: '0 0 12px #3dbbff, 0 2px 12px #3dbbff !important',
                    fontFamily: "'Merriweather', serif",
                    fontSize: '3.5rem',
                    fontWeight: 700,
                    marginBottom: '0.2em',
                    letterSpacing: '-1px',
                    textAlign: 'center'
                  }}>It&apos;s at peace now.</div>
                  {showGoneSub && (
                    <div className={styles.goneTextSub + ' ' + styles.goneTextRelease + ' ' + styles.goneTextSoft} style={{color: '#e2f4f3', textShadow: '0 0 6px #b8dcf3, 0 1px 6px #aee1f9'}}>
                      The tide has taken it far from you. You&apos;re allowed to let go.
                    </div>
                  )}
                </div>
                <button className={styles.letGoMoreBtnFire + ' ' + styles.finalButtonFade} onClick={() => {
                  setText("");
                  setPhase("entry");
                }} style={{
                  background: '#000',
                  color: '#e2f4f3',
                  border: '2px solid #3dbbff',
                  boxShadow: '0 0 12px #3dbbff, 0 2px 12px #3dbbff'
                }}>
                  Let something else go
                </button>
              </>
            ) : ritual === "sky" ? (
              <>
                {/* Meteor streaks in final phase */}
                <div className={styles.emberParticles} style={{left: 0, right: 0, top: 0, width: '100vw', height: '100vh', position: 'fixed', pointerEvents: 'none', zIndex: 11}}>
                  {Array.from({length: 12}).map((_, i) => {
                    const meteorAngle = -45 + Math.random() * 90;
                    return (
                      <div
                        key={`final-meteor-${i}-${Date.now()}-${Math.random()}`}
                        className={styles.ember}
                        style={{
                          position: 'absolute',
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          width: `${20 + Math.random() * 60}px`,
                          height: '2px',
                          background: 'linear-gradient(90deg, transparent 0%, #A8BFFF 50%, transparent 100%)',
                          '--meteor-angle': `${meteorAngle}deg`,
                          animationDelay: `${Math.random() * 3}s`,
                          animationDuration: `${2 + Math.random() * 2}s`,
                          animation: `${styles.meteorStreak} ${2 + Math.random() * 2}s linear infinite`,
                          opacity: 0.6 + Math.random() * 0.4
                        } as React.CSSProperties & { '--meteor-angle': string }}
                      />
                    );
                  })}
                </div>
                {/* White twinkling stars everywhere */}
                <div className={styles.emberParticles} style={{left: 0, right: 0, top: 0, width: '100vw', height: '100vh', position: 'fixed', pointerEvents: 'none', zIndex: 12}}>
                  {Array.from({length: 25}).map((_, i) => {
                    // Ensure better distribution, especially on the left side
                    let left, top;
                    if (i < 8) {
                      // Force some stars on the left side
                      left = `${Math.random() * 30}%`;
                      top = `${Math.random() * 100}%`;
                    } else if (i < 15) {
                      // Distribute across the middle
                      left = `${30 + Math.random() * 40}%`;
                      top = `${Math.random() * 100}%`;
                    } else {
                      // Random distribution for the rest
                      left = `${Math.random() * 100}%`;
                      top = `${Math.random() * 100}%`;
                    }
                    
                    return (
                      <div
                        key={`twinkle-star-${i}-${Date.now()}-${Math.random()}`}
                        className={styles.ember}
                        style={{
                          position: 'absolute',
                          left: left,
                          top: top,
                          width: `${2 + Math.random() * 3}px`,
                          height: `${2 + Math.random() * 3}px`,
                          background: 'radial-gradient(circle, #FFFFFF 0%, #FFFFFF 60%, transparent 100%)',
                          borderRadius: '50%',
                          filter: 'blur(0.5px)',
                          animationDelay: `${Math.random() * 4}s`,
                          animationDuration: `${3 + Math.random() * 2}s`,
                          animation: `${styles.starTwinkle} ${3 + Math.random() * 2}s ease-in-out infinite`,
                          opacity: 0.4 + Math.random() * 0.6
                        }}
                      />
                    );
                  })}
                </div>

                <div className={styles.goneTextCompelling + ' ' + styles.goneTextTherapeutic}>
                  <div style={{
                    color: '#A8BFFF',
                    textShadow: '0px 0px 6px #A183FF',
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    marginBottom: '0.2em',
                    letterSpacing: '-1px',
                    textAlign: 'center',
                    whiteSpace: 'nowrap'
                  }}>It&apos;s floating among constellations now.</div>
                  {showGoneSub && (
                    <div className={styles.goneTextSub + ' ' + styles.goneTextRelease + ' ' + styles.goneTextSoft} style={{
                      color: '#B4C6EC',
                      fontStyle: 'italic',
                      fontSize: '1.125rem',
                      textShadow: '0px 0px 4px #A183FF'
                    }}>
                      Not even the moon could tell on you. That secret&apos;s safe.
                    </div>
                  )}
                </div>
                <button className={styles.letGoMoreBtnFire + ' ' + styles.finalButtonFade} onClick={() => {
                  setText("");
                  setPhase("entry");
                }} style={{
                  background: '#000',
                  color: '#A8BFFF',
                  border: '2px solid #A183FF',
                  boxShadow: '0 0 12px #A183FF, 0 2px 12px #A183FF'
                }}>
                  Let something else go
                </button>
              </>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}

function BurningWord({ text, x, y, delay, onFade }: { text: string, x: number, y: number, delay: number, onFade: () => void }) {
  const [fade, setFade] = useState(false);
  useEffect(() => {
    const appear = setTimeout(() => setFade(true), delay * 1000);
    const remove = setTimeout(() => onFade(), 3200 + delay * 1000);
    return () => { clearTimeout(appear); clearTimeout(remove); };
  }, [delay, onFade]);
  // In BurningWord, always use transform: translateX(-50%)
  return (
    <span
      className={fade ? styles.burningWord + ' ' + styles.burningWordFade : styles.burningWord}
      style={{
        left: `${x}vw`,
        bottom: `${y}vh`,
        position: 'absolute',
        pointerEvents: 'none',
        zIndex: 2,
        animationDelay: `${delay}s`,
        transform: 'translateX(-50%)',
      }}
    >
      {text}
    </span>
  );
}

// Add OceanDriftWord component at the end of the file
function OceanDriftWord({ text, idx, _total, oceanPhase, forceDelay, forceDuration }: { text: string, idx: number, _total: number, oceanPhase?: boolean, forceDelay?: number, forceDuration?: number }) {
  // Randomize animation delay, sine offset, scale, and rotation
  const delay = forceDelay !== undefined ? forceDelay : (oceanPhase ? idx * 0.7 : 0.2 + Math.random() * 1.5 + idx * 0.44);
  const duration = forceDuration !== undefined ? forceDuration : (oceanPhase ? 7.5 + Math.random() * 2.5 : 7.5 + Math.random() * 2.5);
  // For ocean phase, gently randomize X (40-60vw) and Y (10-18vh) for calm, spaced entry
  const xStart = oceanPhase ? 2 + Math.random() * 96 : 12 + Math.random() * 76;
  const yStart = oceanPhase ? 10 + Math.random() * 10 : 8 + Math.random() * 18 + idx * 8;
  const sinePhase = Math.random() * Math.PI * 2;
  const scale = 0.97 + Math.random() * 0.03;
  const rotate = -2 + Math.random() * 4; // -2 to +2 deg
  const driftX = (Math.random() < 0.5 ? -1 : 1) * (24 + Math.random() * 32); // -24~ -56 or 24~56 px

  // All hooks must be called unconditionally
  const [visible, setVisible] = useState(!oceanPhase);
  const [startAnim, setStartAnim] = useState(false);

  useEffect(() => {
    if (!oceanPhase) return;
    const show = setTimeout(() => setVisible(true), delay * 1000);
    const hide = setTimeout(() => setVisible(false), (delay + duration) * 1000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [delay, duration, oceanPhase]);

  useEffect(() => {
    if (visible) {
      setTimeout(() => setStartAnim(true), 30); // trigger after mount
    } else {
      setStartAnim(false);
    }
  }, [visible]);

  if (oceanPhase && !visible) return null;

  return (
    <span
      className={styles.oceanDriftWord}
      style={{
        left: `${xStart}vw`,
        top: startAnim ? `80vh` : `${yStart}vh`,
        position: 'absolute',
        pointerEvents: 'none',
        zIndex: 2,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        filter: `blur(0.2px)`,
        transform: `translateX(-50%) scale(${scale}) rotate(${rotate}deg)`,
        '--sine-phase': sinePhase,
        '--drift-x': `${driftX}px`,
        fontFamily: `'Cormorant Garamond', 'Garamond', 'Playfair Display', serif`,
        color: '#e8f1f8',
        textShadow: '0 0 8px #b8dcf3, 0 2px 8px #aee1f9',
        letterSpacing: '0.04em',
        marginBottom: '1.2em',
        fontWeight: 500,
        opacity: startAnim ? 0 : 1,
        transition: `top ${duration}s cubic-bezier(0.33,1,0.68,1), opacity 1.2s linear ${duration-1.2}s`
      } as React.CSSProperties}
    >
      {text}
    </span>
  );
}

function SkyDriftWord({ text, idx, _total }: { text: string, idx: number, _total: number }) {
  // Sky animation: words appear calmly, twinkle once, morph to ball, disappear
  const delay = idx * 4; // Calm, slow entry
  const animDuration = 5.2; // 2s fade in + 2s twinkle + 1.2s morph/fade
  const xStart = 10 + Math.random() * 80;
  const yStart = 15 + Math.random() * 25;

  // Ensure all words are gone at least 2s before phase ends
  const totalPhaseDurationSec = (getFireDuration(text.split(/\s+/).filter(Boolean).length) + 12000) / 1000;
  const maxIdx = Math.floor((totalPhaseDurationSec - 2 - animDuration) / 4);

  // All hooks must be called unconditionally
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (idx > maxIdx) return;
    const show = setTimeout(() => setVisible(true), delay * 1000);
    const hide = setTimeout(() => setVisible(false), (delay + animDuration) * 1000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [idx, maxIdx, delay, animDuration]);

  // Return early after hooks are defined
  if (idx > maxIdx || !visible) return null;
  return (
    <span
      className={styles.skyDriftWord + ' ' + styles.skwTwinkleToBall}
      style={{
        left: `${xStart}vw`,
        top: `${yStart}vh`,
        position: 'absolute',
        pointerEvents: 'none',
        zIndex: 2,
        fontFamily: `'Playfair Display', 'Georgia', serif`,
        color: '#A8BFFF',
        textShadow: '0px 0px 6px #A183FF',
        letterSpacing: '0.02em',
        fontWeight: 400,
        fontSize: '1.1rem',
        animationDelay: `${delay}s`,
        animationDuration: `${animDuration}s`,
      } as React.CSSProperties}
    >
      {text}
    </span>
  );
}
