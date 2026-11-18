import { useEffect, useMemo, useRef, useState } from 'react';
import type { Language } from '../content';
import './hero-headline.css';

export default function HeroHeadline({ label, first, second, lang }: { label: string; first: string; second: string; lang: Language }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [visible, setVisible] = useState(0);
  const lines = useMemo(() => {
    // Keep Arabic diacritics attached to their letters, and render one text node
    // per line so the browser can preserve natural Arabic letter joining.
    const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter(lang, { granularity: 'grapheme' }) : null;
    const split = (text: string) => segmenter
      ? Array.from(segmenter.segment(text), part => part.segment)
      : Array.from(text.matchAll(/\P{M}\p{M}*|\p{M}+/gu), match => match[0]);
    return [split(first), split(second)];
  }, [first, second, lang]);
  const total = lines[0].length + lines[1].length;
  const complete = visible >= total;

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer: number | undefined;
    let cancelled = false;
    let started = false;
    let observer: IntersectionObserver | undefined;
    let count = 0;
    setVisible(0);

    const showImmediately = () => {
      cancelled = true;
      window.clearTimeout(timer);
      observer?.disconnect();
      setVisible(total);
    };
    const tick = () => {
      if (cancelled) return;
      count += 1;
      setVisible(count);
      if (count < total) timer = window.setTimeout(tick, count === lines[0].length ? 320 : 80);
    };
    const begin = () => {
      if (started || cancelled) return;
      started = true;
      observer?.disconnect();
      void document.fonts.ready.then(() => {
        if (!cancelled) timer = window.setTimeout(tick, 350);
      });
    };
    const onMotionChange = () => { if (motion.matches) showImmediately(); };
    motion.addEventListener('change', onMotionChange);
    if (motion.matches) showImmediately();
    else if ('IntersectionObserver' in window && heading.current) {
      observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) begin();
      }, { threshold: 0.25 });
      observer.observe(heading.current);
    } else begin();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      observer?.disconnect();
      motion.removeEventListener('change', onMotionChange);
    };
  }, [lines, total]);

  return <h1 ref={heading} className={`hero-headline${complete ? ' is-typed' : ''}`} aria-label={`${label}. ${first} ${second}`}>
    <span className="hero-headline-label" aria-hidden="true">{label}</span>
    {lines.map((characters, index) => {
      const count = index === 0 ? Math.min(visible, characters.length) : Math.max(0, visible - lines[0].length);
      const active = index === (visible <= lines[0].length ? 0 : 1);
      return <span className="hero-type-line" aria-hidden="true" key={index}>
        <span className="hero-type-track">
          <span className="hero-type-reserve">{characters.join('')}</span>
          <span className="hero-type-visible">
            <span className={index === 1 ? 'gradient-text' : undefined}>{characters.slice(0, count).join('')}</span>
            {active && <span className="hero-type-caret" />}
          </span>
        </span>
      </span>;
    })}
  </h1>;
}
