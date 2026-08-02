import { useEffect, useRef, useState } from 'react';
import TiltedCard from './TiltedCard';
import PillNav from './PillNav';
import GlowingEdgeCard from './GlowingEdgeCard';
import MusicDeck from './MusicDeck';
import Minesweeper from './Minesweeper';

const NAV_ITEMS = [
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects-list' },
  { label: 'Experience', href: '#work-exp' },
  { label: 'Contact', href: '#contact' },
];

const TOOLS = ['React', 'Vue.js', 'TypeScript', 'JavaScript', 'Golang', 'Python', 'PostgreSQL', 'ESP32', 'Git', 'Docker', 'Postman', 'Figma', 'Documentation'];

const PROJECTS = [
  { n: '01', title: 'IRS — Internal Recruitment System', copy: 'Vue.js & Quasar recruitment platform for PNM: document completion module, interview rescheduling, and centralized candidate status monitoring.', label: 'IRS screenshot', src: '/assets/irs.jpg' },
  { n: '02', title: 'PASS — PNM Assessment System', copy: 'React Vite + TypeScript dashboard and exam monitoring interface, with real-time face verification and anti-bypass security to protect assessment integrity.', label: 'PASS screenshot', src: '/assets/pass.jpg' },
  { n: '03', title: 'Beasiswa — Scholarship management', copy: 'React Vite + TypeScript tool for semester grade input, streamlining application, applicant data, and eligibility verification for company-sponsored scholarship programs.', label: 'Beasiswa screenshot', src: '/assets/beasiswa.jpg' },
  { n: '04', title: 'Brosis — Mentorship platform', copy: 'React Vite + TypeScript platform for mentors to track, guide, and evaluate mentees through structured progress logs, reporting, and periodic assessment.', label: 'Brosis screenshot', src: '/assets/brosis.jpg' },
  { n: '05', title: 'Si Cita — river monitoring', copy: 'Jan 2025 – Jun 2025. Real-time river monitoring on ESP32-S3 across five sensor types (TDS, turbidity, temperature, pH, rainfall); led a technical journal, patent draft and research article to publication.', label: 'Si Cita photo', src: '/assets/si-cita.jpg' },
  { n: '06', title: 'Smart Meeting Room System (Thesis Project)', copy: 'Aug – Dec 2025. AI-powered meeting room booking on Raspberry Pi: connects to the Google Calendar API for real-time booking, and validates attendance with Dlib face verification.', label: 'Smart Meeting Room photo', src: '/assets/smart-meeting-room.jpg' },
  { n: '07', title: 'Smart Ticket System (Client project)', copy: 'An IoT ticketing device in the spirit of Smart Meeting Room System, synced to Google Sheets: shows technicians their assigned tickets and lets them update ticket status directly from the device.', label: 'Smart Ticket System photo', src: '/assets/smart-ticket-system.jpg' },
];

function Reveal({ as: Tag = 'section', className = '', children, ...rest }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } }, { threshold: 0.15 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref} className={`reveal ${inView ? 'in-view' : ''} ${className}`} {...rest}>{children}</Tag>;
}

function CountUp({ target, suffix = '' }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setVal(target); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const start = performance.now(), dur = 900;
        const step = (now) => {
          const p = Math.min((now - start) / dur, 1);
          setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io.disconnect();
      }
    }, { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [target]);
  return <p className="stat-num" ref={ref}>{val}{suffix}</p>;
}

function Photo({ src, alt }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) return alt;
  return <img src={src} alt={alt} onError={() => setBroken(true)} />;
}

function Gallery({ slides }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 4000);
    return () => clearInterval(t);
  }, [slides.length]);
  return (
    <div className="exp-gallery">
      {slides.map((s, i) => (
        <div key={i} className={`slide ${i === idx ? 'active' : ''}`}><Photo src={s.src} alt={s.alt} /></div>
      ))}
      <div className="exp-gallery-dots">
        {slides.map((_, i) => (
          <button key={i} type="button" className={`exp-dot ${i === idx ? 'active' : ''}`} aria-label={`Photo ${i + 1}`} onClick={() => setIdx(i)} />
        ))}
      </div>
    </div>
  );
}

