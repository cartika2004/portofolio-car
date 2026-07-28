import { useEffect, useRef, useState } from 'react';

const TOOLS = ['React', 'Vue.js', 'TypeScript', 'JavaScript', 'Golang', 'Python', 'PostgreSQL', 'ESP32', 'Git', 'Docker', 'Postman', 'Figma', 'Documentation'];

const PROJECTS = [
  { n: '01', title: 'IRS — Internal Recruitment System', copy: 'Vue.js & Quasar recruitment platform for PNM: document completion module, interview rescheduling, and centralized candidate status monitoring.', label: 'IRS screenshot', src: '/assets/irs.jpg' },
  { n: '02', title: 'PASS — PNM Assessment System', copy: 'React Vite + TypeScript dashboard and exam monitoring interface, with real-time face verification and anti-bypass security to protect assessment integrity.', label: 'PASS screenshot', src: '/assets/pass.jpg' },
  { n: '03', title: 'Beasiswa — Scholarship management', copy: 'React Vite + TypeScript tool for semester grade input, streamlining application, applicant data, and eligibility verification for company-sponsored scholarship programs.', label: 'Beasiswa screenshot', src: '/assets/beasiswa.jpg' },
  { n: '04', title: 'Brosis — Mentorship platform', copy: 'React Vite + TypeScript platform for mentors to track, guide, and evaluate mentees through structured progress logs, reporting, and periodic assessment.', label: 'Brosis screenshot', src: '/assets/brosis.jpg' },
  { n: '05', title: 'Si Cita — river monitoring', copy: 'Jan 2025 – Jun 2025. Real-time river monitoring on ESP32-S3 across five sensor types (TDS, turbidity, temperature, pH, rainfall); led a technical journal, patent draft and research article to publication.', label: 'Si Cita photo', src: '/assets/si-cita.jpg' },
  { n: '06', title: 'Smart Meeting Room System (Final Project)', copy: 'Aug – Dec 2025. AI-powered meeting room booking on Raspberry Pi: connects to the Google Calendar API for real-time booking, and validates attendance with Dlib face verification.', label: 'Smart Meeting Room photo', src: '/assets/smart-meeting-room.jpg' },
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

export default function App() {
  const heroRef = useRef(null);
  const onHeroMove = (e) => {
    const r = heroRef.current.getBoundingClientRect();
    heroRef.current.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    heroRef.current.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  };

  return (
    <>
      <nav className="nav">
        <span className="nav-brand">Cartika Sabrina Khairunisa</span>
        <a href="#skills" className="active">Skills</a>
        <a href="#projects-list">Projects</a>
        <a href="#work-exp">Experience</a>
        <a href="#contact">Contact</a>
        <button type="button" className="btn btn-primary" onClick={() => (location.href = 'mailto:cartika2004@gmail.com')}>Contact me</button>
      </nav>

      <section className="hero reveal in-view" ref={heroRef} onMouseMove={onHeroMove}>
        <figure className="hero-figure lighten">
          <img src="/assets/portrait.jpg" alt="Portrait photograph of Cartika" />
        </figure>
        <div className="wrap">
          <div className="hero-inner">
            <h1 className="display"><span className="line">Interfaces that show up.</span> <span className="line">Built to be used.</span></h1>
            <p className="sub">I'm Cartika, a front-end focused Computer Engineering Technology student at IPB University and Application Development Intern at PT Permodalan Nasional Madani. I build enterprise interfaces in React and Vue — with just enough back-end and IoT know-how to connect them to the real world.</p>
            <div className="row">
              <button type="button" className="btn btn-primary" onClick={() => document.getElementById('projects-list').scrollIntoView()}>View my work</button>
              <button type="button" className="btn btn-ghost" onClick={() => (location.href = 'mailto:cartika2004@gmail.com')}>Get in touch</button>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap">
        <Reveal className="split" id="about">
          <div className="split-copy">
            <span className="kicker">About</span>
            <h2 className="split-title">Front-end focused, full stack curious</h2>
            <p className="note">A Computer Engineering Technology student at IPB University (8th semester, 138 credits, 3.82 GPA), currently interning at PT Permodalan Nasional Madani. I care most about interfaces people actually enjoy using, backed by just enough backend and IoT knowledge to ship the whole thing.</p>
          </div>
          <Game2048 />
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
          <div className="tools-grid">
            {TOOLS.map((t) => (
              <div className="tool-card" key={t}><span className="tool-icon"><CodeIcon /></span><span>{t}</span></div>
            ))}
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
          <figure className="split-figure lighten photo-slot" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface)', fontSize: 13, color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>
            <Photo src="/assets/smart-meeting-room.jpg" alt="Add a photo of the Smart Meeting Room System" />
          </figure>
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

        <section className="quote">
          <figure>
            <blockquote>"From riverbank sensors to enterprise recruitment platforms — I like building things that show up and work when it matters."</blockquote>
            <figcaption>— Cartika, Computer Engineering Technology, IPB University</figcaption>
          </figure>
        </section>

        <hr className="rule" />

        <section className="close" id="contact">
          <h3>Let's build something reliable</h3>
          <p className="sub">Open to full-stack and IoT internship or graduate roles. Based in Jakarta Metropolitan Area, Indonesia — reachable by email, LinkedIn, or phone.</p>
          <div className="signup">
            <input className="input" type="email" placeholder="cartika2004@gmail.com" aria-label="Email address" readOnly />
            <button type="button" className="btn btn-primary" onClick={() => (location.href = 'mailto:cartika2004@gmail.com')}>Email me</button>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginTop: 'var(--half)' }}>
            <button type="button" className="btn btn-ghost" onClick={() => window.open('https://www.linkedin.com/in/cartikasabrinakhairunisa', '_blank')}>LinkedIn</button>
            <button type="button" className="btn btn-ghost" onClick={() => (location.href = 'tel:+622119394048')}>(+62) 821-1939-4048</button>
          </div>
        </section>

        <footer>Cartika Sabrina Khairunisa — Computer Engineering Technology, IPB University. Jakarta Metropolitan Area, Indonesia.</footer>
      </div>
    </>
  );
}
