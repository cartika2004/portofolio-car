/**
 * Minesweeper - classic 9x9/10-mine board.
 * Mines are placed after the first click (never under the clicked cell or its
 * neighbors) so the opening move is never an instant loss.
 */

import { useEffect, useRef, useState } from 'react';

const ROWS = 9;
const COLS = 9;
const MINES = 10;
const NEIGHBOR_OFFSETS = [-1, 0, 1].flatMap((dr) => [-1, 0, 1].map((dc) => [dr, dc])).filter(([dr, dc]) => dr || dc);

const NUMBER_COLORS = ['', '#4f83ff', '#2f9e44', '#e8590c', '#d6336c', '#7048e8', '#0c8599', '#495057', '#212529'];

const inBounds = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < COLS;

function emptyGrid() {
  return Array.from({ length: ROWS }, () => (
    Array.from({ length: COLS }, () => ({ mine: false, adjacent: 0, revealed: false, flagged: false }))
  ));
}

function cloneGrid(grid) {
  return grid.map((row) => row.map((cell) => ({ ...cell })));
}

function placeMines(grid, safeR, safeC) {
  const forbidden = new Set([...NEIGHBOR_OFFSETS, [0, 0]].map(([dr, dc]) => `${safeR + dr},${safeC + dc}`));
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (grid[r][c].mine || forbidden.has(`${r},${c}`)) continue;
    grid[r][c].mine = true;
    placed += 1;
  }
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      if (grid[r][c].mine) continue;
      grid[r][c].adjacent = NEIGHBOR_OFFSETS.reduce((count, [dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        return count + (inBounds(nr, nc) && grid[nr][nc].mine ? 1 : 0);
      }, 0);
    }
  }
  return grid;
}

// Recursive flood fill: reveals (r, c), and if it has no adjacent mines,
// recurses into every neighbor so whole empty pockets open in one click.
function floodFill(grid, r, c, seen) {
  if (!inBounds(r, c) || seen.has(`${r},${c}`)) return;
  const cell = grid[r][c];
  if (cell.revealed || cell.flagged) return;
  seen.add(`${r},${c}`);
  cell.revealed = true;
  if (cell.adjacent === 0 && !cell.mine) {
    NEIGHBOR_OFFSETS.forEach(([dr, dc]) => floodFill(grid, r + dr, c + dc, seen));
  }
}

function countRevealed(grid) {
  return grid.reduce((n, row) => n + row.filter((cell) => cell.revealed).length, 0);
}

export default function Minesweeper() {
  const [grid, setGrid] = useState(emptyGrid);
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState('playing'); // playing | won | lost
  const [seconds, setSeconds] = useState(0);
  const longPressRef = useRef(null);
  const longPressFiredRef = useRef(false);

  useEffect(() => {
    if (!started || status !== 'playing') return undefined;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [started, status]);

  const reset = () => {
    setGrid(emptyGrid());
    setStarted(false);
    setStatus('playing');
    setSeconds(0);
  };

  const flaggedCount = grid.flat().filter((cell) => cell.flagged).length;
  const minesLeft = MINES - flaggedCount;

  const toggleFlag = (r, c) => {
    if (status !== 'playing' || grid[r][c].revealed) return;
    const next = cloneGrid(grid);
    next[r][c].flagged = !next[r][c].flagged;
    setGrid(next);
  };

  const reveal = (r, c) => {
    if (status !== 'playing' || grid[r][c].flagged || grid[r][c].revealed) return;
    let next = cloneGrid(grid);
    if (!started) {
      next = placeMines(next, r, c);
      setStarted(true);
    }
    if (next[r][c].mine) {
      next.forEach((row) => row.forEach((cell) => { if (cell.mine) cell.revealed = true; }));
      setGrid(next);
      setStatus('lost');
      return;
    }
    floodFill(next, r, c, new Set());
    setGrid(next);
    if (countRevealed(next) === ROWS * COLS - MINES) setStatus('won');
  };

  const onContextMenu = (e, r, c) => { e.preventDefault(); toggleFlag(r, c); };
  const onTouchStart = (r, c) => {
    longPressFiredRef.current = false;
    longPressRef.current = setTimeout(() => { longPressFiredRef.current = true; toggleFlag(r, c); }, 420);
  };
  const onTouchEnd = (r, c) => {
    clearTimeout(longPressRef.current);
    if (!longPressFiredRef.current) reveal(r, c);
  };

  return (
    <div className="game-box minesweeper-box" onContextMenu={(e) => e.preventDefault()}>
      <div className="game2048-head">
        <span className="game-kicker">Minesweeper — click to reveal, right-click / hold to flag</span>
        <span className="game-best">💣 {minesLeft} · ⏱ {seconds}s</span>
      </div>
      <div className="minesweeper-grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
        {grid.map((row, r) => row.map((cell, c) => (
          <button
            type="button"
            key={`${r}-${c}`}
            className={`minesweeper-cell${cell.revealed ? ' is-revealed' : ''}${cell.flagged ? ' is-flagged' : ''}${cell.revealed && cell.mine ? ' is-mine' : ''}`}
            style={cell.revealed && cell.adjacent ? { color: NUMBER_COLORS[cell.adjacent] } : undefined}
            onClick={() => reveal(r, c)}
            onContextMenu={(e) => onContextMenu(e, r, c)}
            onTouchStart={() => onTouchStart(r, c)}
            onTouchEnd={() => onTouchEnd(r, c)}
            disabled={status !== 'playing' && !cell.revealed}
            aria-label={`Cell row ${r + 1}, column ${c + 1}`}
          >
            {cell.revealed ? (cell.mine ? '💣' : (cell.adjacent || '')) : (cell.flagged ? '🚩' : '')}
          </button>
        )))}
      </div>
      {status !== 'playing' && (
        <div className="game2048-overlay">
          <p className="game-label">{status === 'won' ? 'Cleared! 🎉' : 'Boom 💥'}</p>
          <button type="button" className="btn btn-primary" onClick={(e) => { e.stopPropagation(); reset(); }}>Play again</button>
        </div>
      )}
    </div>
  );
}
