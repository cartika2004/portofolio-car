/**
 * MusicDeck - swipeable card-stack music player ("On rotation").
 * Ported from a Tailwind/light-mode demo: reskinned to this site's navy/black
 * system, no react-router-dom (unused in the original beyond an unused HashRouter
 * wrapper), no lucide-react (inline SVGs, matching the rest of this codebase).
 *
 * Playback uses iTunes' public 30-second preview clips (previewUrl from the
 * iTunes Search API) rather than hosting full copyrighted tracks ourselves.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SONGS = [
  {
    id: '1',
    title: 'Sweatshirt',
    artist: 'Patrick Hizon & EJEAN',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/8c/22/5a/8c225a3b-ddc6-a813-0e3e-f32e27e5b2d2/artwork.jpg/300x300bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/7a/2e/58/7a2e581e-c815-5f91-498f-4f4ef4848ca6/mzaf_24716943790463043.plus.aac.p.m4a',
    tint: '#3b5bdb',
    headerText: 'ON ROTATION',
    subText: 'Songs I keep replaying while building things.',
  },
  {
    id: '2',
    title: 'Matilda',
    artist: 'Harry Styles',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/2a/19/fb/2a19fb85-2f70-9e44-f2a9-82abe679b88e/886449990061.jpg/300x300bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/03/29/7d/03297dd4-5dbe-4ec6-9480-f40846b7181c/mzaf_15378071810157311314.plus.aac.p.m4a',
    tint: '#e0417a',
    headerText: 'ON REPEAT',
    subText: 'A track that never leaves the playlist.',
  },
  {
    id: '3',
    title: "Prettiest Thing I've Ever Seen",
    artist: 'LANY',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/87/c1/62/87c16211-2ca9-ae0c-f383-bd3ae78b6db4/00823375022114_Cover.jpg/300x300bb.jpg',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/24/a1/ce/24a1cec1-5013-e233-802f-87279e936fab/mzaf_10046644892408684791.plus.aac.p.m4a',
    tint: '#14b8a6',
    headerText: 'CURRENT FAVORITE',
    subText: 'The one on loop this month.',
  },
];

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5-13-7.5z" /></svg>
  );
}
function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
  );
}
function SkipBackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="2.4" height="16" rx="1" /><path d="M20 4.5v15L8 12l12-7.5z" /></svg>
  );
}
function SkipForwardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="17.6" y="4" width="2.4" height="16" rx="1" /><path d="M4 4.5v15l12-7.5L4 4.5z" /></svg>
  );
}

function Waveform({ isPlaying }) {
  const barCount = 32;
  const [bars, setBars] = useState(() => Array.from({ length: barCount }, () => Math.random()));

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setBars((prev) => prev.map((h) => {
        const change = (Math.random() - 0.5) * 0.5;
        return Math.max(0.1, Math.min(1, h + change));
      }));
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="dp-waveform">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className="dp-bar"
          animate={{ height: `${height * 100}%`, opacity: isPlaying ? 0.75 + height * 0.25 : 0.35 }}
          transition={{ duration: 0.1 }}
        />
      ))}
    </div>
  );
}

function Cover({ src, tint, fallbackLetter }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <div className="dp-cover" style={{ background: `linear-gradient(135deg, ${tint}, var(--color-navy))` }}>
        <span>{fallbackLetter}</span>
      </div>
    );
  }
  return (
    <div className="dp-cover dp-cover-img">
      <img src={src} alt="" onError={() => setBroken(true)} />
    </div>
  );
}

function DeckCard({ song, isPlaying, onTogglePlay, onNext, onPrev, isBackground = false }) {
  return (
    <div className={`dp-card ${isBackground ? 'is-background' : ''}`}>
      <div className="dp-card-tint" style={{ background: `linear-gradient(to bottom, ${song.tint}33, transparent)` }} />

      <div className="dp-card-header">
        <motion.h3 layoutId={`header-${song.id}`} className="dp-headline">{song.headerText}</motion.h3>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dp-subline">{song.subText}</motion.p>
      </div>

      <div className="dp-mini">
        <Cover src={song.cover} tint={song.tint} fallbackLetter={song.artist.slice(0, 1)} />

        <div className="dp-info">
          <div className="dp-info-row">
            <div className="dp-meta">
              <h4>{song.title}</h4>
              <p>{song.artist}</p>
            </div>
            <div className="dp-controls">
              <button type="button" onClick={onPrev} aria-label="Previous track"><SkipBackIcon /></button>
              <button type="button" className="dp-play" onClick={onTogglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button type="button" onClick={onNext} aria-label="Next track"><SkipForwardIcon /></button>
            </div>
          </div>
          <div className="dp-wave-row">
            <Waveform isPlaying={isPlaying} />
            <span className="dp-duration">0:30 preview</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const swipeVariants = {
  enter: { scale: 0.95, y: -24, opacity: 0.6, zIndex: 2, x: 0 },
  center: { zIndex: 3, x: 0, y: 0, scale: 1, opacity: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: (direction) => ({
    zIndex: 3, x: direction > 0 ? 260 : -260, opacity: 0, scale: 1,
    rotate: direction > 0 ? 8 : -8, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function MusicDeck() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const handleNext = () => { setDirection(1); setIsPlaying(false); setCurrentIndex((p) => (p + 1) % SONGS.length); };
  const handlePrev = () => { setDirection(-1); setIsPlaying(false); setCurrentIndex((p) => (p - 1 + SONGS.length) % SONGS.length); };
  const togglePlay = () => setIsPlaying((p) => !p);

  const activeSong = SONGS[currentIndex];
  const nextSong = SONGS[(currentIndex + 1) % SONGS.length];
  const nextNextSong = SONGS[(currentIndex + 2) % SONGS.length];

  // Play/pause the shared audio element for whichever track is active.
  // currentIndex is in the deps so a track switch never leaves the previous
  // preview running under the new card.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentIndex]);

  return (
    <div className="dp-stage">
      <audio
        ref={audioRef}
        src={activeSong.previewUrl}
        preload="none"
        onEnded={() => setIsPlaying(false)}
      />

      <motion.div
        key={`bg2-${nextNextSong.id}`}
        className="dp-layer"
        initial={{ scale: 0.85, y: -48, opacity: 0 }}
        animate={{ scale: 0.9, y: -48, zIndex: 1, opacity: 0.4 }}
        transition={{ duration: 0.4 }}
      >
        <DeckCard song={nextNextSong} isPlaying={false} onTogglePlay={() => {}} onNext={() => {}} onPrev={() => {}} isBackground />
      </motion.div>

      <motion.div
        key={`bg1-${nextSong.id}`}
        className="dp-layer"
        initial={{ scale: 0.9, y: -24, opacity: 0.3 }}
        animate={{ scale: 0.95, y: -24, zIndex: 2, opacity: 0.7 }}
        transition={{ duration: 0.4 }}
      >
        <DeckCard song={nextSong} isPlaying={false} onTogglePlay={() => {}} onNext={() => {}} onPrev={() => {}} isBackground />
      </motion.div>

      <AnimatePresence custom={direction} mode="popLayout">
        <motion.div
          key={activeSong.id}
          custom={direction}
          variants={swipeVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="dp-active"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.7}
          onDragEnd={(e, { offset }) => {
            if (offset.x < -100) handlePrev();
            else if (offset.x > 100) handleNext();
          }}
        >
          <DeckCard song={activeSong} isPlaying={isPlaying} onTogglePlay={togglePlay} onNext={handleNext} onPrev={handlePrev} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
