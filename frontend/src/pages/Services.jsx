// Services.jsx — center-snapping infinite carousel, Home.jsx design language

import { useEffect, useRef, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SERVICES, HERO_GALLERY } from "../data";

gsap.registerPlugin(ScrollTrigger);

function HeroGallery({ images }) {
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef(null);
  const INTERVAL = 5000;
  const FADE_DUR = 1200;

  useEffect(() => {
    if (!images || images.length < 2) return;

    timerRef.current = setInterval(() => {
      setTransitioning(true);
      setNext(() => {
        const nextIdx = (current + 1) % images.length;
        return nextIdx;
      });
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

  if (!images || images.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        key={`cur-${current}`}
        className="absolute inset-0"
        style={{ animation: `heroPan ${INTERVAL + FADE_DUR}ms linear forwards` }}
      >
        <img
          src={images[current]}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ willChange: "transform" }}
        />
      </div>

      {transitioning && next !== null && (
        <div
          key={`next-${next}`}
          className="absolute inset-0"
          style={{ opacity: 0, animation: `heroFadeIn ${FADE_DUR}ms ease-out forwards` }}
        >
          <img
            src={images[next]}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      )}

      <style>{`
        @keyframes heroPan {
          from { transform: scale(1.0); }
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
   Topographic SVG — reused from Home / About for CTA
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
      ].map((d, i) => (
        <path key={i} d={d} fill="none"
          stroke="rgba(138,188,55,0.18)"
          strokeWidth={i % 3 === 0 ? "1.5" : "0.8"} />
      ))}
      <text x="20" y="780" fill="rgba(138,188,55,0.3)" fontSize="9"
        fontFamily="monospace" letterSpacing="2">HARITHA AGRO CONSULTANTS</text>
    </svg>
  );
}

/* (card style: bento — white bg, ghost index, code badge, divider, desc, hover arrow) */

/* ═══════════════════════════════════════════════════════════════════════════
   SERVICES CAROUSEL COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
function ServicesCarousel({ services }) {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const cardRefs = useRef([]);
  const ringRef = useRef(null);

  // State held in refs to avoid re-renders inside RAF
  const xRef = useRef(0);       // current track translateX
  const velRef = useRef(0);       // drag velocity
  const isDragging = useRef(false);
  const pointerStartX = useRef(0);
  const xAtStart = useRef(0);
  const lastPointerX = useRef(0);
  const rafRef = useRef(null);
  const snapRafRef = useRef(null);

  // Card metrics — filled after mount
  const cardW = useRef(0);
  const cardGap = useRef(0);
  const stride = useRef(0); // cardW + cardGap
  const N = services.length;

  /* ── Triple the list for seamless infinite loop ── */
  const tripled = [...services, ...services, ...services];

  /* ── After mount: measure and set initial offset so the MIDDLE set is visible ── */
  const init = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const firstCard = cardRefs.current[0];
    const secondCard = cardRefs.current[1];
    if (!firstCard || !secondCard) return;

    const r1 = firstCard.getBoundingClientRect();
    const r2 = secondCard.getBoundingClientRect();
    cardW.current = r1.width;
    cardGap.current = r2.left - r1.right;
    stride.current = cardW.current + cardGap.current;

    // Start at centre of middle set, first card centred
    const vw = viewport.clientWidth;
    const middleSetStart = -(stride.current * N); // offset to reach middle set index 0
    const centreFirst = middleSetStart + vw / 2 - cardW.current / 2;

    xRef.current = centreFirst;
    gsap.set(track, { x: centreFirst });
    updateScales();
    positionRing();
  }, [N]);

  useEffect(() => {
    requestAnimationFrame(() => {
      init();
      requestAnimationFrame(init); // double-tick ensures layout has settled
    });
  }, [init]);

  /* ── Proximity-based scaling ── */
  const updateScales = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const vw = viewport.clientWidth;
    const vCentre = vw / 2;

    cardRefs.current.forEach((el) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cCtr = r.left + r.width / 2;
      const dist = Math.abs(cCtr - vCentre);
      const maxD = vw * 0.6;
      const t = Math.max(0, 1 - dist / maxD);   // 0..1 proximity
      const s = 0.88 + t * 0.17;                 // 0.88 → 1.05

      gsap.set(el, {
        scale: s,
        zIndex: Math.round(t * 10),
        // bento cards are white — no brightness dimming needed,
        // instead fade the card slightly via opacity
        opacity: 0.55 + t * 0.45,
      });
    });
  }, []);

  /* ── Position the floating ring on the right edge of the active/centre card ── */
  const positionRing = useCallback(() => {
    const viewport = viewportRef.current;
    const ring = ringRef.current;
    if (!viewport || !ring) return;
    const vw = viewport.clientWidth;
    const vCentre = vw / 2;

    let closest = null;
    let minDist = Infinity;

    cardRefs.current.forEach((el) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cCtr = r.left + r.width / 2;
      const d = Math.abs(cCtr - vCentre);
      if (d < minDist) { minDist = d; closest = el; }
    });

    if (closest) {
      const r = closest.getBoundingClientRect();
      const vr = viewport.getBoundingClientRect();
      gsap.to(ring, {
        x: r.right - vr.left - 20,   // 20 = half ring width, so it straddles the edge
        y: r.top - vr.top + r.height / 2 - 20,
        duration: 0.5,
        ease: "expo.out",
      });
    }
  }, []);

  /* ── Infinite loop: if we drift too far into first or last copy, jump silently ── */
  const clampInfinite = useCallback(() => {
    const track = trackRef.current;
    if (!track || stride.current === 0) return;
    const totalStride = stride.current * N;

    // If we've scrolled an entire set's worth in either direction, jump
    if (xRef.current > -(stride.current * N * 0.5)) {
      xRef.current -= totalStride;
      gsap.set(track, { x: xRef.current });
    } else if (xRef.current < -(stride.current * N * 1.5)) {
      xRef.current += totalStride;
      gsap.set(track, { x: xRef.current });
    }
  }, [N]);

  /* ── Snap to nearest card centre ── */
  const snapToNearest = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || stride.current === 0) return;

    const vw = viewport.clientWidth;
    // How far the first card's centre currently is from viewport centre
    // x = track offset; card centres = x + stride * i + cardW/2
    // We want to find i such that x + stride*i + cardW/2 = vw/2
    // => i = (vw/2 - cardW/2 - x) / stride
    const raw = (vw / 2 - cardW.current / 2 - xRef.current) / stride.current;
    const iSnap = Math.round(raw);
    const target = vw / 2 - cardW.current / 2 - stride.current * iSnap;

    gsap.killTweensOf(track);
    gsap.to(track, {
      x: target,
      duration: 0.75,
      ease: "expo.out",
      onUpdate: () => {
        xRef.current = gsap.getProperty(track, "x");
        clampInfinite();
        updateScales();
        positionRing();
      },
      onComplete: () => {
        xRef.current = gsap.getProperty(track, "x");
        clampInfinite();
        updateScales();
        positionRing();
      },
    });
  }, [clampInfinite, updateScales, positionRing]);

  /* ── Step by one card in a direction ── */
  const step = useCallback((dir) => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || stride.current === 0) return;
    gsap.killTweensOf(track);

    const newX = xRef.current - dir * stride.current;
    gsap.to(track, {
      x: newX,
      duration: 0.65,
      ease: "power3.out",
      onUpdate: () => {
        xRef.current = gsap.getProperty(track, "x");
        clampInfinite();
        updateScales();
        positionRing();
      },
      onComplete: () => {
        xRef.current = gsap.getProperty(track, "x");
        snapToNearest();
      },
    });
  }, [clampInfinite, snapToNearest, updateScales, positionRing]);

  /* ── Pointer / touch drag ── */
  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const onDown = (e) => {
      gsap.killTweensOf(track);
      cancelAnimationFrame(snapRafRef.current);
      isDragging.current = true;
      pointerStartX.current = e.clientX ?? e.touches?.[0]?.clientX;
      xAtStart.current = xRef.current;
      lastPointerX.current = pointerStartX.current;
      velRef.current = 0;
      viewport.style.cursor = "grabbing";
    };

    const onMove = (e) => {
      if (!isDragging.current) return;
      const cx = e.clientX ?? e.touches?.[0]?.clientX;
      const dx = cx - pointerStartX.current;
      velRef.current = cx - lastPointerX.current;
      lastPointerX.current = cx;

      xRef.current = xAtStart.current + dx;
      gsap.set(track, { x: xRef.current });
      clampInfinite();
      updateScales();
      positionRing();
    };

    const onUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      viewport.style.cursor = "grab";

      // Momentum flick — add velocity then snap
      const flick = velRef.current * 4;
      xRef.current += flick;
      gsap.to(track, {
        x: xRef.current,
        duration: 0.4,
        ease: "power2.out",
        onUpdate: () => {
          xRef.current = gsap.getProperty(track, "x");
          clampInfinite();
          updateScales();
          positionRing();
        },
        onComplete: () => {
          xRef.current = gsap.getProperty(track, "x");
          snapToNearest();
        },
      });
    };

    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) * 1.5) return; // vertical scroll — ignore
      e.preventDefault();
      xRef.current -= e.deltaX;
      gsap.set(track, { x: xRef.current });
      clampInfinite();
      updateScales();
      positionRing();
      clearTimeout(onWheel._snap);
      onWheel._snap = setTimeout(snapToNearest, 180);
    };

    viewport.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    viewport.addEventListener("wheel", onWheel, { passive: false });
    viewport.addEventListener("touchstart", onDown, { passive: true });
    viewport.addEventListener("touchmove", onMove, { passive: true });
    viewport.addEventListener("touchend", onUp);

    return () => {
      viewport.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      viewport.removeEventListener("wheel", onWheel);
      viewport.removeEventListener("touchstart", onDown);
      viewport.removeEventListener("touchmove", onMove);
      viewport.removeEventListener("touchend", onUp);
    };
  }, [clampInfinite, snapToNearest, updateScales, positionRing]);

  /* ── Keyboard navigation ── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  return (
    <div
      className="relative overflow-hidden select-none"
      style={{
        background: "#fffff",   // sage-green, distinctly earthy not default
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {/* Subtle linen texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Section header */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 w-full mb-12 pt-20">
        <div className="flex items-center gap-6 border-t border-white/20 pt-8">
          <span className="text text-[10px] tracking-[0.4em] uppercase font-mono">
            Services
          </span>
          <div className="flex-1 h-px bg-white/15" />
          <span className="text text-[10px] tracking-[0.4em] uppercase font-mono">
            {String(services.length).padStart(2, "0")} disciplines
          </span>
        </div>
        <p className="text-gray-500/90 mt-4 max-w-md leading-relaxed">
          Each service can stand alone, but our strength is combining them — one team,
          from planning through to ongoing management.
        </p>
      </div>

      {/* Carousel viewport */}
      <div
        ref={viewportRef}
        className="relative z-10 w-full overflow-visible"
        style={{ cursor: "grab", height: "420px" }}
        tabIndex={0}
        aria-label="Services carousel — use arrow keys to navigate"
      >
        {/* Track */}
        <div
          ref={trackRef}
          className="absolute top-0 left-0 flex items-center will-change-transform"
          style={{ gap: "0px", height: "100%", width: "max-content" }}
        >
          {tripled.map((s, i) => {
            const origIdx = i % N;
            return (
              <article
                key={`${origIdx}-${i}`}
                ref={(el) => { cardRefs.current[i] = el; }}
                className="svc-bento-card shrink-0 bg-white border border-stone-200 p-8 group will-change-transform flex flex-col"
                style={{
                  width: "clamp(260px, 28vw, 360px)",
                  height: "380px",
                  transformOrigin: "center center",
                  boxSizing: "border-box",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                {/* Ghost index numeral */}
                <p className="text-[clamp(3rem,5vw,5rem)] font-black text-stone-200 leading-none mb-5 transition-colors duration-300 tabular-nums select-none"
                  style={{ "--tw-text-opacity": 1 }}
                  onMouseEnter={e => e.currentTarget.style.color = "rgba(138,188,55,0.25)"}
                  onMouseLeave={e => e.currentTarget.style.color = ""}>
                  {String(origIdx + 1).padStart(2, "0")}
                </p>

                {/* Code badge */}
                {/* <p className="text-[9px] font-bold uppercase tracking-[0.3em] font-mono mb-2"
                  style={{ color: "#8ABC37" }}>
                  {s.code}
                </p> */}

                {/* Title */}
                <h3 className="text-base font-bold text-stone-900 uppercase tracking-[0.08em] mb-3 leading-tight">
                  {s.title}
                </h3>

                {/* Divider */}
                <div className="w-8 h-px mb-4" style={{ backgroundColor: "#8ABC37" }} />

                {/* Description */}
                <p className="text-sm text-stone-500 leading-relaxed flex-1">
                  {s.desc}
                </p>

                {/* Arrow — appears on hover */}
                {/* <div className="mt-6 flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ color: "#6a9a28" }}>
                  <span>Learn more</span>
                  <span>→</span>
                </div> */}
              </article>
            );
          })}
        </div>

        {/* Floating navigation ring — anchored to active card right edge */}
        <div
          ref={ringRef}
          className="absolute pointer-events-none"
          style={{
            width: "40px",
            height: "40px",
            border: "1.5px solid rgba(255,255,255,0.55)",
            borderRadius: "50%",
            top: 0,
            left: 0,
            mixBlendMode: "overlay",
            transform: "translate(0,0)",
          }}
          aria-hidden="true"
        />
      </div>

      {/* Arrow controls */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 w-full mt-10 mb-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => step(-1)}
            className="w-11 h-11 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/60 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label="Previous service"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 11L5 7L9 3" stroke="white" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={() => step(1)}
            className="w-11 h-11 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/60 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label="Next service"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3L9 7L5 11" stroke="white" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-mono ml-2">
            Drag or use arrows
          </span>
        </div>
        <Link
          to="/contact"
          className="hidden sm:inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-mono transition-colors duration-200 border-b pb-1"
          style={{
            color: "rgba(138,188,55,0.7)",
            borderColor: "rgba(138,188,55,0.2)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = "#8ABC37";
            e.currentTarget.style.borderColor = "rgba(138,188,55,0.6)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = "rgba(138,188,55,0.7)";
            e.currentTarget.style.borderColor = "rgba(138,188,55,0.2)";
          }}
        >
          Ask about a service →
        </Link>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SERVICES PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function Services() {
  const rootRef = useRef(null);

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

  useEffect(() => {
    const raf = requestAnimationFrame(() => { ScrollTrigger.refresh(); });
    const ctx = gsap.context(() => {

      /* ── Hero entrance ── */
      gsap.fromTo(".svc-hero-word",
        { yPercent: 120, opacity: 0 },
        {
          yPercent: 0, opacity: 1,
          duration: 1.1, ease: "expo.out",
          stagger: 0.055, delay: 0.2,
          clearProps: "transform,opacity",
        }
      );
      gsap.from(".svc-hero-sub", {
        y: 28, opacity: 0, duration: 1, ease: "expo.out", delay: 0.95,
        clearProps: "transform,opacity",
      });
      gsap.from(".svc-hero-eyebrow", {
        y: 16, opacity: 0, duration: 0.8, ease: "expo.out", delay: 0.15,
        clearProps: "transform,opacity",
      });

      /* ── Hero parallax ── */
      gsap.to(".svc-hero-bg", {
        scale: 1.06, ease: "none",
        scrollTrigger: { trigger: ".svc-hero-section", start: "top top", end: "bottom top", scrub: 1 },
      });
      gsap.to(".svc-hero-content", {
        scale: 0.9, opacity: 0, yPercent: -8, ease: "none",
        scrollTrigger: { trigger: ".svc-hero-section", start: "top top", end: "60% top", scrub: 1 },
      });

      /* ── CTA ── */
      gsap.to(".svc-cta-map-bg", {
        yPercent: -20, ease: "none",
        scrollTrigger: { trigger: ".svc-cta-section", start: "top bottom", end: "bottom top", scrub: 1 },
      });
      gsap.from(".svc-cta-overlay > *", {
        y: 50, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.12,
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: ".svc-cta-section", start: "top 72%", once: true },
      });

    }, rootRef);

    return () => { ctx.revert(); cancelAnimationFrame(raf); };
  }, []);

  const heroWords = "Seven disciplines, applied together.".split(" ");

  return (
    <div ref={rootRef} className="font-sans">

      {/* ══════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <section className="svc-hero-section relative min-h-screen flex flex-col justify-end overflow-hidden bg-green-950">
        <div className="svc-hero-bg absolute inset-0 will-change-transform">
          <HeroGallery images={HERO_GALLERY} />

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(5,30,15,0.55) 0%, rgba(5,30,15,0.35) 50%, rgba(5,30,15,0.72) 100%)",
            }}
          />
          <svg className="absolute inset-0 w-full h-full opacity-20" aria-hidden="true"
            viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice">
            {Array.from({ length: 16 }).map((_, i) => (
              <line key={`g${i}`} x1="0" y1={i * 60} x2="1200" y2={i * 60}
                stroke="rgba(138,188,55,0.25)" strokeWidth="0.5" />
            ))}
            {Array.from({ length: 20 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 63} y1="0" x2={i * 63} y2="900"
                stroke="rgba(138,188,55,0.25)" strokeWidth="0.5" />
            ))}
            {["M0,500 C200,420 400,550 600,470 S900,380 1200,460",
              "M0,540 C180,450 380,580 580,500 S880,410 1200,500",
              "M0,460 C220,380 420,520 620,440 S920,350 1200,420",
            ].map((d, i) => (
              <path key={i} d={d} fill="none"
                stroke="rgba(138,188,55,0.35)"
                strokeWidth={i === 1 ? "1.2" : "0.7"} />
            ))}
          </svg>
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-[#8ABC37]/8 blur-[120px] pointer-events-none" />
        </div>

        {/* Scroll indicator */}
        <div className="absolute top-8 right-8 z-10 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ border: "1px solid rgba(138,188,55,0.4)" }}>
            <div className="w-1 h-1 rounded-full"
              style={{ backgroundColor: "rgba(138,188,55,0.6)" }} />
          </div>
          <span className="text-[10px] tracking-[0.3em] uppercase font-mono"
            style={{ color: "rgba(138,188,55,0.5)" }}>Scroll</span>
        </div>

        <div className="svc-hero-content relative z-10 px-6 md:px-12 lg:px-20 pb-20 pt-40">
          <div className="overflow-hidden mb-3 svc-hero-eyebrow">
            <p className="text-xs tracking-[0.4em] uppercase font-mono"
              style={{ color: "rgba(138,188,55,0.7)" }}>
              — What we do
            </p>
          </div>
          <h1 className="text-[clamp(2rem,6vw,6rem)] font-black text-white leading-[0.93] tracking-tight uppercase max-w-[18ch]">
            {heroWords.map((word, i) => (
              <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.25em]">
                <span className="svc-hero-word inline-block will-change-transform">{word}</span>
              </span>
            ))}
          </h1>
          <p className="svc-hero-sub text-stone-300/80 text-lg leading-relaxed max-w-xl mt-8">
            From site assessment to post-harvest support — a single team handles
            planning, irrigation, planting and ongoing management for one site.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10 z-10" />
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CAROUSEL — full bleed sage-green section
      ══════════════════════════════════════════════════════════════ */}
      <ServicesCarousel services={SERVICES} />

      {/* ══════════════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════════════ */}
      <section className="svc-cta-section relative min-h-[65vh] flex flex-col justify-center overflow-hidden bg-green-950">
        <div className="svc-cta-map-bg absolute inset-[-20%] will-change-transform">
          <TopoMap />
        </div>
        <div className="absolute inset-0 bg-green-950/75" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 w-full py-32">
          <div className="max-w-2xl svc-cta-overlay">
            <p className="text-[10px] uppercase tracking-[0.4em] font-mono mb-6"
              style={{ color: "rgba(138,188,55,0.7)" }}>
              Get started
            </p>
            <h2 className="text-[clamp(2.5rem,6vw,6.5rem)] font-black text-white uppercase leading-[0.92] tracking-tight mb-8">
              Not sure which<br />
              <span style={{ color: "#8ABC37" }}>service fits?</span>
            </h2>
            <p className="text-stone-300/80 text-lg leading-relaxed max-w-md mb-10">
              Describe your site and goals — we'll suggest a starting point.
              Site visits available across all 14 districts of Kerala.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 font-bold text-sm uppercase tracking-[0.15em] transition-colors"
                style={{
                  backgroundColor: "#8ABC37",
                  color: "#1a2e05",
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#9dcc45"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#8ABC37"}
              >
                Ask Haritha <span className="text-base">→</span>
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 border border-white/25 text-white text-sm uppercase tracking-[0.15em] transition-colors"
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(138,188,55,0.6)";
                  e.currentTarget.style.color = "#8ABC37";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                  e.currentTarget.style.color = "white";
                }}
              >
                About the firm
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
