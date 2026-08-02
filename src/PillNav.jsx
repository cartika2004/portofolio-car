/**
 * PillNav - GSAP-powered pill navigation.
 * All links in this app are in-page hash anchors, so this port always
 * renders plain <a> tags (no react-router-dom dependency).
 */

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="6" y1="18" x2="18" y2="6" />
    </svg>
  );
}

export const PillNav = ({
  logo,
  logoAlt = 'Logo',
  logoHref,
  items,
  activeHref,
  className = '',
  ease = 'power3.out',
  baseColor = 'var(--color-ink)',
  pillColor = 'var(--color-navy-2)',
  hoveredPillTextColor = 'var(--color-navy)',
  pillTextColor,
  onMobileMenuClick,
  initialLoadAnimation = true,
}) => {
  const resolvedPillTextColor = pillTextColor ?? 'var(--color-ink)';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const activeTweenRefs = useRef([]);
  const logoImgRef = useRef(null);
  const logoTweenRef = useRef(null);
  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navItemsRef = useRef(null);
  const logoRef = useRef(null);

  const renderLogo = () => {
    if (typeof logo === 'string') {
      return <img src={logo} alt={logoAlt} ref={logoImgRef} className="pn-logo-img" />;
    }
    return (
      <div ref={logoImgRef} className="pn-logo-node">
        {logo}
      </div>
    );
  };

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;

        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${originY}px` });

        const label = pill.querySelector('.pn-label');
        const white = pill.querySelector('.pn-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 0.8, ease, overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 0.6, ease, overwrite: 'auto' }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 20), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 0.6, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (document.fonts) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    if (initialLoadAnimation) {
      const logoEl = logoRef.current;
      const navItems = navItemsRef.current;

      if (logoEl) {
        gsap.set(logoEl, { scale: 0, opacity: 0 });
        gsap.to(logoEl, { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.7)' });
      }

      if (navItems) {
        const listItems = navItems.querySelectorAll('li');
        gsap.set(listItems, { opacity: 0, x: -20 });
        gsap.to(listItems, { opacity: 1, x: 0, duration: 0.6, stagger: 0.05, ease: 'power2.out', delay: 0.2 });
      }
    }

    return () => window.removeEventListener('resize', onResize);
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = (i) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), { duration: 0.4, ease, overwrite: 'auto' });
  };

  const handleLeave = (i) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, { duration: 0.3, ease, overwrite: 'auto' });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    logoTweenRef.current = gsap.to(img, {
      rotate: 360,
      duration: 0.8,
      ease: 'elastic.out(1, 0.5)',
      overwrite: 'auto',
      onComplete: () => gsap.set(img, { rotate: 0 }),
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const menu = mobileMenuRef.current;
    if (menu) {
      if (newState) {
        gsap.set(menu, { display: 'block', opacity: 0, y: -20 });
        gsap.to(menu, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: -20,
          duration: 0.3,
          ease: 'power3.in',
          onComplete: () => gsap.set(menu, { display: 'none' }),
        });
      }
    }
    onMobileMenuClick?.();
  };

  const cssVars = {
    '--pn-base': baseColor,
    '--pn-pill-bg': pillColor,
    '--pn-hover-text': hoveredPillTextColor,
    '--pn-pill-text': resolvedPillTextColor,
    '--pn-h': '44px',
    '--pn-pad-x': '18px',
    '--pn-gap': '6px',
  };

  return (
    <div className={`pn-root ${className}`} style={cssVars}>
      <nav className="pn-nav" aria-label="Primary">
        <div ref={logoRef} onMouseEnter={handleLogoEnter} className="pn-logo-wrap">
          <a href={logoHref ?? items[0]?.href ?? '#'} className="pn-logo" aria-label="Home">
            {renderLogo()}
          </a>
        </div>

        <div ref={navItemsRef} className="pn-menu">
          <ul role="menubar" className="pn-list">
            {items.map((item, i) => {
              const isActive = activeHref === item.href;
              return (
                <li key={item.href} role="none" className="pn-item">
                  <a
                    role="menuitem"
                    href={item.href}
                    className="pn-pill"
                    aria-label={item.ariaLabel || item.label}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                  >
                    <span className="pn-circle" aria-hidden="true" ref={(el) => { circleRefs.current[i] = el; }} />
                    <span className="pn-label-stack">
                      <span className="pn-label">{item.label}</span>
                      <span className="pn-label-hover" aria-hidden="true">{item.label}</span>
                    </span>
                    {isActive && <span className="pn-active-dot" aria-hidden="true" />}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <button
          ref={hamburgerRef}
          type="button"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
          className="pn-hamburger"
        >
          {isMobileMenuOpen ? <XIcon /> : <MenuIcon />}
        </button>
      </nav>

      <div ref={mobileMenuRef} className="pn-mobile-menu">
        <ul className="pn-mobile-list">
          {items.map((item) => {
            const isActive = activeHref === item.href;
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`pn-mobile-link ${isActive ? 'is-active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default PillNav;