const BOARD_SIZE = 4;

function emptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
}

function cloneBoard(board) {
  return board.map((row) => [...row]);
}

function addRandomTile(board) {
  const empties = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 0) empties.push([r, c]);
    }
  }
  if (empties.length === 0) return board;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  const next = cloneBoard(board);
  next[r][c] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

function reverseRows(board) {
  return board.map((row) => [...row].reverse());
}

function transpose(board) {
  return board[0].map((_, c) => board.map((row) => row[c]));
}

function slideRowLeft(row) {
  const filtered = row.filter((v) => v !== 0);
  const merged = [];
  let scoreGained = 0;
  for (let i = 0; i < filtered.length; i++) {
    if (filtered[i] === filtered[i + 1]) {
      const val = filtered[i] * 2;
      merged.push(val);
      scoreGained += val;
      i++;
    } else {
      merged.push(filtered[i]);
    }
  }
  while (merged.length < BOARD_SIZE) merged.push(0);
  return { row: merged, scoreGained };
}

function slide(board, dir) {
  let b = cloneBoard(board);
  if (dir === 'right') b = reverseRows(b);
  else if (dir === 'up') b = transpose(b);
  else if (dir === 'down') b = reverseRows(transpose(b));

  let scoreGained = 0;
  let result = b.map((row) => {
    const { row: newRow, scoreGained: gained } = slideRowLeft(row);
    scoreGained += gained;
    return newRow;
  });

  if (dir === 'right') result = reverseRows(result);
  else if (dir === 'up') result = transpose(result);
  else if (dir === 'down') result = transpose(reverseRows(result));

  const moved = result.some((row, r) => row.some((v, c) => v !== board[r][c]));
  return { board: result, moved, scoreGained };
}

function canMove(board) {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 0) return true;
      if (c < BOARD_SIZE - 1 && board[r][c] === board[r][c + 1]) return true;
      if (r < BOARD_SIZE - 1 && board[r][c] === board[r + 1][c]) return true;
    }
  }
  return false;
}

function tileStyle(v) {
  if (!v) return {};
  const t = Math.min(Math.log2(v) / 11, 1);
  return {
    background: `color-mix(in srgb, var(--color-accent) ${16 + t * 74}%, var(--color-surface))`,
    color: t > 0.5 ? 'var(--color-bg)' : 'var(--color-text)',
  };
}

const KEY_DIRECTIONS = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', a: 'left', d: 'right', w: 'up', s: 'down' };

