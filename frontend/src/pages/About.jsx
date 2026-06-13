// About.jsx — styled to match Home.jsx, with GSAP Flip dual-state STACK_CARDS showcase

import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { STACK_CARDS, HERO_GALLERY } from "../data";

gsap.registerPlugin(ScrollTrigger, Flip);

/* ─────────────────────────────────────────────────────────────────────────
   HERO IMAGE GALLERY — crossfading background slideshow
   Reads from HERO_GALLERY in data/index.js
───────────────────────────────────────────────────────────────────────── */
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
      {/* Current image — always visible, zooms slowly */}
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

      {/* Next image — fades in during transition */}
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
   Topographic SVG background — reused from Home
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
      ].map((d, i) => (
        <path key={i} d={d} fill="none"
          stroke="rgba(138,188,55,0.18)"
          strokeWidth={i % 3 === 0 ? "1.5" : "0.8"} />
      ))}
      <text x="20" y="30" fill="rgba(138,188,55,0.4)" fontSize="9"
        fontFamily="monospace" letterSpacing="3">KERALA — INDIA / 8–13°N 74–78°E</text>
      <text x="20" y="780" fill="rgba(138,188,55,0.3)" fontSize="9"
        fontFamily="monospace" letterSpacing="2">HARITHA AGRO CONSULTANTS</text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   APPROACH DATA
───────────────────────────────────────────────────────────────────────── */
const APPROACH = [
  {
    num: "01",
    title: "Consultancy",
    desc: "Site assessment and planning grounded in real horticultural and engineering expertise.",
  },
  {
    num: "02",
    title: "Turnkey Execution",
    desc: "From design to delivery — landscaping, irrigation, structures and planting, all in-house.",
  },
  {
    num: "03",
    title: "Management",
    desc: "Ongoing operational support so farms and landscapes perform season after season.",
  },
  {
    num: "04",
    title: "Post-Harvest Support",
    desc: "Handling and quality support after harvest, completing the production cycle.",
  },
];

/* ─────────────────────────────────────────────────────────────────────────
   SCATTERED ROTATIONS — each card gets a fixed subtle rotation
───────────────────────────────────────────────────────────────────────── */
const ROTATIONS = [-6, 4, -2, 5, -4, 3, -5, 2, -3, 6, -2, 4];

