/**
 * GlowingEdgeCard - a card with colored, glowing edges that follow the pointer.
 * Mesh-gradient border/background masked by a conic gradient aimed at the pointer,
 * plus an outer box-shadow glow. Dark-theme only (this site has no light mode),
 * with --card-bg tied to the site's navy tokens instead of a generic dark gray.
 */

import { useEffect, useRef, useState } from 'react';

const round = (value, precision = 3) => parseFloat(value.toFixed(precision));
const clamp = (value, min = 0, max = 100) => Math.min(Math.max(value, min), max);

function centerOfElement(rect) {
  return [rect.width / 2, rect.height / 2];
}

function getPointerPosition(rect, e) {
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const px = clamp((100 / rect.width) * x);
  const py = clamp((100 / rect.height) * y);
  return { pixels: [x, y], percent: [px, py] };
}

function angleFromPointer(dx, dy) {
  let angleDegrees = 0;
  if (dx !== 0 || dy !== 0) {
    const angleRadians = Math.atan2(dy, dx);
    angleDegrees = angleRadians * (180 / Math.PI) + 90;
    if (angleDegrees < 0) angleDegrees += 360;
  }
  return angleDegrees;
}

function closenessToEdge(rect, x, y) {
  const [cx, cy] = centerOfElement(rect);
  const dx = x - cx;
  const dy = y - cy;
  let kX = Infinity;
  let kY = Infinity;
  if (dx !== 0) kX = cx / Math.abs(dx);
  if (dy !== 0) kY = cy / Math.abs(dy);
  return clamp(1 / Math.min(kX, kY), 0, 1);
}

export default function GlowingEdgeCard({ className = '', children, ...rest }) {
  const cardRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handlePointerMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const { pixels, percent } = getPointerPosition(rect, e);
    const [px, py] = pixels;
    const [perx, pery] = percent;
    const [cx, cy] = centerOfElement(rect);
    const dx = px - cx;
    const dy = py - cy;
    const edge = closenessToEdge(rect, px, py);
    const angle = angleFromPointer(dx, dy);

    cardRef.current.style.setProperty('--pointer-x', `${round(perx)}%`);
    cardRef.current.style.setProperty('--pointer-y', `${round(pery)}%`);
    cardRef.current.style.setProperty('--pointer-deg', `${round(angle)}deg`);
    cardRef.current.style.setProperty('--pointer-d', `${round(edge * 100)}`);

    if (isAnimating) {
      setIsAnimating(false);
      cardRef.current.classList.remove('animating');
    }
  };

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!cardRef.current) return;

    const playAnimation = () => {
      const card = cardRef.current;
      if (!card) return;
      setIsAnimating(true);
      card.classList.add('animating');
      const angleStart = 110;
      const angleEnd = 465;
      card.style.setProperty('--pointer-deg', `${angleStart}deg`);
      const startTime = performance.now();

      const animate = (now) => {
        if (!card || !card.classList.contains('animating')) return;
        const elapsed = now - startTime;

        if (elapsed > 500 && elapsed < 1000) {
          const t = (elapsed - 500) / 500;
          const ease = 1 - Math.pow(1 - t, 3);
          card.style.setProperty('--pointer-d', `${ease * 100}`);
        }
        if (elapsed > 500 && elapsed < 2000) {
          const t = (elapsed - 500) / 1500;
          const ease = t * t * t;
          const d = (angleEnd - angleStart) * (ease * 0.5) + angleStart;
          card.style.setProperty('--pointer-deg', `${d}deg`);
        }
        if (elapsed >= 2000 && elapsed < 4250) {
          const t = (elapsed - 2000) / 2250;
          const ease = 1 - Math.pow(1 - t, 3);
          const d = (angleEnd - angleStart) * (0.5 + ease * 0.5) + angleStart;
          card.style.setProperty('--pointer-deg', `${d}deg`);
        }
        if (elapsed > 3000 && elapsed < 4500) {
          const t = (elapsed - 3000) / 1500;
          const ease = t * t * t;
          card.style.setProperty('--pointer-d', `${(1 - ease) * 100}`);
        }
        if (elapsed < 4500) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          card.classList.remove('animating');
        }
      };
      requestAnimationFrame(animate);
    };

    const timer = setTimeout(playAnimation, 500);
    return () => clearTimeout(timer);
  }, []);

  const cssVars = {
    '--glow-sens': '30',
    '--pointer-x': '50%',
    '--pointer-y': '50%',
    '--pointer-deg': '45deg',
    '--pointer-d': '0',
    '--color-sens': 'calc(var(--glow-sens) + 20)',
    '--card-bg': 'linear-gradient(8deg, var(--color-navy) 75%, var(--color-navy-3) 75.5%)',
    '--blend': 'soft-light',
    '--glow-blend': 'plus-lighter',
    '--glow-color': '40deg 80% 80%',
    '--glow-boost': '0%',
  };

  return (
    <div
      ref={cardRef}
      className={`gec ${isAnimating ? 'animating' : ''} ${className}`}
      onPointerMove={handlePointerMove}
      style={cssVars}
      {...rest}
    >
      <div className="gec-mesh-border" />
      <div className="gec-mesh-bg" />
      <div className="gec-glow" />
      <div className="gec-content">{children}</div>
    </div>
  );
}