function Game2048() {
  const [board, setBoard] = useState(() => addRandomTile(addRandomTile(emptyBoard())));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem('game2048-best') || 0));
  const [status, setStatus] = useState('playing'); // playing | won | over
  const boardRef = useRef(board);
  boardRef.current = board;
  const touchRef = useRef(null);

  const reset = () => {
    setBoard(addRandomTile(addRandomTile(emptyBoard())));
    setScore(0);
    setStatus('playing');
  };

  const move = (dir) => {
    if (status === 'over') return;
    const { board: next, moved, scoreGained } = slide(boardRef.current, dir);
    if (!moved) return;
    const withNew = addRandomTile(next);
    setBoard(withNew);
    setScore((s) => {
      const ns = s + scoreGained;
      setBest((b) => {
        const nb = Math.max(b, ns);
        localStorage.setItem('game2048-best', String(nb));
        return nb;
      });
      return ns;
    });
    if (status === 'playing' && withNew.some((row) => row.includes(2048))) setStatus('won');
    else if (!canMove(withNew)) setStatus('over');
  };

  const onKeyDown = (e) => {
    const dir = KEY_DIRECTIONS[e.key];
    if (dir) { e.preventDefault(); move(dir); }
  };

  const onTouchStart = (e) => { touchRef.current = e.touches[0]; };
  const onTouchEnd = (e) => {
    if (!touchRef.current) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.clientX;
    const dy = e.changedTouches[0].clientY - touchRef.current.clientY;
    touchRef.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left');
    else move(dy > 0 ? 'down' : 'up');
  };

  return (
    <div
      className="game-box game2048-box"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="game2048-head">
        <span className="game-kicker">2048 — click box, then arrow keys or swipe</span>
        <span className="game-best">Score {score} · Best {best}</span>
      </div>
      <div className="game2048-grid">
        {board.flat().map((v, i) => (
          <div key={i} className="game2048-cell" style={tileStyle(v)}>{v || ''}</div>
        ))}
      </div>
      {status !== 'playing' && (
        <div className="game2048-overlay">
          <p className="game-label">{status === 'won' ? 'You win! 🎉' : 'Game over'}</p>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            {status === 'won' && (
              <button type="button" className="btn btn-ghost" onClick={(e) => { e.stopPropagation(); setStatus('playing'); }}>Keep playing</button>
            )}
            <button type="button" className="btn btn-primary" onClick={(e) => { e.stopPropagation(); reset(); }}>Play again</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectThumb({ label, src }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `rotateY(${px * 14}deg) rotateX(${-py * 14}deg) scale(1.04)`;
  };
  const onLeave = () => { ref.current.style.transform = ''; };
  return <div className="f-thumb lighten" ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}><Photo src={src} alt={label} /></div>;
}

const CodeIcon = () => (
  <svg viewBox="0 0 256 256" fill="currentColor"><path d="M69.12,94.15,28.5,128l40.62,33.85a8,8,0,1,1-10.24,12.3l-48-40a8,8,0,0,1,0-12.3l48-40a8,8,0,1,1,10.24,12.3Zm176,27.7-48-40a8,8,0,1,0-10.24,12.3L227.5,128l-40.62,33.85a8,8,0,1,0,10.24,12.3l48-40a8,8,0,0,0,0-12.3ZM162.73,32.48a8,8,0,0,0-10.25,4.79l-64,176a8,8,0,0,0,4.79,10.26A8.14,8.14,0,0,0,96,224a8,8,0,0,0,7.52-5.27l64-176A8,8,0,0,0,162.73,32.48Z"/></svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" width="18" height="18"><path d="M16.004 2.667c-7.364 0-13.333 5.97-13.333 13.333 0 2.353.615 4.646 1.782 6.666L2.667 29.333l6.84-1.794a13.27 13.27 0 0 0 6.497 1.694h.006c7.363 0 13.332-5.97 13.332-13.333S23.367 2.667 16.004 2.667zm0 24.4h-.005a11.05 11.05 0 0 1-5.63-1.541l-.404-.24-4.06 1.065 1.084-3.958-.263-.406a11.03 11.03 0 0 1-1.69-5.887c0-6.11 4.973-11.083 11.09-11.083 2.963 0 5.748 1.154 7.842 3.25a11.02 11.02 0 0 1 3.246 7.837c0 6.11-4.973 11.083-11.11 11.083zm6.087-8.303c-.334-.167-1.97-.972-2.276-1.083-.305-.111-.527-.167-.75.167-.222.333-.86 1.083-1.055 1.305-.194.223-.389.25-.722.084-.334-.167-1.409-.52-2.684-1.656-.992-.885-1.663-1.978-1.858-2.311-.194-.334-.02-.514.147-.68.15-.15.334-.39.5-.584.167-.194.223-.334.334-.556.111-.223.056-.417-.028-.584-.083-.167-.75-1.807-1.028-2.474-.27-.65-.545-.562-.75-.573l-.639-.011c-.222 0-.583.083-.888.417-.305.333-1.166 1.14-1.166 2.78 0 1.64 1.194 3.226 1.361 3.448.167.222 2.352 3.593 5.699 5.038.796.344 1.417.55 1.901.703.799.254 1.526.218 2.101.132.641-.096 1.97-.805 2.248-1.583.278-.777.278-1.444.194-1.583-.083-.14-.305-.223-.639-.39z"/></svg>
);

export default function App() {
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const onHeroMove = (e) => {
    const r = heroRef.current.getBoundingClientRect();
    heroRef.current.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    heroRef.current.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  };
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) videoRef.current?.pause();
  }, []);

  return (
    <>
      <header className="site-nav">
        <div className="site-nav-inner">
          <PillNav
            className="site-pillnav"
            logo={<span>Car</span>}
            logoHref="#"
            items={NAV_ITEMS}
            activeHref="#skills"
          />
          <button type="button" className="btn btn-primary site-nav-cta" onClick={() => window.open('https://wa.me/6282119394048?text=' + encodeURIComponent('Halo Cartika, saya lihat portofolio kamu dan ingin ngobrol lebih lanjut.'), '_blank')}><WhatsAppIcon /><span>hit me up!</span></button>
        </div>
      </header>

      <section className="hero" ref={heroRef} onMouseMove={onHeroMove}>
        <video
          className="hero-video"
          ref={videoRef}
          src="https://designerstephen.github.io/public-assets/videos/serene-art-hero.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="hero-scrim" />
        <div className="wrap">
          <div className="hero-layout">
            <div className="hero-inner">
              <h1 className="display fade-rise delay-1"><span className="line">Interfaces that show up.</span> <span className="line">Built to be used.</span></h1>
              <p className="sub fade-rise delay-2">I'm Cartika, a front-end developer focused on building enterprise web applications with React and Vue. I create interfaces that are clean, responsive, and designed for real users not just good-looking demos.</p>
              <div className="row fade-rise delay-3">
                <button type="button" className="btn btn-primary" onClick={() => document.getElementById('projects-list').scrollIntoView()}>View my work</button>
                <button type="button" className="btn btn-ghost" onClick={() => (location.href = 'mailto:cartika2004@gmail.com')}>Get in touch</button>
              </div>
            </div>
            <div className="hero-photo fade-rise delay-4">
              <TiltedCard
                imageSrc="/assets/portrait.jpg"
                altText="Portrait photograph of Cartika"
                captionText="Cartika Sabrina K."
                containerHeight="100%"
                containerWidth="100%"
                imageHeight="100%"
                imageWidth="100%"
                rotateAmplitude={10}
                scaleOnHover={1.08}
                showMobileWarning={false}
                showTooltip={true}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="wrap">
        <Reveal className="split" id="about">
          <div className="split-copy">
            <span className="kicker">About</span>
            <h2 className="split-title">Front-end focused, full stack curious</h2>
            <p className="note">I'm a Computer Engineering Technology student at IPB University and an Application Development Intern at PT Permodalan Nasional Madani. I enjoy building responsive, user-centered web applications with React and Vue, while exploring back-end development and IoT to better understand how complete systems come together.</p>
          </div>
          <GlowingEdgeCard className="glow-music">
            <MusicDeck />
          </GlowingEdgeCard>
        </Reveal>
      </div>

      <section className="stats" aria-label="Cartika, by the numbers">
        <div className="wrap">
          <div className="grid">
            <div><CountUp target={7} /><p className="stat-label">Projects shipped</p></div>
            <div><CountUp target={2} /><p className="stat-label">Internships completed</p></div>
            <div><CountUp target={4} /><p className="stat-label">SYSTEMS BUILT FOR WORK</p></div>
            <div><CountUp target={10} suffix="+" /><p className="stat-label">Certifications earned</p></div>
          </div>
        </div>
      </section>

      <div className="wrap">
        <section className="features" id="skills">
          <span className="kicker" style={{ textAlign: 'center' }}>Skills & proficiencies</span>
          <Reveal as="div" className="feature">
            <p className="f-num">01</p>
            <h2 className="f-title">Front-end</h2>
            <p className="f-copy">My main focus: React (Vite + TypeScript), Vue.js (Quasar), JavaScript, HTML5/CSS3 — built for enterprise dashboards and recruitment platforms.</p>
          </Reveal>
          <Reveal as="div" className="feature">
            <p className="f-num">02</p>
            <h2 className="f-title">Back-end & systems (basics)</h2>
            <p className="f-copy">Working knowledge of Golang, Python, PHP, SQL Server, PostgreSQL, MySQL, plus training in Clean Architecture and Viper configuration — enough to build and connect a full stack.</p>
          </Reveal>
          <Reveal as="div" className="feature">
            <p className="f-num">03</p>
            <h2 className="f-title">AI & IoT</h2>
            <p className="f-copy">Face recognition with Dlib, CNN and OpenCV, Google Calendar API, ESP32-S3, Arduino IDE, PLC systems.</p>
          </Reveal>
          <Reveal as="div" className="feature">
            <p className="f-num">04</p>
            <h2 className="f-title">Hardware, tools & QA</h2>
            <p className="f-copy">3D design in AutoCAD, PCB routing in Eagle, Postman, Swagger, Sprint Planning, UAT, MIG/UT documentation, Git and Docker.</p>
          </Reveal>
        </section>

        <section className="features" id="tools">
          <span className="kicker">Tools & technologies</span>
          <div className="ticker">
            <div className="ticker-track">
              {[...TOOLS, ...TOOLS].map((t, i) => (
                <div className="tool-card" key={`${t}-${i}`} aria-hidden={i >= TOOLS.length}>
                  <span className="tool-icon"><CodeIcon /></span><span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="features" id="projects-list">
          <span className="kicker" style={{ textAlign: 'center' }}>Projects</span>
          {PROJECTS.map((p) => (
            <Reveal as="div" className="feature proj-feature" key={p.n}>
              <ProjectThumb label={p.label} src={p.src} />
              <p className="f-num">{p.n}</p>
              <h2 className="f-title">{p.title}</h2>
              <p className="f-copy">{p.copy}</p>
            </Reveal>
          ))}
        </section>

        <Reveal className="split" id="projects">
          <div className="split-copy">
            <span className="kicker">Featured project</span>
            <h2 className="split-title">Smart Meeting Room System</h2>
            <p className="note">Final project and PNM implementation, Aug–Dec 2025. An AI-powered room booking ecosystem on Raspberry Pi: connects to the Google Calendar API to book meeting rooms in real time, and validates attendance with Dlib face verification, on a custom PCB and 3D-designed enclosure built in Eagle and AutoCAD.</p>
          </div>
          <GlowingEdgeCard className="glow-photo">
            <figure className="split-figure lighten photo-slot" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface)', fontSize: 13, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>
              <Photo src="/assets/smart-meeting-room.jpg" alt="Add a photo of the Smart Meeting Room System" />
            </figure>
          </GlowingEdgeCard>
        </Reveal>

        <section className="features" id="work-exp">
          <span className="kicker" style={{ textAlign: 'center' }}>Experience</span>
          <div className="exp-item">
            <Gallery slides={[
              { src: '/assets/pnm-team.jpg', alt: 'PNM team photo' },
              { src: '/assets/pnm-office.jpg', alt: 'PNM office moment' },
            ]} />
            <div className="exp-copy">
              <p className="f-num">01</p>
              <h2 className="f-title">Application Development Intern, PNM</h2>
              <p className="f-copy">Jun 2025 – Jun 2026. Delivered internal platforms through Sprint Planning and UAT, with backend training in Clean Architecture, Viper and SQL Server, and produced Migration Guides (MIG) and Unit Testing (UT) documentation.</p>
            </div>
          </div>
          <div className="exp-item">
            <Gallery slides={[
              { src: '/assets/toyo-team.jpg', alt: 'Toyo Sensing team photo' },
              { src: '/assets/toyo-fieldwork.jpg', alt: 'Toyo Sensing field work' },
            ]} />
            <div className="exp-copy">
              <p className="f-num">02</p>
              <h2 className="f-title">IoT Development Intern, PT Toyo Sensing Indonesia</h2>
              <p className="f-copy">Jan 2025 – Jun 2025. Applied IoT technology to water management systems, working hands-on with ESP32-S3 and Arduino.</p>
            </div>
          </div>
        </section>

        <section className="features" id="languages">
          <span className="kicker" style={{ textAlign: 'center' }}>Languages & certificates</span>
          <div className="feature"><p className="f-num" style={{ textAlign: 'center' }}>01</p><h2 className="f-title">English — IELTS 6.0</h2><p className="f-copy">Overall Band Score 6.0 (2025/2026).</p></div>
          <div className="feature"><p className="f-num" style={{ textAlign: 'center' }}>02</p><h2 className="f-title">Mandarin — HSK 3 (in progress)</h2><p className="f-copy">Currently learning towards HSK 3.</p></div>
          <div className="feature"><p className="f-num" style={{ textAlign: 'center' }}>03</p><h2 className="f-title">Cisco Networking Academy</h2><p className="f-copy">Cyber Threat Management, Endpoint Security, Network Defense, and CCNA: Introduction to Networks.</p></div>
          <div className="feature"><p className="f-num" style={{ textAlign: 'center' }}>04</p><h2 className="f-title">Dicoding Indonesia</h2><p className="f-copy">Machine Learning Development, Python Programming, JavaScript Programming, SQL, DevOps, and Software Development.</p></div>
        </section>

        <Reveal as="section" className="features playlist" id="games">
          <span className="kicker" style={{ textAlign: 'center' }}>Mini games</span>
          <h2 className="split-title playlist-title">Procrastinate here for a second</h2>
          <p className="playlist-sub">2048 on the left, Minesweeper on the right — both save your best score locally.</p>
          <div className="games-grid">
            <GlowingEdgeCard className="glow-2048">
              <Game2048 />
            </GlowingEdgeCard>
            <GlowingEdgeCard className="glow-2048">
              <Minesweeper />
            </GlowingEdgeCard>
          </div>
        </Reveal>

        <section className="quote">
          <figure>
            <blockquote>"From riverbank sensors to enterprise recruitment platforms — I like building things that show up and work when it matters."</blockquote>
            <figcaption>— Cartika, Computer Engineering Technology, IPB University</figcaption>
          </figure>
        </section>

        <hr className="rule" />

        <section className="close" id="contact">
          <h3>Let's build something reliable</h3>
          <p className="sub">Open to full-time Software Engineer, Front-End Developer, or Application Developer opportunities. Based in the Jakarta Metropolitan Area, Indonesia — reachable by email, LinkedIn, or phone.</p>
          <div className="signup">
            <input className="input" type="email" placeholder="cartika2004@gmail.com" aria-label="Email address" readOnly />
            <button type="button" className="btn btn-primary" onClick={() => (location.href = 'mailto:cartika2004@gmail.com')}>Email me</button>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginTop: 'var(--half)' }}>
            <button type="button" className="btn btn-ghost" onClick={() => window.open('https://www.linkedin.com/in/cartikasabrinakhairunisa', '_blank')}>LinkedIn</button>
            <button type="button" className="btn btn-ghost" onClick={() => (location.href = 'tel:+6282119394048')}>(+62) 821-1939-4048</button>
          </div>
        </section>

        <footer>Cartika Sabrina Khairunisa — Computer Engineering Technology, IPB University. Jakarta Metropolitan Area, Indonesia.</footer>
      </div>
    </>
  );
}