/* ═══════════════════════════════════════════════════════════════════════════
   DUAL-STATE SHOWCASE COMPONENT
   State A: Scattered Carousel   |   State B: Interactive List
═══════════════════════════════════════════════════════════════════════════ */
function DualStateShowcase({ cards }) {
  const [view, setView] = useState("carousel");
  const [activeCard, setActiveCard] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const carouselRef = useRef(null);
  const listRef = useRef(null);
  const thumbnailRef = useRef(null);
  const heroTextRef = useRef(null);
  const listTitlesRef = useRef([]);
  const imageRefs = useRef([]);
  const metaRefs = useRef([]);
  const trackRef = useRef(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollX = useRef(0);
  const startScrollX = useRef(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (view !== "carousel") return;
    const track = trackRef.current;
    if (!track) return;

    const onPointerDown = (e) => {
      isDragging.current = true;
      dragStartX.current = e.clientX;
      startScrollX.current = scrollX.current;
      track.style.cursor = "grabbing";
    };
    const onPointerMove = (e) => {
      if (!isDragging.current) return;
      const dx = e.clientX - dragStartX.current;
      const newX = startScrollX.current + dx;
      scrollX.current = newX;
      gsap.set(track, { x: newX });
    };
    const onPointerUp = () => {
      isDragging.current = false;
      if (track) track.style.cursor = "grab";
    };

    const onTouchStart = (e) => {
      isDragging.current = true;
      dragStartX.current = e.touches[0].clientX;
      startScrollX.current = scrollX.current;
    };
    const onTouchMove = (e) => {
      if (!isDragging.current) return;
      const dx = e.touches[0].clientX - dragStartX.current;
      const newX = startScrollX.current + dx;
      scrollX.current = newX;
      gsap.set(track, { x: newX });
    };
    const onTouchEnd = () => { isDragging.current = false; };

    track.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    track.addEventListener("touchstart", onTouchStart, { passive: true });
    track.addEventListener("touchmove", onTouchMove, { passive: true });
    track.addEventListener("touchend", onTouchEnd);

    return () => {
      track.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      track.removeEventListener("touchstart", onTouchStart);
      track.removeEventListener("touchmove", onTouchMove);
      track.removeEventListener("touchend", onTouchEnd);
    };
  }, [view]);

  const toList = useCallback(() => {
    if (isTransitioning || view === "list") return;
    setIsTransitioning(true);

    const tl = gsap.timeline({
      onComplete: () => {
        setView("list");
        setIsTransitioning(false);
      },
    });

    if (heroTextRef.current) {
      tl.to(heroTextRef.current, { opacity: 0, scale: 0.94, duration: 0.55, ease: "power3.in" }, 0);
    }

    const thumb = thumbnailRef.current;
    if (thumb) {
      const thumbRect = thumb.getBoundingClientRect();
      imageRefs.current.forEach((el, i) => {
        if (!el) return;
        const elRect = el.getBoundingClientRect();
        const dx = thumbRect.left + thumbRect.width / 2 - (elRect.left + elRect.width / 2);
        const dy = thumbRect.top + thumbRect.height / 2 - (elRect.top + elRect.height / 2);
        const scaleX = thumbRect.width / elRect.width;
        const scaleY = thumbRect.height / elRect.height;

        tl.to(el, {
          x: `+=${dx}`, y: `+=${dy}`, scaleX, scaleY,
          rotation: 0, opacity: i === activeCard ? 1 : 0,
          duration: 1.35, ease: "expo.inOut",
        }, 0.05 * i);

        if (metaRefs.current[i]) {
          tl.to(metaRefs.current[i], { opacity: 0, duration: 0.25 }, 0);
        }
      });
    }
  }, [isTransitioning, view, activeCard]);

  const toCarousel = useCallback(() => {
    if (isTransitioning || view === "carousel") return;
    setIsTransitioning(true);

    imageRefs.current.forEach((el) => {
      if (el) gsap.set(el, { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1 });
    });
    if (heroTextRef.current) gsap.set(heroTextRef.current, { opacity: 0, scale: 0.94 });

    setView("carousel");

    requestAnimationFrame(() => {
      const tl = gsap.timeline({ onComplete: () => setIsTransitioning(false) });

      listTitlesRef.current.forEach((el) => {
        if (el) tl.to(el, { opacity: 0, y: 12, duration: 0.35, ease: "power2.in" }, 0);
      });

      if (heroTextRef.current) {
        tl.to(heroTextRef.current, { opacity: 1, scale: 1, duration: 0.85, ease: "expo.out" }, 0.3);
      }

      imageRefs.current.forEach((el, i) => {
        if (!el) return;
        const rot = ROTATIONS[i % ROTATIONS.length];
        tl.fromTo(el,
          { opacity: i === activeCard ? 1 : 0, x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
          { opacity: 1, x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: rot, duration: 1.3, ease: "expo.out" },
          0.05 + i * 0.06
        );
        if (metaRefs.current[i]) {
          tl.to(metaRefs.current[i], { opacity: 1, duration: 0.5, ease: "power2.out" }, 0.8 + i * 0.04);
        }
      });
    });
  }, [isTransitioning, view, activeCard]);

  return (
    <div className="relative">
      <div className="sticky bottom-4 z-50 flex justify-start px-4 md:px-6 lg:px-12 pointer-events-none">
      </div>

      {/* STATE A — SCATTERED CAROUSEL */}
      <div
        ref={carouselRef}
        className="relative overflow-hidden bg-stone-950"
        style={{
          minHeight: isMobile ? "420px" : "560px",
          display: view === "carousel" ? "block" : "none",
        }}
      >
        <div
          ref={heroTextRef}
          className="absolute bottom-0 left-0 right-0 z-0 select-none pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <p
            className="text-[clamp(4rem,18vw,18rem)] font-black text-white/[0.04] uppercase leading-none tracking-tighter whitespace-nowrap"
            style={{ letterSpacing: "-0.04em" }}
          >
            HARITHA
          </p>
        </div>

        <div
          ref={trackRef}
          className="relative z-10 flex items-end gap-5 md:gap-8 pb-10 pt-10 md:pb-16 md:pt-16"
          style={{
            paddingLeft: isMobile ? "16px" : "48px",
            paddingRight: isMobile ? "32px" : "48px",
            width: "max-content",
            cursor: "grab",
            userSelect: "none",
          }}
        >
          {cards.map((card, i) => {
            const desktopHeights = [340, 400, 360, 420, 350, 390, 370, 410, 345, 385, 355, 415];
            const desktopWidths = [240, 280, 260, 300, 250, 270, 255, 285, 245, 275, 265, 295];
            const mobileHeights = [220, 260, 235, 270, 225, 250, 240, 265, 222, 248, 232, 268];
            const mobileWidths = [150, 175, 162, 185, 155, 168, 158, 178, 152, 170, 164, 182];

            const heightArr = isMobile ? mobileHeights : desktopHeights;
            const widthArr = isMobile ? mobileWidths : desktopWidths;
            const h = heightArr[i % heightArr.length];
            const w = widthArr[i % widthArr.length];
            const rot = isMobile
              ? ROTATIONS[i % ROTATIONS.length] * 0.5
              : ROTATIONS[i % ROTATIONS.length];

            return (
              <div key={i} className="relative shrink-0 flex flex-col items-start" style={{ width: w }}>
                <div ref={(el) => { metaRefs.current[i] = el; }} className="mb-2 md:mb-3 self-start" style={{ opacity: 1 }}>
                  <p className="text-stone-400 text-[8px] md:text-[9px] tracking-[0.35em] uppercase font-mono leading-relaxed">
                    {String(i + 1).padStart(2, "0")}. {card.name}
                    {card.role && (
                      <span className="ml-1" style={{ color: "rgba(138,188,55,0.7)" }}>
                        [{card.role}]
                      </span>
                    )}
                  </p>
                </div>
                <div
                  ref={(el) => { imageRefs.current[i] = el; }}
                  className="relative rounded-lg overflow-hidden will-change-transform"
                  style={{
                    width: w, height: h,
                    transform: `rotate(${rot}deg)`,
                    transformOrigin: "center bottom",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.25)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-900 to-emerald-800" />
                  <img
                    src={card.src} alt={card.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = "none"; }}
                    draggable="false"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.4) 100%)" }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {isMobile && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
            <span className="text-white/25 text-[9px] tracking-[0.3em] uppercase font-mono">← swipe →</span>
          </div>
        )}
      </div>

      {/* STATE B — INTERACTIVE LIST */}
      <div
        ref={listRef}
        className="relative bg-stone-950 overflow-hidden"
        style={{
          minHeight: isMobile ? "480px" : "560px",
          display: view === "list" ? "flex" : "none",
          alignItems: "stretch",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        {!isMobile ? (
          <div
            className="hidden lg:flex items-center justify-center shrink-0 border-r border-white/8"
            style={{ width: "340px", padding: "48px" }}
          >
            <div
              ref={thumbnailRef}
              className="relative rounded-lg overflow-hidden"
              style={{ width: "260px", height: "340px", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-900 to-emerald-800" />
              {cards.map((card, i) => (
                <img key={i} src={card.src} alt={card.name}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-400"
                  style={{ opacity: i === activeCard ? 1 : 0 }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              ))}
              <div className="absolute inset-0"
                style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 100%)" }}
              />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white/50 text-[9px] tracking-[0.3em] uppercase font-mono mb-1">
                  {String(activeCard + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}
                </p>
                <p className="text-white text-sm font-bold tracking-tight">{cards[activeCard]?.name}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full shrink-0 border-b border-white/10" style={{ height: "180px" }}>
            <div ref={thumbnailRef} className="relative w-full h-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-900 to-emerald-800" />
              {cards.map((card, i) => (
                <img key={i} src={card.src} alt={card.name}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                  style={{ opacity: i === activeCard ? 1 : 0 }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              ))}
              <div className="absolute inset-0"
                style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)" }}
              />
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                <p className="text-white text-sm font-bold tracking-tight">{cards[activeCard]?.name}</p>
                <p className="text-white/50 text-[9px] tracking-[0.3em] uppercase font-mono">
                  {String(activeCard + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}
                </p>
              </div>
            </div>
          </div>
        )}

        <div
          className="flex-1 flex flex-col justify-start px-5 md:px-8 lg:px-16 py-6 md:py-10 lg:py-16 overflow-y-auto"
          style={{ maxHeight: isMobile ? "300px" : "560px" }}
        >
          <p className="text-stone-500 text-[10px] tracking-[0.4em] uppercase font-mono mb-5 md:mb-10">
            Project gallery
          </p>
          <ul className="space-y-0">
            {cards.map((card, i) => (
              <li key={i}>
                <button
                  ref={(el) => { listTitlesRef.current[i] = el; }}
                  className="w-full text-left group py-2.5 md:py-3 border-b border-white/5 flex items-center gap-3 md:gap-6 transition-colors duration-200"
                  onMouseEnter={() => setActiveCard(i)}
                  onClick={() => setActiveCard(i)}
                >
                  <span className="text-stone-600 text-[9px] tracking-[0.3em] uppercase font-mono w-6 md:w-8 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="transition-all duration-200 flex-1 text-left"
                    style={{
                      fontSize: isMobile
                        ? (i === activeCard ? "1.05rem" : "0.95rem")
                        : "clamp(1.1rem, 2.5vw, 1.8rem)",
                      fontWeight: i === activeCard ? 900 : 300,
                      color: i === activeCard ? "#8ABC37" : "rgb(214 211 209)",
                      letterSpacing: i === activeCard ? "-0.01em" : "0.01em",
                      lineHeight: 1.15,
                    }}
                  >
                    {card.name}
                  </span>
                  {card.role && !isMobile && (
                    <span className="text-stone-600 text-[9px] tracking-[0.25em] uppercase font-mono ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {card.role}
                    </span>
                  )}
                  <svg
                    width="12" height="12" viewBox="0 0 14 14" fill="none"
                    className={`shrink-0 transition-opacity duration-200 ${i === activeCard ? "opacity-100" : "opacity-0"}`}
                  >
                    <path d="M3 7h8M7 3l4 4-4 4" stroke="#8ABC37" strokeWidth="1.4"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ABOUT PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function About() {
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

      /* ── Page hero entrance ── */
      gsap.fromTo(".about-hero-word",
        { yPercent: 120, opacity: 0 },
        {
          yPercent: 0, opacity: 1,
          duration: 1.1, ease: "expo.out",
          stagger: 0.06, delay: 0.2,
          clearProps: "transform,opacity",
        }
      );
      gsap.from(".about-hero-sub", {
        y: 28, opacity: 0, duration: 1, ease: "expo.out", delay: 0.95,
        clearProps: "transform,opacity",
      });
      gsap.from(".about-hero-eyebrow", {
        y: 16, opacity: 0, duration: 0.8, ease: "expo.out", delay: 0.15,
        clearProps: "transform,opacity",
      });

      /* ── Hero parallax ── */
      gsap.to(".about-hero-bg", {
        scale: 1.06, ease: "none",
        scrollTrigger: { trigger: ".about-hero-section", start: "top top", end: "bottom top", scrub: 1 },
      });
      gsap.to(".about-hero-content", {
        scale: 0.9, opacity: 0, yPercent: -8, ease: "none",
        scrollTrigger: { trigger: ".about-hero-section", start: "top top", end: "60% top", scrub: 1 },
      });

      /* ── Story section reveal ── */
      gsap.from(".story-text > *", {
        y: 40, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.12,
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: ".story-section", start: "top 75%", once: true },
      });
      gsap.from(".story-panel", {
        clipPath: "inset(0 100% 0 0)",
        duration: 1.25,
        ease: "expo.inOut",
        scrollTrigger: { trigger: ".story-section", start: "top 75%", once: true },
      });
      gsap.from(".story-panel-line", {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1,
        ease: "expo.out",
        stagger: 0.12,
        clearProps: "transform",
        scrollTrigger: { trigger: ".story-section", start: "top 70%", once: true },
      });
      gsap.from(".story-metric, .story-note", {
        y: 28,
        opacity: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.1,
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: ".story-section", start: "top 68%", once: true },
      });

      /* ── Approach cards ── */
      gsap.from(".approach-card", {
        y: 50, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.1,
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: ".approach-section", start: "top 78%", once: true },
      });
      gsap.from(".approach-heading > *", {
        y: 30, opacity: 0, duration: 0.8, ease: "expo.out", stagger: 0.1,
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: ".approach-section", start: "top 80%", once: true },
      });

      /* ── Showcase section heading ── */
      gsap.from(".showcase-heading > *", {
        y: 40, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.1,
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: ".showcase-section", start: "top 80%", once: true },
      });

      /* ── Partnerships ── */
      gsap.from(".partnerships-text > *", {
        y: 35, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.1,
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: ".partnerships-section", start: "top 78%", once: true },
      });

      /* ── Divider lines ── */
      gsap.utils.toArray(".section-divider").forEach((el) => {
        gsap.from(el, {
          scaleX: 0, transformOrigin: "left center", duration: 1.2, ease: "expo.out",
          clearProps: "transform",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });

      /* ── CTA ── */
      gsap.to(".about-cta-map-bg", {
        yPercent: -20, ease: "none",
        scrollTrigger: { trigger: ".about-cta-section", start: "top bottom", end: "bottom top", scrub: 1 },
      });
      gsap.from(".about-cta-overlay > *", {
        y: 50, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.12,
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: ".about-cta-section", start: "top 72%", once: true },
      });

    }, rootRef);

    return () => { ctx.revert(); cancelAnimationFrame(raf); };
  }, []);

  const heroTitle = "25 years in the field, literally.";
  const heroWords = heroTitle.split(" ");

  return (
    <div ref={rootRef} className="font-sans bg-stone-50">

      {/* ══════════════════════════════════════════════════════════════
          HERO — min-h-screen matches Home.jsx
      ══════════════════════════════════════════════════════════════ */}
      <section className="about-hero-section relative min-h-screen flex flex-col justify-end overflow-hidden bg-green-950">

        {/* ── about-hero-bg: scroll-parallax wrapper (scaled by GSAP) ── */}
        <div className="about-hero-bg absolute inset-0 will-change-transform">

          {/* ── Photo slideshow — sits at the very bottom of the stack ── */}
          <HeroGallery images={HERO_GALLERY} />

          {/* ── Dark vignette over the photos ── */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(5,30,15,0.55) 0%, rgba(5,30,15,0.35) 50%, rgba(5,30,15,0.72) 100%)",
            }}
          />

          {/* ── Topographic grid lines ── */}
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

          {/* ── Soft green glow blob ── */}
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-[#8ABC37]/8 blur-[120px] pointer-events-none" />
        </div>
        {/* end .about-hero-bg */}

        {/* ── Scroll indicator ── */}
        <div className="absolute top-8 right-8 z-10 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border border-[#8ABC37]/40 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-[#8ABC37]/60" />
          </div>
          <span className="text-[#8ABC37]/50 text-[10px] tracking-[0.3em] uppercase font-mono">Scroll</span>
        </div>

        {/* ── Hero headline + sub ── */}
        <div className="about-hero-content relative z-10 px-6 md:px-12 lg:px-20 pb-20 pt-40">
          <div className="overflow-hidden mb-3 about-hero-eyebrow">
            <p className="text-[#8ABC37]/70 text-xs tracking-[0.4em] uppercase font-mono">
              — About Haritha
            </p>
          </div>
          <h1 className="text-[clamp(2rem,6vw,6rem)] font-black text-white leading-[0.93] tracking-tight uppercase max-w-[18ch]">
            {heroWords.map((word, i) => (
              <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.25em]">
                <span className="about-hero-word inline-block will-change-transform">{word}</span>
              </span>
            ))}
          </h1>
          <p className="about-hero-sub text-stone-300/80 text-lg leading-relaxed max-w-xl mt-8">
            A firm of senior agriculture and horticulture professionals, bringing a technically grounded
            approach to landscaping and farming projects across Kerala.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10 z-10" />
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SHOWCASE — Dual-state STACK_CARDS
      ══════════════════════════════════════════════════════════════ */}
      <section className="showcase-section bg-stone-950 py-0 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-12 md:py-16 border-b border-white/10">
          <div className="flex items-center justify-between gap-8">
            <div className="section-divider h-px flex-1 bg-white/10 origin-left hidden lg:block" />
          </div>
          <div className="showcase-heading mt-4 md:mt-8">
            <h2 className="text-[clamp(1.8rem,4.5vw,4.5rem)] font-black text-white uppercase tracking-tight leading-none">
              From the ground up.
            </h2>
            <p className="text-stone-500 mt-3 md:mt-4 max-w-xl leading-relaxed text-sm md:text-base">
              A selection of landscapes, farms, and installations we've designed and delivered across Kerala.
              Toggle between views to explore.
            </p>
          </div>
        </div>

        <DualStateShowcase cards={STACK_CARDS} />
      </section>


      {/* ══════════════════════════════════════════════════════════════
          STORY
      ══════════════════════════════════════════════════════════════ */}
      <section className="story-section bg-stone-50 pb-28 md:pb-36 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">

          <div className="flex items-center gap-6 mb-16 border-t border-stone-300 pt-8">
            <div className="section-divider h-px flex-1 bg-stone-300 origin-left" />
            <span className="text-stone-400 text-[10px] tracking-[0.4em] uppercase font-mono">
              01 / Our story
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="story-text space-y-5">
              <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-black text-stone-900 leading-[1.0] tracking-tight uppercase">
                A maiden venture,<br />
                <span className="text-[#8ABC37]">built by people<br />who've done the work.</span>
              </h2>
              <p className="text-stone-600 text-lg leading-relaxed max-w-lg">
                Haritha Agro Consultants is the first horticulture-based firm in Kerala
                offering turnkey execution in landscaping, high-tech horticulture and
                technical solutions for the farming sector.
              </p>
              <p className="text-stone-500 leading-relaxed max-w-lg">
                With 25 years of combined experience, the firm is led by senior
                professionals, working alongside in-house horticulturists and engineers
                who prepare detailed plans for any area and dimension.
              </p>
              <div className="pt-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-3 text-[#8ABC37] font-semibold text-sm uppercase tracking-[0.15em] hover:gap-5 transition-all duration-300"
                >
                  Work with us <span className="text-lg">→</span>
                </Link>
              </div>
            </div>

            <div className="story-panel relative overflow-hidden bg-stone-900 min-h-[420px] md:min-h-[520px] flex flex-col justify-between p-8 md:p-10">
              <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 600 600" preserveAspectRatio="none" aria-hidden="true">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <line
                      key={`story-grid-${i}`}
                      x1="0"
                      y1={i * 60}
                      x2="600"
                      y2={i * 60}
                      stroke="white"
                      strokeWidth="1"
                    />
                  ))}
                  {Array.from({ length: 11 }).map((_, i) => (
                    <line
                      key={`story-grid-v-${i}`}
                      x1={i * 60}
                      y1="0"
                      x2={i * 60}
                      y2="600"
                      stroke="white"
                      strokeWidth="1"
                    />
                  ))}
                </svg>
              </div>

              <p className="absolute -right-3 -top-6 text-[clamp(7rem,16vw,14rem)] font-black leading-none text-white/[0.04] tabular-nums select-none">
                25
              </p>

              <div className="relative z-10">
                <div className="story-panel-line h-px bg-white/15 mb-8" />
                <p className="story-note text-[#8ABC37]/75 text-[10px] uppercase tracking-[0.4em] font-mono mb-6">
                  Field practice, not theory
                </p>
                <p className="story-note text-white text-[clamp(1.8rem,3vw,3rem)] font-black uppercase leading-[0.95] tracking-tight max-w-[12ch]">
                  Built around the realities of land, climate and maintenance.
                </p>
              </div>

              <div className="relative z-10 grid sm:grid-cols-3 gap-0 border border-white/10">
                {[
                  ["01", "Assess", "Read the site before drawing the solution."],
                  ["02", "Engineer", "Match horticulture with irrigation and structure."],
                  ["03", "Sustain", "Plan for performance after handover."],
                ].map(([num, title, desc]) => (
                  <div key={num} className="story-metric p-5 border-b sm:border-b-0 sm:border-r last:border-r-0 border-white/10">
                    <p className="text-[#8ABC37] text-[10px] tracking-[0.35em] uppercase font-mono mb-4">
                      {num}
                    </p>
                    <h3 className="text-white font-bold uppercase tracking-[0.12em] text-sm mb-3">
                      {title}
                    </h3>
                    <p className="text-stone-400 text-sm leading-relaxed">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
              <div className="relative z-10">
                <div className="story-panel-line h-px bg-white/15 mb-5" />
                <p className="story-note text-white/50 text-[9px] tracking-[0.35em] uppercase font-mono">Est. 1999 / Kerala, IN</p>
              </div>
            </div>
          </div>

        </div>
      </section>




      {/* ══════════════════════════════════════════════════════════════
          APPROACH
      ══════════════════════════════════════════════════════════════ */}
      <section className="approach-section bg-white">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">

          <div className="flex items-center gap-6 mb-16 border-t border-stone-300 pt-8">
            <span className="text-stone-400 text-[10px] tracking-[0.4em] uppercase font-mono">
              02 / Our approach
            </span>
            <div className="section-divider flex-1 h-px bg-stone-300 origin-left" />
          </div>

          <div className="flex items-start justify-between gap-8 mb-14 approach-heading">
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-black text-stone-900 uppercase tracking-tight leading-none max-w-[14ch]">
              Consultancy through<br />
              <span className="text-[#8ABC37]">to post-harvest.</span>
            </h2>
            <p className="text-stone-500 leading-relaxed max-w-sm text-right hidden lg:block">
              Haritha Agro Consultants works with a major objective of transferring
              agricultural production technology to farmers and grass-root innovators.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-stone-300">
            {APPROACH.map((item, i) => (
              <div
                key={item.num}
                className={[
                  "approach-card p-8 group hover:bg-stone-900 transition-all duration-300",
                  i < 3 ? "border-r border-stone-300" : "",
                ].join(" ")}
              >
                <span className="text-[clamp(3rem,5vw,5rem)] font-black text-stone-100 leading-none block mb-4 group-hover:text-green-900 transition-colors duration-300 tabular-nums">
                  {item.num}
                </span>
                <div className="w-8 h-px bg-green-600 mb-4 group-hover:bg-[#8ABC37] transition-colors" />
                <h3 className="font-bold text-stone-900 uppercase tracking-[0.08em] mb-3 group-hover:text-white transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-stone-500 leading-relaxed group-hover:text-stone-300 transition-colors">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════
          TECHNICAL PARTNERSHIPS
      ══════════════════════════════════════════════════════════════ */}
      <section className="partnerships-section bg-white py-28 md:py-36">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">

          <div className="flex items-center gap-6 mb-16 border-t border-stone-300 pt-8">
            <span className="text-stone-400 text-[10px] tracking-[0.4em] uppercase font-mono">
              03 / Technical partnerships
            </span>
            <div className="section-divider flex-1 h-px bg-stone-300 origin-left" />
          </div>

          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start partnerships-text">
            <div>
              <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-black text-stone-900 uppercase tracking-tight leading-none mb-8">
                Backed by<br />
                <span className="text-[#8ABC37]">leading suppliers.</span>
              </h2>
            </div>
            <div className="space-y-5">
              <p className="text-stone-600 leading-relaxed">
                We hold technical agreements with leading plant producers and manufacturers of
                poly house structures, fertigation systems, micro-irrigation products, hybrid
                seeds, new-generation fertilisers and plant-protection chemicals.
              </p>
              <p className="text-stone-500 leading-relaxed">
                These partnerships allow us to offer clients access to the best available
                inputs and technology — committed throughout to sustainable agricultural
                development.
              </p>
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-stone-200">
                {["Poly structures", "Fertigation", "Micro-irrigation", "Hybrid seeds", "Fertilisers", "Plant protection"].map((item, i) => (
                  <div key={i} className="py-4 border-b border-stone-100">
                    <p className="text-[9px] text-stone-400 uppercase tracking-[0.3em] font-mono leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════════════ */}
      <section className="about-cta-section relative min-h-[75vh] flex flex-col justify-center overflow-hidden bg-green-950">
        <div className="about-cta-map-bg absolute inset-[-20%] will-change-transform">
          <TopoMap />
        </div>
        <div className="absolute inset-0 bg-green-950/75" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 w-full py-32">
          <div className="max-w-2xl about-cta-overlay">
            <p className="text-[#8ABC37]/70 text-[10px] uppercase tracking-[0.4em] font-mono mb-6">
              05 / Work with us
            </p>
            <h2 className="text-[clamp(2.5rem,6vw,7rem)] font-black text-white uppercase leading-[0.92] tracking-tight mb-8">
              Want to work<br />
              <span className="text-[#8ABC37]">with us?</span>
            </h2>
            <p className="text-stone-300/80 text-lg leading-relaxed max-w-md mb-10">
              Tell us about your land, your goals, and your timeline.
              Site visits available across all 14 districts of Kerala.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#8ABC37] text-green-950 font-bold text-sm uppercase tracking-[0.15em] hover:bg-[#9bd146] transition-colors"
              >
                Contact Haritha <span className="text-base">→</span>
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 border border-white/25 text-white text-sm uppercase tracking-[0.15em] hover:border-[#8ABC37]/60 hover:text-[#8ABC37] transition-colors"
              >
                Our services
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
