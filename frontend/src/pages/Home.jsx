// Home.jsx — full replacement

import { useEffect, useRef, useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SERVICES, PROJECTS, STACK_CARDS, HERO_GALLERY, BLOGS } from "../data";

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────────────────
   HERO IMAGE GALLERY — crossfading background slideshow
   Reads from HERO_GALLERY in data/index.js
───────────────────────────────────────────────────────────────────────── */
function HeroGallery({ images }) {
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  const timerRef = useRef(null);

  const INTERVAL = 5000;
  const FADE_DUR = 1200;

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!images || images.length < 2) return;

    timerRef.current = setInterval(() => {
      setTransitioning(true);
      setNext((current + 1) % images.length);
    }, INTERVAL);

    return () => clearInterval(timerRef.current);
  }, [current, images]);

  useEffect(() => {
    if (!transitioning || next === null) return;

    const t = setTimeout(() => {
      setCurrent(next);
      setNext(null);
      setTransitioning(false);
    }, FADE_DUR);

    return () => clearTimeout(t);
  }, [transitioning, next]);

  if (!images?.length) return null;

  const getImage = (item) =>
    isDesktop ? item.desktop : item.mobile;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Current image */}
      <div
        key={`cur-${current}`}
        className="absolute inset-0"
        style={{
          animation: `heroPan ${INTERVAL + FADE_DUR}ms linear forwards`,
        }}
      >
        <img
          src={getImage(images[current])}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ willChange: "transform" }}
        />
      </div>

      {/* Next image */}
      {transitioning && next !== null && (
        <div
          key={`next-${next}`}
          className="absolute inset-0"
          style={{
            opacity: 0,
            animation: `heroFadeIn ${FADE_DUR}ms ease-out forwards`,
          }}
        >
          <img
            src={getImage(images[next])}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      )}

      <style>{`
        @keyframes heroPan {
          from { transform: scale(1); }
          to   { transform: scale(1.07); }
        }

        @keyframes heroFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
/* ─────────────────────────────────────────────────────────────────────────
   SERVICE IMAGE GALLERY — crossfading slideshow for the services stack
   Same mechanic as HeroGallery (slow pan + crossfade), sized to fill
   whatever container it's dropped into. Falls back to a flat gradient
   if a service has no images yet.
───────────────────────────────────────────────────────────────────────── */
function ServiceGallery({ images, interval = 4200, fadeDuration = 1100 }) {
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!images || images.length < 2) return;

    timerRef.current = setInterval(() => {
      setTransitioning(true);
      setNext((prev) => (current + 1) % images.length);
    }, interval);

    return () => clearInterval(timerRef.current);
  }, [current, images, interval]);

  useEffect(() => {
    if (!transitioning || next === null) return;
    const t = setTimeout(() => {
      setCurrent(next);
      setNext(null);
      setTransitioning(false);
    }, fadeDuration);
    return () => clearTimeout(t);
  }, [transitioning, next, fadeDuration]);

  if (!images || images.length === 0) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-green-800 to-emerald-600" />
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        key={`svc-cur-${current}`}
        className="absolute inset-0"
        style={{
          animation: `servicePan ${interval + fadeDuration}ms linear forwards`,
        }}
      >
        <img
          src={images[current]}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ willChange: "transform" }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
      </div>

      {transitioning && next !== null && (
        <div
          key={`svc-next-${next}`}
          className="absolute inset-0"
          style={{
            opacity: 0,
            animation: `serviceFadeIn ${fadeDuration}ms ease-out forwards`,
          }}
        >
          <img
            src={images[next]}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </div>
      )}

      <style>{`
        @keyframes servicePan {
          from { transform: scale(1.0); }
          to   { transform: scale(1.07); }
        }
        @keyframes serviceFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Topographic SVG background — used in CTA section
───────────────────────────────────────────────────────────────────────── */
function TopoMap() {
  return (
    <svg viewBox="0 0 1200 800" className="w-full h-full"
      preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="1200" height="800" fill="#0f2a1a" />
      {[
        "M0,400 C150,340 300,460 450,390 S700,310 850,380 S1050,450 1200,380",
        "M0,440 C120,370 280,490 420,420 S680,340 830,410 S1030,480 1200,410",
        "M0,360 C180,300 340,430 500,360 S740,280 900,350 S1080,420 1200,350",
        "M0,480 C100,400 260,520 400,450 S660,370 820,440 S1020,510 1200,440",
        "M0,320 C200,260 380,400 540,330 S780,250 940,320 S1100,390 1200,320",
        "M0,520 C80,430 240,550 380,480 S640,400 800,470 S1000,540 1200,470",
        "M0,280 C220,220 420,360 580,290 S820,210 980,280 S1140,350 1200,280",
        "M0,560 C60,460 220,580 360,510 S620,430 780,500 S980,570 1200,500",
        "M0,240 C240,180 460,320 620,250 S860,170 1020,240 S1160,310 1200,240",
        "M0,600 C40,490 200,610 340,540 S600,460 760,530 S960,600 1200,530",
        "M0,200 C260,140 500,280 660,210 S900,130 1060,200 S1180,270 1200,200",
        "M0,640 C20,520 180,640 320,570 S580,490 740,560 S940,630 1200,560",
        "M0,160 C280,100 540,240 700,170 S940,90 1100,160 S1190,230 1200,160",
        "M0,680 C160,660 300,600 460,660 S700,600 860,660 S1060,700 1200,660",
        "M0,720 C200,700 340,640 500,700 S740,640 900,700 S1100,740 1200,720",
      ].map((d, i) => (
        <path key={i} d={d} fill="none"
          stroke="rgba(134,239,172,0.18)"
          strokeWidth={i % 3 === 0 ? "1.5" : "0.8"} />
      ))}
      {Array.from({ length: 13 }).map((_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 66} x2="1200" y2={i * 66}
          stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      ))}
      {Array.from({ length: 13 }).map((_, i) => (
        <line key={`v${i}`} x1={i * 100} y1="0" x2={i * 100} y2="800"
          stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      ))}
      <text x="20" y="30" fill="rgba(134,239,172,0.4)" fontSize="9"
        fontFamily="monospace" letterSpacing="3">KERALA — INDIA / 8–13°N 74–78°E</text>
      <text x="20" y="780" fill="rgba(134,239,172,0.3)" fontSize="9"
        fontFamily="monospace" letterSpacing="2">HARITHA AGRO CONSULTANTS</text>
      <text x="1100" y="780" fill="rgba(134,239,172,0.3)" fontSize="9"
        fontFamily="monospace" letterSpacing="2">©2024</text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   TICKER STRIP — continuous marquee, click jumps to a blog post
   Duplicates items so the loop is seamless.
───────────────────────────────────────────────────────────────────────── */
function TickerStrip({ blogs, onSelect, activeIndex, trackRef }) {
  // Duplicate list 4× so the strip is seamless even on ultra-wide screens
  const items = [...blogs, ...blogs, ...blogs, ...blogs];

  return (
    <div
      className="relative overflow-hidden bg-[#8ABC37] border-b border-[#7aad2f] py-3 select-none"
    >
      {/* Edge fades */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#8ABC37] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#8ABC37] to-transparent z-10 pointer-events-none" />

      <div ref={trackRef} className="flex items-center gap-0 will-change-transform whitespace-nowrap">
        {items.map((blog, i) => (
          <button
            key={i}
            onClick={() => onSelect(i % blogs.length)}
            className={[
              "inline-flex flex-shrink-0 items-center gap-4 px-8",
              "text-[10px] uppercase tracking-[0.3em] font-mono",
              "transition-colors duration-200 cursor-pointer",
              (i % blogs.length) === activeIndex
                ? "text-green-950 font-bold"
                : "text-green-900/60 hover:text-green-950",
            ].join(" ")}
          >
            <span className="w-1 h-1 rounded-full bg-green-950/30 shrink-0" />
            {blog.title}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CARD STACK COMPONENT (simplified)
   Image + name, autoplaying every N seconds via a lightweight crossfade.
   Only the current + incoming image/text are ever in the DOM.
═══════════════════════════════════════════════════════════════════════════ */
function CardStack({ cards, interval = 4500, fadeDuration = 700 }) {
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef(null);
  const total = cards.length;

  const goTo = useCallback((idx) => {
    if (transitioning || idx === current) return;
    setTransitioning(true);
    setNext(idx);
  }, [transitioning, current]);

  const advance = (direction) => goTo((current + direction + total) % total);

  /* autoplay — resets cleanly whenever `current` changes, whether that
     change came from the timer or a manual arrow click */
  useEffect(() => {
    if (total < 2) return;
    timerRef.current = setInterval(() => {
      setTransitioning(true);
      setNext((current + 1) % total);
    }, interval);
    return () => clearInterval(timerRef.current);
  }, [current, total, interval]);

  /* finish the crossfade */
  useEffect(() => {
    if (!transitioning || next === null) return;
    const t = setTimeout(() => {
      setCurrent(next);
      setNext(null);
      setTransitioning(false);
    }, fadeDuration);
    return () => clearTimeout(t);
  }, [transitioning, next, fadeDuration]);

  if (!cards || cards.length === 0) return null;

  return (
    <div className="relative flex flex-col items-center gap-6">
      <div className="self-end text-stone-400 text-[10px] tracking-[0.4em] uppercase font-mono">
        {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>

      <div className="flex items-center gap-5 w-full justify-center">
        <button
          onClick={() => advance(-1)}
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110 cursor-pointer"
          style={{
            background: "rgba(255,255,255,0.6)",
            border: "1px solid rgba(0,0,0,0.1)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          }}
          aria-label="Previous card"
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <path d="M11 14L6 9L11 4" stroke="rgba(30,40,30,0.8)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div
          className="relative rounded-2xl overflow-hidden will-change-transform"
          style={{
            width: "min(300px, 75vw)",
            height: "min(420px, 65vh)",
            boxShadow: "0 20px 56px rgba(0,0,0,0.16), 0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-800 to-emerald-600">
            <img
              key={`cur-${current}`}
              src={cards[current].src}
              alt={cards[current].name}
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => { e.target.style.display = "none"; }}
            />
            {transitioning && next !== null && (
              <img
                key={`next-${next}`}
                src={cards[next].src}
                alt={cards[next].name}
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: 0, animation: `cardFadeIn ${fadeDuration}ms ease-out forwards` }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            )}
          </div>

          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 45%, rgba(0,0,0,0.2) 100%)" }}
          />

          {/* ── Name / role overlay, crossfades alongside the image ── */}
          <div className="absolute top-0 left-0 right-0 p-6 pointer-events-none">
            <div
              key={`txt-cur-${current}`}
              style={transitioning ? { animation: `cardFadeOut ${fadeDuration}ms ease-out forwards` } : undefined}
            >
              {/* <p className="text-white/60 text-[9px] tracking-[0.35em] uppercase font-mono mb-2">
                Featured project
              </p> */}
              <h3 className="text-white text-lg font-black leading-tight tracking-tight mb-1">
                {cards[current].name}
              </h3>
              {/* {cards[current].role && (
                <p className="text-white/70 text-sm font-light">{cards[current].role}</p>
              )} */}
            </div>

            {transitioning && next !== null && (
              <div
                key={`txt-next-${next}`}
                className="absolute top-6 left-6 right-6"
                style={{ opacity: 0, animation: `cardFadeIn ${fadeDuration}ms ease-out forwards` }}
              >
                {/* <p className="text-white/60 text-[9px] tracking-[0.35em] uppercase font-mono mb-2">
                  Featured project
                </p> */}
                <h3 className="text-white text-lg font-black leading-tight tracking-tight mb-1">
                  {cards[next].name}
                </h3>
                {/* {cards[next].role && (
                  <p className="text-white/70 text-sm font-light">{cards[next].role}</p>
                )} */}
              </div>
            )}
          </div>

          <style>{`
            @keyframes cardFadeIn  { from { opacity: 0; } to { opacity: 1; } }
            @keyframes cardFadeOut { from { opacity: 1; } to { opacity: 0; } }
          `}</style>
        </div>

        <button
          onClick={() => advance(1)}
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110 cursor-pointer"
          style={{
            background: "rgba(255,255,255,0.6)",
            border: "1px solid rgba(0,0,0,0.1)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          }}
          aria-label="Next card"
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <path d="M7 4L12 9L7 14" stroke="rgba(30,40,30,0.8)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SERVICES CAROUSEL COMPONENT (legacy — kept but no longer rendered below;
   replaced on the page by ServicesStack, see further down)
═══════════════════════════════════════════════════════════════════════════ */
function ServicesStrip({ services }) {
  const wrapperRef = useRef(null);
  const trackRef = useRef(null);
  const currentX = useRef(0);
  const dragStartX = useRef(0);
  const startX = useRef(0);
  const isDragging = useRef(false);
  const rafId = useRef(null);
  const cardW = useRef(0);
  const initialized = useRef(false);
  const GAP = 0; // borderless grid — cards share borders

  // Triple for infinite loop
  const tripled = [...services, ...services, ...services];
  const totalCards = services.length;

  // ── Clamp x into the safe middle-set window, jump silently if needed
  const clampX = useCallback((x) => {
    const stride = cardW.current * totalCards;
    if (x > -(stride * 0.5)) return x - stride;
    if (x < -(stride * 1.5)) return x + stride;
    return x;
  }, [totalCards]);

  // ── Snap to nearest card edge
  const snapToNearest = useCallback(() => {
    if (!trackRef.current || cardW.current === 0) return;
    const cw = cardW.current;
    const snapped = Math.round(currentX.current / cw) * cw;
    const finalX = clampX(snapped);
    currentX.current = finalX;
    gsap.to(trackRef.current, {
      x: finalX, duration: 0.6, ease: "expo.out",
    });
  }, [clampX]);

  const advance = useCallback((dir) => {
    if (!trackRef.current || cardW.current === 0) return;
    const newX = clampX(currentX.current + dir * -cardW.current);
    currentX.current = newX;
    gsap.killTweensOf(trackRef.current);
    gsap.to(trackRef.current, {
      x: newX, duration: 0.55, ease: "power2.out",
      onComplete: snapToNearest,
    });
  }, [clampX, snapToNearest]);

  const init = useCallback(() => {
    if (initialized.current) return;
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;

    const firstCard = track.querySelector(".svc-bento-card");
    if (!firstCard || firstCard.offsetWidth === 0) return;

    cardW.current = firstCard.offsetWidth;
    initialized.current = true;

    const initX = -(cardW.current * totalCards);
    currentX.current = initX;
    gsap.set(track, { x: initX });
  }, [totalCards]);

  useEffect(() => {
    requestAnimationFrame(() => {
      init();
      requestAnimationFrame(init);
    });

    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;

    const onDown = (e) => {
      isDragging.current = true;
      dragStartX.current = e.clientX;
      startX.current = currentX.current;
      gsap.killTweensOf(track);
      wrapper.style.cursor = "grabbing";
    };
    const onMove = (e) => {
      if (!isDragging.current) return;
      const nx = startX.current + (e.clientX - dragStartX.current);
      currentX.current = nx;
      gsap.set(track, { x: nx });
    };
    const onUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      wrapper.style.cursor = "grab";
      snapToNearest();
    };
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY) * 0.5) return;
      e.preventDefault();
      currentX.current -= e.deltaX;
      gsap.set(track, { x: currentX.current });
      clearTimeout(onWheel._t);
      onWheel._t = setTimeout(snapToNearest, 150);
    };

    wrapper.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    wrapper.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      wrapper.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      wrapper.removeEventListener("wheel", onWheel);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [init, snapToNearest]);

  return (
    <section className="services-section bg-white py-28 md:py-38">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">

        {/* Header row */}
        <div className="flex items-start justify-between gap-8 mb-12 border-t border-stone-300 pt-8">
          <span className="section-eyebrow text-stone-400 text-[10px] tracking-[0.4em] uppercase font-mono self-center">
            03 / What we do
          </span>
          <h2 className="section-heading text-[clamp(2rem,4vw,3.5rem)] font-black text-stone-900 uppercase tracking-tight leading-none text-right max-w-[12ch]">
            Seven<br />disciplines.
          </h2>
        </div>

      </div>

      {/* Arrow + strip row */}
      <div className="flex items-stretch">

        <button
          onClick={() => advance(-1)}
          className="shrink-0 w-12 border-t border-b border-r border-stone-300 flex items-center justify-center hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-200"
          aria-label="Previous service"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div
          ref={wrapperRef}
          className="flex-1 overflow-hidden border-l border-t border-b border-stone-300"
          style={{ cursor: "grab" }}
        >
          <div
            ref={trackRef}
            className="flex will-change-transform h-full"
            style={{ width: "max-content" }}
          >
            {tripled.map((s, i) => {
              const origIdx = i % services.length;
              return (
                <article
                  key={`${origIdx}-${i}`}
                  className="svc-bento-card shrink-0 border-r border-stone-300 p-8 group hover:bg-stone-50 transition-colors duration-300"
                  style={{
                    width: "25%",
                    minWidth: "220px",
                    maxWidth: "360px",
                    boxSizing: "border-box",
                  }}
                >
                  <p className="text-[clamp(3rem,5vw,5rem)] font-black text-stone-100 leading-none mb-6 group-hover:text-green-100 transition-colors duration-300 tabular-nums">
                    {String(origIdx + 1).padStart(2, "0")}
                  </p>
                  <h3 className="text-base font-bold text-stone-900 uppercase tracking-[0.08em] mb-3 leading-tight">
                    {s.title}
                  </h3>
                  <div className="w-8 h-px bg-green-600 mb-4" />
                  <p className="text-sm text-stone-500 leading-relaxed">
                    {s.desc}
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-green-700 text-xs uppercase tracking-[0.2em] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Learn more</span>
                    <span>→</span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => advance(1)}
          className="shrink-0 w-12 border-t border-b border-l border-stone-300 flex items-center justify-center hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-200"
          aria-label="Next service"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex justify-end mt-10">
          <Link
            to="/services"
            className="inline-flex items-center gap-3 text-stone-900 font-semibold text-sm uppercase tracking-[0.15em] border-b border-stone-900 pb-1 hover:text-green-700 hover:border-green-700 transition-colors duration-300"
          >
            All services
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SERVICES STACK COMPONENT
   Same stacking/pin mechanic as the Projects section: left panel carries
   number + name + description only, right panel is a crossfading image
   gallery (ServiceGallery) cycling through that service's photos.
   Expects each entry in SERVICES to optionally provide an `images: []`
   array; falls back to a single `img` field, then to a flat gradient.
═══════════════════════════════════════════════════════════════════════════ */
function ServicesStack({ services }) {
  return (
    <section className="bg-stone-900">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-8 border-b border-white/10">
        <div className="flex items-center justify-between">
          <span className="services-label text-stone-400 text-[10px] tracking-[0.4em] uppercase font-mono">
            03 / What we do
          </span>
          {/* <Link to="/services"
            className="text-stone-400 text-[10px] tracking-[0.4em] uppercase font-mono hover:text-[#8ABC37] transition-colors">
            View all →
          </Link> */}
        </div>
      </div>
      <div className="services-pin-wrap relative h-screen min-h-[620px] overflow-hidden">
        {services.map((s, i) => {
          const images = s.images || (s.img ? [s.img] : []);
          return (
            <div key={s.title}
              className="service-stack-card absolute inset-0 will-change-transform [will-change:transform,opacity] backface-hidden"
              data-service-index={i}
              style={{ zIndex: i + 1 }}>

              {/* ── MOBILE ── */}
              <div className="lg:hidden relative h-full w-full overflow-hidden bg-stone-900">
                <ServiceGallery images={images} />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/70 to-stone-900/30" />
                <div className="absolute inset-0 flex flex-col justify-between p-6">
                  <p className="text-[clamp(4rem,18vw,8rem)] font-black text-white/10 leading-none tabular-nums select-none">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <div>
                    <h3 className="text-[clamp(1.6rem,6vw,2.5rem)] font-black text-white uppercase tracking-tight leading-none mb-3">
                      {s.title}
                    </h3>
                    {s.desc && (
                      <p className="text-stone-300 text-sm leading-relaxed mb-6 max-w-sm">{s.desc}</p>
                    )}
                    <div className="flex items-center gap-2">
                      {services.map((_, dotIdx) => (
                        <div key={dotIdx}
                          className={`h-px transition-all duration-300 ${dotIdx === i ? "w-8 bg-[#8ABC37]" : "w-4 bg-white/20"}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── DESKTOP ── */}
              <div className="hidden lg:flex h-full flex-row bg-stone-900">
                <div className="w-[42%] flex flex-col justify-between p-8 md:p-12 lg:p-16 border-r border-white/8">
                  <div>
                    <p className="text-[clamp(4rem,10vw,10rem)] font-black text-white/8 leading-none tabular-nums select-none">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                  </div>
                  <div className="pb-4">
                    <h3 className="text-[clamp(1.5rem,3vw,3rem)] font-black text-white uppercase tracking-tight leading-none mb-4">
                      {s.title}
                    </h3>
                    {s.desc && (
                      <p className="text-stone-400 text-sm leading-relaxed max-w-sm">{s.desc}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {services.map((_, dotIdx) => (
                      <div key={dotIdx}
                        className={`h-px transition-all duration-300 ${dotIdx === i ? "w-8 bg-[#8ABC37]" : "w-4 bg-white/20"}`} />
                    ))}
                  </div>
                </div>
                <div className="flex-1 relative overflow-hidden">
                  <ServiceGallery images={images} />
                  <div className="absolute inset-0 bg-gradient-to-r from-stone-900/40 via-transparent to-transparent" />
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HOME COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function Home() {
  const rootRef = useRef(null);
  const tickerRef = useRef(null);
  const navigate = useNavigate();

  /* ── Scroll to top when this page loads (strict) ── */
  useEffect(() => {
    // Disable browser scroll restoration for this page
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const scrollTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    scrollTop();
    const raf = requestAnimationFrame(scrollTop);
    const timeout = setTimeout(scrollTop, 50);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, []);

  /* ── Ticker GSAP marquee — infinite left-scroll ── */
  useEffect(() => {
    const track = tickerRef.current;
    if (!track) return;
    let tween;
    const rafId = requestAnimationFrame(() => {
      const quarterW = track.scrollWidth / 4; // 4 copies of list
      tween = gsap.fromTo(
        track,
        { x: 0 },
        { x: -quarterW, duration: BLOGS.length * 7, ease: "none", repeat: -1 }
      );
    });
    return () => {
      cancelAnimationFrame(rafId);
      tween?.kill();
    };
  }, []);

  /* ── Ticker click: go to the journal page ── */
  const handleTickerSelect = () => {
    navigate("/blogs");
  };

  useEffect(() => {
    const rafId = requestAnimationFrame(() => { ScrollTrigger.refresh(); });

    const ctx = gsap.context(() => {

      /* ── HERO: wordmark entrance ── */
      gsap.fromTo(".hero-word",
        { yPercent: 120, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: 0.055, delay: 0.2, clearProps: "transform,opacity" }
      );
      gsap.from(".hero-sub", { y: 28, opacity: 0, duration: 1, ease: "expo.out", delay: 1.0, clearProps: "transform,opacity" });
      gsap.from(".hero-btns > *", { y: 20, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.1, delay: 1.15, clearProps: "transform,opacity" });

      gsap.to(".hero-headline", {
        scale: 0.88, opacity: 0, yPercent: -10, ease: "none",
        scrollTrigger: { trigger: ".hero-section", start: "top top", end: "60% top", scrub: 1 },
      });
      gsap.to(".hero-bg", {
        scale: 1.06, ease: "none",
        scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: 1 },
      });

      /* ── ABOUT stats ── */
      gsap.utils.toArray(".stat-value").forEach((el) => {
        const target = parseInt(el.dataset.value, 10);
        const suffix = el.dataset.suffix || "";
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target, duration: 2.2, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onUpdate: () => { el.textContent = String(Math.round(obj.v)).padStart(2, "0") + suffix; },
        });
      });

      /* ── PROJECTS: stacking scroll pin ── */
      const projectCards = gsap.utils.toArray(".project-stack-card");
      const totalCards = projectCards.length;
      projectCards.forEach((card, i) => { if (i === 0) return; gsap.set(card, { yPercent: 100, opacity: 0 }); });

      const projectsTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".projects-pin-wrap",
          start: "top top",
          end: () => `+=${window.innerHeight * (totalCards - 1)}`,
          scrub: 1, pin: true, anticipatePin: 1,
        },
      });
      projectCards.forEach((card, i) => {
        if (i === totalCards - 1) return;
        const next = projectCards[i + 1];
        const offset = i * (1 / (totalCards - 1));
        projectsTl.fromTo(next, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, ease: "power2.inOut" }, offset);
        projectsTl.to(card, { yPercent: -8, scale: 0.97, ease: "power2.inOut" }, offset);
      });

      gsap.from(".projects-label", {
        y: 30, opacity: 0, duration: 0.9, ease: "expo.out", clearProps: "transform,opacity",
        scrollTrigger: { trigger: ".projects-pin-wrap", start: "top 85%", once: true },
      });

      /* ── SERVICES: stacking scroll pin (same mechanic as Projects) ── */
      const serviceCards = gsap.utils.toArray(".service-stack-card");
      const totalServiceCards = serviceCards.length;
      if (totalServiceCards > 0) {
        gsap.set(serviceCards, {
          autoAlpha: 0,
          yPercent: 100,
          scale: 1,
          force3D: true,
        });
        gsap.set(serviceCards[0], {
          autoAlpha: 1,
          yPercent: 0,
          scale: 1,
        });

        if (totalServiceCards > 1) {
          const servicesTl = gsap.timeline({
            defaults: { duration: 0.78, ease: "power3.inOut" },
            scrollTrigger: {
              trigger: ".services-pin-wrap",
              start: "top top",
              end: () => `+=${Math.max(window.innerHeight * 0.9, 620) * (totalServiceCards - 1)}`,
              scrub: 0.7,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              snap: {
                snapTo: 1 / (totalServiceCards - 1),
                duration: { min: 0.18, max: 0.36 },
                delay: 0.04,
                ease: "power2.out",
              },
            },
          });

          serviceCards.forEach((card, i) => {
            if (i === totalServiceCards - 1) return;
            const next = serviceCards[i + 1];
            const step = i;

            servicesTl
              .to(card, { yPercent: -12, scale: 0.965, autoAlpha: 0.78 }, step)
              .fromTo(
                next,
                { yPercent: 100, autoAlpha: 1, scale: 1.015 },
                { yPercent: 0, autoAlpha: 1, scale: 1 },
                step
              )
              .set(card, { autoAlpha: 0 }, step + 0.78);
          });
        }
      }

      gsap.from(".services-label", {
        y: 30, opacity: 0, duration: 0.9, ease: "expo.out", clearProps: "transform,opacity",
        scrollTrigger: { trigger: ".services-pin-wrap", start: "top 85%", once: true },
      });

      /* ── CTA parallax ── */
      gsap.to(".cta-map-bg", {
        yPercent: -20, ease: "none",
        scrollTrigger: { trigger: ".cta-section", start: "top bottom", end: "bottom top", scrub: 1 },
      });
      gsap.from(".cta-overlay > *", {
        y: 50, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.12, clearProps: "transform,opacity",
        scrollTrigger: { trigger: ".cta-section", start: "top 72%", once: true },
      });

      /* ── Footer line ── */
      gsap.from(".footer-line", {
        scaleX: 0, transformOrigin: "left center", duration: 1.2, ease: "expo.out", clearProps: "transform",
        scrollTrigger: { trigger: ".site-footer", start: "top 90%", once: true },
      });

    }, rootRef);

    return () => { ctx.revert(); cancelAnimationFrame(rafId); };
  }, []);

  return (
    <div ref={rootRef} className="font-sans bg-stone-50">

      {/* ══════════════════════════════════════════════════════════════
          SECTION 1 · HERO
      ══════════════════════════════════════════════════════════════ */}
      <section className="hero-section relative min-h-screen flex flex-col justify-end overflow-hidden bg-green-950">

        {/* ── hero-bg: scroll-parallax wrapper (scaled by GSAP) ── */}
        <div className="hero-bg absolute inset-0 will-change-transform">

          {/* ── Photo slideshow — sits at the very bottom of the stack ── */}
          <HeroGallery images={HERO_GALLERY} />

          {/* ── Dark vignette over the photos, matches original design ── */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(5,30,15,0.55) 0%, rgba(5,30,15,0.35) 50%, rgba(5,30,15,0.72) 100%)",
            }}
          />

          {/* ── Topographic grid lines (original SVG, now layered on top) ── */}
          <svg className="absolute inset-0 w-full h-full opacity-20" aria-hidden="true"
            viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice">
            {Array.from({ length: 16 }).map((_, i) => (
              <line key={`g${i}`} x1="0" y1={i * 60} x2="1200" y2={i * 60}
                stroke="rgba(134,239,172,0.25)" strokeWidth="0.5" />
            ))}
            {Array.from({ length: 20 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 63} y1="0" x2={i * 63} y2="900"
                stroke="rgba(134,239,172,0.25)" strokeWidth="0.5" />
            ))}
            {["M0,500 C200,420 400,550 600,470 S900,380 1200,460",
              "M0,540 C180,450 380,580 580,500 S880,410 1200,500",
              "M0,460 C220,380 420,520 620,440 S920,350 1200,420",
              "M0,580 C160,490 360,610 560,530 S860,440 1200,540",
              "M0,420 C240,340 460,480 660,400 S960,310 1200,380",
            ].map((d, i) => (
              <path key={i} d={d} fill="none"
                stroke="rgba(134,239,172,0.35)"
                strokeWidth={i === 2 ? "1.2" : "0.7"} />
            ))}
          </svg>

          {/* ── Soft green glow blob ── */}
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-[#8ABC37]/8 blur-[120px] pointer-events-none" />
        </div>
        {/* end .hero-bg */}

        {/* ── Scroll indicator ── */}
        {/* <div className="absolute top-8 right-8 z-10 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border border-[#8ABC37]/40 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-[#8ABC37]/60" />
          </div>
          <span className="text-[#8ABC37]/50 text-[10px] tracking-[0.3em] uppercase font-mono">Scroll</span>
        </div> */}

        {/* ── Image counter — bottom-right, above the fold line ── */}
        {HERO_GALLERY && HERO_GALLERY.length > 1 && (
          <div className="absolute bottom-8 right-8 z-10 flex items-center gap-3">
            {HERO_GALLERY.map((_, idx) => (
              <div
                key={idx}
                className="h-px bg-[#8ABC37] transition-all duration-700"
                style={{
                  /* width pulses between slides via CSS; actual active state
                     is handled by HeroGallery's internal state, so we keep
                     both dashes equal here — a simple decorative indicator */
                  width: "24px",
                  opacity: 0.5,
                }}
              />
            ))}
          </div>
        )}

        {/* ── Hero headline + CTA ── */}
        <div className="hero-headline relative z-10 px-6 md:px-12 lg:px-20 pb-20 pt-40 ">
          {/* Wordmark fonts:
              — "Haritha" uses Harabara Mais (Bold), a commercial display font.
                It is NOT on Google Fonts/any free CDN — you need to own a license
                and drop the actual font files into /public/fonts/ with these exact
                names (or update the src paths below to match what you have):
                  /public/fonts/HarabaraMais-Bold.woff2
                  /public/fonts/HarabaraMais-Bold.woff
                Until those files exist, it silently falls back to a bold
                geometric sans so the layout doesn't break.
              — "Agro- Consultants" uses Times New Roman, which is a system font
                pre-installed on Windows/most OSes — no import needed, but it WILL
                render as a generic serif (e.g. Liberation Serif) on systems that
                don't have Times New Roman, such as most Linux machines/ChromeOS. */}
          <style>{`
            @font-face {
              font-family: 'Harabara Mais';
              src: url('/fonts/HarabaraMais-Bold.woff2') format('woff2'),
                   url('/fonts/HarabaraMais-Bold.woff') format('woff');
              font-weight: 700;
              font-style: normal;
              font-display: swap;
            }
          `}</style>

          <div className="overflow-hidden mb-3">
            {/* <p className="text-[#8ABC37]/70 text-xs tracking-[0.4em] uppercase font-mono">— Haritha Agro Consultants</p> */}
          </div>
          <h1 className="leading-none tracking-tight w-fit">
            {/* Wordmark — text, not image */}
            <span className="block overflow-hidden">
              <span
                className="hero-word block will-change-transform"
                style={{
                  fontFamily: "'Harabara Mais', 'Montserrat', 'Arial Black', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(6.75rem, 9vw, 9rem)",
                  lineHeight: 0.85,
                  color: "#8ABC37",
                }}
              >
                Haritha
              </span>
            </span>
            <span className="block overflow-hidden text-right">
              <span
                className="hero-word inline-block will-change-transform"
                style={{
                  fontFamily: "'Times New Roman', Times, serif",
                  fontWeight: 400,
                  fontSize: "clamp(1.6rem, 2.2vw, 2.2rem)",
                  letterSpacing: "0.12em",
                  color: "#c4bba1",
                }}
              >
                Agro- Consultants
              </span>
            </span>
          </h1>
          <div className="mt-10 flex flex-col sm:flex-row sm:items-end justify-between gap-8 max-w-7xl">
            <p className="hero-sub text-stone-300/80 text-lg leading-relaxed max-w-md">
              Kerala's horticulture-based firm offering turnkey solutions
              in landscaping, high-tech horticulture & farm consultancy.
            </p>
            <div className="hero-btns flex items-center gap-4 shrink-0">
              <Link to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 border border-white/25 text-white text-sm uppercase tracking-[0.12em] hover:border-[#8ABC37]/60 hover:text-[#8ABC37] transition-colors">
                Start a project <span className="text-base">→</span>
              </Link>
              {/* <Link to="/services"
                className="inline-flex items-center gap-2 px-8 py-4 border border-white/25 text-white text-sm uppercase tracking-[0.12em] hover:border-[#8ABC37]/60 hover:text-[#8ABC37] transition-colors">
                Our work
              </Link> */}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10 z-10" />
      </section>


      {/* ══════════════════════════════════════════════════════════════
          TICKER STRIP — journal headlines marquee
      ══════════════════════════════════════════════════════════════ */}
      <TickerStrip
        blogs={BLOGS}
        onSelect={handleTickerSelect}
        activeIndex={-1}
        trackRef={tickerRef}
      />



      {/* ══════════════════════════════════════════════════════════════
          SECTION 2 · ABOUT
      ══════════════════════════════════════════════════════════════ */}
      <section className="about-section bg-stone-50 py-28 md:py-38 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">

          <div className="flex items-center gap-6 mb-16 border-t border-stone-300 pt-8">
            <span className="text-stone-400 text-[10px] tracking-[0.4em] uppercase font-mono">
              02 / Who we are
            </span>
            <div className="flex-1 h-px bg-stone-300" />
            <span className="text-stone-400 text-[10px] tracking-[0.4em] uppercase font-mono">
              Est. 1999
            </span>
          </div>

          <div className="relative">

            <div className="lg:pr-[420px]">

              <h2 className="about-heading text-[clamp(2rem,4.5vw,4rem)] font-black text-stone-900 leading-[1.0] tracking-tight uppercase mb-10">
                Kerala's<br />
                horticulture<br />
                <span className="text-[#8ABC37]">turnkey firm.</span>
              </h2>

              <div className="about-body-text space-y-5">
                <p className="text-stone-600 text-lg leading-relaxed max-w-lg">
                  Haritha Agro Consultants is a group of professional agricultural experts 
                  involved in the planning and turnkey execution of landscaping and farming 
                  projects in Kerala with 35+ years of experience in the field.
                </p>
                {/* <p className="text-stone-500 leading-relaxed max-w-lg">
                  Our in-house horticulturists work alongside engineers to
                  develop detailed site plans. We follow a professional approach
                  across consultancy, turnkey execution, management and
                  post-harvest support — backed by 25 years of combined field
                  experience.
                </p> */}
                <div className="pt-4">
                  <Link
                    to="/about"
                    className="inline-flex items-center gap-3 text-green-700 font-semibold text-sm uppercase tracking-[0.15em] hover:gap-5 transition-all duration-300"
                  >
                    More about Haritha <span className="text-lg">→</span>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-stone-300 mt-14">
                {[
                  { value: 35, suffix: "+", label: "Years in the field" },
                  { value: 140, suffix: "", label: "Projects delivered" },
                  { value: 7, suffix: "", label: "Disciplines" },
                  { value: 14, suffix: "", label: "Districts served" },
                ].map((s, i) => (
                  <div
                    key={s.label}
                    className={[
                      "p-8",
                      i < 3 ? "border-r border-stone-300" : "",
                      i < 2 ? "border-b border-stone-300 sm:border-b-0" : "",
                    ].join(" ")}
                  >
                    <p
                      className="stat-value text-5xl md:text-6xl font-black text-stone-900 tabular-nums"
                      data-value={s.value}
                      data-suffix={s.suffix}
                    >
                      00{s.suffix}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 mt-2 font-mono">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

            </div>

            <div className="hidden lg:flex flex-col justify-center items-center absolute top-0 right-0 w-[380px] h-full">

              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div
                  className="absolute top-[-10%] left-[-5%] w-[80%] h-[80%] rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(180,220,160,0.35) 0%, transparent 70%)",
                    filter: "blur(50px)",
                  }}
                />
                <div
                  className="absolute bottom-[-5%] right-[-5%] w-[60%] h-[60%] rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(240,180,200,0.3) 0%, transparent 70%)",
                    filter: "blur(60px)",
                  }}
                />
              </div>

              <CardStack cards={STACK_CARDS} />
            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4 · PROJECTS — Stacking overlapping cards
      ══════════════════════════════════════════════════════════════ */}
      {/* <section className="bg-stone-900">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-8 border-b border-white/10">
          <div className="flex items-center justify-between">
            <span className="projects-label text-stone-400 text-[10px] tracking-[0.4em] uppercase font-mono">
              04 / Selected work
            </span>
            <Link to="/projects"
              className="text-stone-400 text-[10px] tracking-[0.4em] uppercase font-mono hover:text-[#8ABC37] transition-colors">
              View all →
            </Link>
          </div>
        </div>
        <div className="projects-pin-wrap relative h-screen overflow-hidden">
          {PROJECTS.map((p, i) => (
            <div key={p.client}
              className="project-stack-card absolute inset-0 will-change-transform"
              style={{ zIndex: i + 1 }}> */}

      {/* ── MOBILE ── */}
      {/* <div className="lg:hidden relative h-full w-full overflow-hidden">
                <img
                  src={p.img}
                  alt={p.client}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    e.target.parentElement.style.background = `hsl(${140 + i * 20}, 35%, ${20 + i * 5}%)`;
                    e.target.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/70 to-stone-900/30" />
                <div className="absolute inset-0 flex flex-col justify-between p-6">
                  <p className="text-[clamp(4rem,18vw,8rem)] font-black text-white/10 leading-none tabular-nums select-none">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <div>
                    <h3 className="text-[clamp(1.6rem,6vw,2.5rem)] font-black text-white uppercase tracking-tight leading-none mb-3">
                      {p.client}
                    </h3>
                    <div className="inline-flex items-center px-3 py-1.5 border border-white/20 mb-4">
                      <span className="text-stone-400 text-[10px] uppercase tracking-[0.3em] font-mono">{p.type}</span>
                    </div>
                    {p.desc && (
                      <p className="text-stone-300 text-sm leading-relaxed mb-6 max-w-sm">{p.desc}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <Link to="/projects"
                        className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/30 text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-white hover:text-stone-900 transition-all duration-300">
                        Details <span>→</span>
                      </Link>
                      <div className="flex items-center gap-2">
                        {PROJECTS.map((_, dotIdx) => (
                          <div key={dotIdx}
                            className={`h-px transition-all duration-300 ${dotIdx === i ? "w-8 bg-[#8ABC37]" : "w-4 bg-white/20"}`} />
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 text-white/30 text-[10px] uppercase tracking-[0.3em] font-mono">
                      {p.location || "Kerala, IN"}
                    </div>
                  </div>
                </div>
              </div> */}

      {/* ── DESKTOP ── */}
      {/* <div className="hidden lg:flex h-full flex-row bg-stone-900">
                <div className="w-[42%] flex flex-col justify-between p-8 md:p-12 lg:p-16 border-r border-white/8">
                  <div>
                    <p className="text-[clamp(4rem,10vw,10rem)] font-black text-white/8 leading-none tabular-nums select-none">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                  </div>
                  <div className="pb-4">
                    <h3 className="text-[clamp(1.5rem,3vw,3rem)] font-black text-white uppercase tracking-tight leading-none mb-4">
                      {p.client}
                    </h3>
                    <div className="inline-flex items-center px-3 py-1.5 border border-white/20 mb-6">
                      <span className="text-stone-400 text-[10px] uppercase tracking-[0.3em] font-mono">{p.type}</span>
                    </div>
                    {p.desc && (
                      <p className="text-stone-400 text-sm leading-relaxed max-w-sm mb-8">{p.desc}</p>
                    )}
                    <Link to="/projects"
                      className="inline-flex items-center gap-3 px-6 py-3 border border-white/30 text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-white hover:text-stone-900 transition-all duration-300">
                      Details <span>→</span>
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    {PROJECTS.map((_, dotIdx) => (
                      <div key={dotIdx}
                        className={`h-px transition-all duration-300 ${dotIdx === i ? "w-8 bg-[#8ABC37]" : "w-4 bg-white/20"}`} />
                    ))}
                  </div>
                </div>
                <div className="flex-1 relative overflow-hidden">
                  <img src={p.img} alt={p.client}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      e.target.parentElement.style.background = `hsl(${140 + i * 20}, 35%, ${20 + i * 5}%)`;
                      e.target.style.display = "none";
                    }} />
                  <div className="absolute inset-0 bg-gradient-to-r from-stone-900/40 via-transparent to-transparent" />
                  <div className="absolute bottom-8 right-8 text-white/30 text-[10px] uppercase tracking-[0.3em] font-mono">
                    {p.location || "Kerala, IN"}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section> */}

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3 · SERVICES — Stacking overlapping cards
          (same mechanic as Projects: number + name + description on the
          left, a crossfading image gallery on the right)
      ══════════════════════════════════════════════════════════════ */}
      <ServicesStack services={SERVICES} />

      {/* ══════════════════════════════════════════════════════════════
          SECTION 5 · CTA — Map parallax
      ══════════════════════════════════════════════════════════════ */}
      <section className="cta-section relative min-h-screen flex flex-col justify-center overflow-hidden bg-green-950">
        <div className="cta-map-bg absolute inset-[-20%] will-change-transform">
          <TopoMap />
        </div>
        <div className="absolute inset-0 bg-green-950/75" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 w-full py-32">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <div className="cta-overlay">
                <p className="text-[#8ABC37]/70 text-[10px] uppercase tracking-[0.4em] font-mono mb-6">
                  05 / Get in touch
                </p>
                <h2 className="text-[clamp(2.5rem,6vw,7rem)] font-black text-white uppercase leading-[0.92] tracking-tight mb-8">
                  Have a plot,<br />a problem,<br />
                  <span className="text-[#8ABC37]">or a plan?</span>
                </h2>
                <p className="text-stone-300/80 text-lg leading-relaxed max-w-md mb-10">
                  Talk to our horticulturists. Site visits available across all 14 districts of Kerala.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/contact"
                    className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#8ABC37] text-green-950 font-bold text-sm uppercase tracking-[0.15em] hover:bg-[#9bd146] transition-colors">
                    Book a consultation <span className="text-base">→</span>
                  </Link>
                  <Link to="/about"
                    className="inline-flex items-center justify-center gap-3 px-10 py-5 border border-white/25 text-white text-sm uppercase tracking-[0.15em] hover:border-[#8ABC37]/60 hover:text-[#8ABC37] transition-colors">
                    Learn about us
                  </Link>
                </div>
              </div>
            </div>
            {/* <div className="cta-overlay border border-white/12 bg-white/5 backdrop-blur-sm p-8 md:p-12">
              <p className="text-[#8ABC37]/70 text-[10px] uppercase tracking-[0.4em] font-mono mb-8">Direct contact</p>
              <div className="space-y-8">
                <div className="border-b border-white/10 pb-8">
                  <p className="text-stone-400 text-[10px] uppercase tracking-[0.3em] font-mono mb-2">Phone</p>
                  <a href="tel:+919400000000"
                    className="text-white text-2xl font-bold hover:text-[#8ABC37] transition-colors">
                    +91 94000 00000
                  </a>
                </div>
                <div className="border-b border-white/10 pb-8">
                  <p className="text-stone-400 text-[10px] uppercase tracking-[0.3em] font-mono mb-2">Email</p>
                  <a href="mailto:info@haritha.in"
                    className="text-white text-xl font-semibold hover:text-[#8ABC37] transition-colors">
                    info@haritha.in
                  </a>
                </div>
                <div>
                  <p className="text-stone-400 text-[10px] uppercase tracking-[0.3em] font-mono mb-2">Coverage</p>
                  <p className="text-stone-300 leading-relaxed">
                    All 14 districts of Kerala.<br />Site visits within 48 hours.
                  </p>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </section>
    </div>
  );
}
