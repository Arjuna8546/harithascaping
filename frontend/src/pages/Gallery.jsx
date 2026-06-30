// Gallery.jsx — Blog page with:
//   1. Running ticker strip (click to jump to slide)
//   2. Full-bleed carousel: image left / content right
//      • GSAP split-door wipe on image transition
//      • Text staggers in line-by-line after image lands
//      • Mouse-drag + touch-swipe support
//   3. Dark green CTA section with parallax topo map

import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BLOGS, HERO_GALLERY } from "../data";

gsap.registerPlugin(ScrollTrigger);

function HeroGallery({ images }) {
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);

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

  const getImage = (image) =>
    isDesktop ? image.desktop : image.mobile;

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
   Topographic SVG background — reused from Projects.jsx
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
      <text x="20" y="30" fill="rgba(138,188,55,0.4)" fontSize="9"
        fontFamily="monospace" letterSpacing="3">
        KERALA — INDIA / 8–13°N 74–78°E
      </text>
      <text x="20" y="780" fill="rgba(138,188,55,0.3)" fontSize="9"
        fontFamily="monospace" letterSpacing="2">
        HARITHA AGRO CONSULTANTS
      </text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   TICKER STRIP — continuous marquee, click jumps to slide
   Duplicates items so the loop is seamless.
───────────────────────────────────────────────────────────────────────── */
export function TickerStrip({ blogs, onSelect, activeIndex, trackRef }) {
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

/* ─────────────────────────────────────────────────────────────────────────
   BLOG CAROUSEL
───────────────────────────────────────────────────────────────────────── */
function BlogCarousel({ blogs, externalIndex, onIndexChange }) {
  const [current, setCurrent] = useState(externalIndex ?? 0);
  const [animating, setAnimating] = useState(false);

  const sectionRef = useRef(null);
  const imgWrapRef = useRef(null);   // the visible image "window"
  const clipperRef = useRef(null);   // the covering rect that wipes
  const imgRef = useRef(null);   // the <img> itself
  const textLineRefs = useRef([]);     // individual text lines to stagger

  const total = blogs.length;

  /* ── Sync when ticker changes the index externally ── */
  useEffect(() => {
    if (externalIndex !== null && externalIndex !== current) {
      goTo(externalIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalIndex]);

  /* ── Core transition ──
     Direction +1 = forward (right→left wipe), -1 = backward (left→right wipe) */
  const goTo = useCallback((nextIndex, dir = 1) => {
    if (animating || nextIndex === current) return;
    setAnimating(true);

    const currentHasImage = !!blogs[current]?.image;
    const nextHasImage = !!blogs[nextIndex]?.image;

    if (!currentHasImage || !nextHasImage) {
      setCurrent(nextIndex);
      onIndexChange?.(nextIndex);
      requestAnimationFrame(() => {
        gsap.fromTo(textLineRefs.current.filter(Boolean),
          { y: 22, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.6, ease: "expo.out", stagger: 0.06,
            clearProps: "transform,opacity", onComplete: () => setAnimating(false)
          }
        );
      });
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setCurrent(nextIndex);
        onIndexChange?.(nextIndex);
        setAnimating(false);
      },
    });

    /* 1. Wipe the green cover rect OVER the old image */
    tl.fromTo(clipperRef.current,
      { scaleX: 0, transformOrigin: dir > 0 ? "left center" : "right center" },
      { scaleX: 1, duration: 0.52, ease: "expo.inOut" }
    );

    /* 2. Swap image source mid-wipe (hidden behind the cover) */
    tl.call(() => {
      if (imgRef.current) {
        imgRef.current.src = blogs[nextIndex].image;
      }
    });

    /* 3. Wipe the cover rect OFF to reveal new image */
    tl.to(clipperRef.current, {
      scaleX: 0,
      transformOrigin: dir > 0 ? "right center" : "left center",
      duration: 0.52,
      ease: "expo.inOut",
    });

    /* 4. Stagger text lines in from below */
    tl.fromTo(textLineRefs.current.filter(Boolean),
      { y: 22, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.6, ease: "expo.out", stagger: 0.06,
        clearProps: "transform,opacity"
      },
      "-=0.35"  // overlap slightly with image reveal
    );
  }, [animating, current, blogs, onIndexChange]);

  /* ── Initial text entrance ── */
  useEffect(() => {
    gsap.fromTo(textLineRefs.current.filter(Boolean),
      { y: 22, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.75, ease: "expo.out", stagger: 0.07,
        clearProps: "transform,opacity", delay: 0.3
      }
    );
  }, []);

  /* ── Swipe / drag ── */
  const dragStartX = useRef(null);

  const handlePointerDown = (e) => {
    dragStartX.current = e.touches ? e.touches[0].clientX : e.clientX;
  };
  const handlePointerUp = (e) => {
    if (dragStartX.current === null) return;
    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const diff = dragStartX.current - endX;
    dragStartX.current = null;
    if (Math.abs(diff) < 40) return;   // dead-zone
    if (diff > 0) next();
    else prev();
  };

  const next = () => goTo((current + 1) % total, +1);
  const prev = () => goTo((current - 1 + total) % total, -1);

  const post = blogs[current];
  const hasImage = !!post.image;

  /* ── Parse content into paragraphs & bullets ── */
  const contentLines = post.content
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  /* ── Author visibility flag ── */
  const hasAuthor = !!(post.author?.name && post.author?.image);

  return (
    <div
      ref={sectionRef}
      className="relative bg-stone-50 overflow-hidden"
      style={{ minHeight: "min(90vh, 720px)" }}
    >
      {/* ── Split layout ── */}
      <div
        className="flex flex-col lg:flex-row"
        style={{ minHeight: "min(90vh, 720px)" }}
        onMouseDown={handlePointerDown}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchEnd={handlePointerUp}
      >

        {/* ════ LEFT — Image (50% on desktop) ════ */}
        {hasImage && (
          <div
            ref={imgWrapRef}
            className="relative w-full lg:w-[50%] overflow-hidden bg-green-900"
            style={{ minHeight: "340px" }}
          >
            <img
              ref={imgRef}
              src={post.image}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.target.parentElement.style.background = "#1a3d26";
                e.target.style.display = "none";
              }}
            />

            {/* Dark scrim */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/10 pointer-events-none" />

            {/* Green wipe cover — slides over image during transition */}
            {/* <div
            ref={clipperRef}
            className="absolute inset-0 bg-[#8ABC37] z-20"
            style={{ transformOrigin: "left center", scaleX: 0 }}
          /> */}

            {/* Ghost index — bottom left */}
            <p className="absolute bottom-6 left-6 text-white/10 text-[clamp(5rem,12vw,9rem)] font-black leading-none tabular-nums select-none pointer-events-none">
              {String(current + 1).padStart(2, "0")}
            </p>

            {/* Author chip — bottom overlay (image panel) */}
            {hasAuthor && (
              <div className="absolute bottom-6 right-6 flex items-center gap-3 bg-black/40 backdrop-blur-sm px-3 py-2 border border-white/10">
                <img
                  src={post.author.image}
                  alt={post.author.name}
                  className="w-7 h-7 rounded-full object-cover bg-green-800"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                <div>
                  <p className="text-white/50 text-[8px] uppercase tracking-[0.3em] font-mono leading-none mb-0.5">
                    {post.author.role}
                  </p>
                  <p className="text-white/85 text-[10px] uppercase tracking-[0.2em] font-mono leading-none">
                    {post.author.name}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════ RIGHT — Content (50% on desktop) ════ */}
        <div className={[
          "relative w-full bg-white flex flex-col justify-center px-8 md:px-12 py-12 lg:py-16",
          hasImage ? "lg:w-[50%] border-l border-stone-200" : "lg:w-full",
        ].join(" ")}>

          {/* ── Top meta row ── */}
          <div
            ref={(el) => (textLineRefs.current[0] = el)}
            className="flex items-center gap-4 mb-4"
          >
            <span className="text-[8px] uppercase tracking-[0.4em] font-mono text-[#8ABC37]">
              Journal
            </span>
            <div className="flex-1 h-px bg-stone-100" />
            <span className="text-[8px] uppercase tracking-[0.3em] font-mono text-stone-300">
              {post.date}
            </span>
          </div>

          {/* ── Author row (right panel) — only when name + image exist ── */}
          {hasAuthor && (
            <div
              ref={(el) => (textLineRefs.current[5] = el)}
              className="flex items-center gap-3 mb-8"
            >
              <img
                src={post.author.image}
                alt={post.author.name}
                className="w-8 h-8 rounded-full object-cover bg-green-100"
                onError={(e) => { e.target.style.display = "none"; }}
              />
              <div>
                <p className="text-[8px] uppercase tracking-[0.35em] font-mono text-stone-300 leading-none mb-1">
                  {post.author.role}
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-stone-500 leading-none">
                  {post.author.name}
                </p>
              </div>
            </div>
          )}

          {/* ── Title ── */}
          <h2
            ref={(el) => (textLineRefs.current[1] = el)}
            className="text-stone-900 text-[clamp(1.5rem,3vw,2.6rem)] font-black uppercase tracking-tight leading-[1.1] mb-6"
          >
            {post.title}
          </h2>

          {/* ── Reading line under title ── */}
          <div
            ref={(el) => (textLineRefs.current[2] = el)}
            className="h-[3px] bg-[#8ABC37] w-12 mb-8"
          />

          {/* ── Body content ── */}
          <div
            ref={(el) => (textLineRefs.current[3] = el)}
            className="flex flex-col gap-3 mb-10"
          >
            {contentLines.map((line, i) => {
              if (line.startsWith("•")) {
                return (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="text-[#8ABC37] text-sm shrink-0 mt-[3px] font-bold">—</span>
                    <p className="text-stone-500 text-[14px] leading-[1.7] font-[Georgia,'Times_New_Roman',serif] italic">
                      {line.replace(/^•\s*/, "")}
                    </p>
                  </div>
                );
              }
              if (line.endsWith(":") && line.length < 30) {
                return (
                  <p key={i} className="text-[8px] uppercase tracking-[0.35em] font-mono text-stone-400 mt-2">
                    {line.replace(/:$/, "")}
                  </p>
                );
              }
              return (
                <p key={i} className="text-stone-600 text-[14px] leading-[1.75] font-[Georgia,'Times_New_Roman',serif]">
                  {line}
                </p>
              );
            })}
          </div>

          {/* ── Slide counter + nav ── */}
          <div
            ref={(el) => (textLineRefs.current[4] = el)}
            className="flex items-center justify-between mt-auto"
          >
            {/* Dot indicators */}
            <div className="flex items-center gap-2">
              {blogs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, i > current ? 1 : -1)}
                  className={[
                    "transition-all duration-300",
                    i === current
                      ? "w-6 h-1.5 bg-[#8ABC37]"
                      : "w-1.5 h-1.5 bg-stone-200 hover:bg-stone-400",
                  ].join(" ")}
                  aria-label={`Go to article ${i + 1}`}
                />
              ))}
            </div>

            {/* Prev / Next arrows */}
            <div className="flex items-center gap-3">
              <span className="text-[9px] uppercase tracking-[0.3em] font-mono text-stone-300 mr-2">
                {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
              <button
                onClick={prev}
                disabled={animating}
                className="w-10 h-10 border border-stone-200 hover:border-stone-400
                           flex items-center justify-center
                           text-stone-400 hover:text-stone-700
                           transition-all duration-200 disabled:opacity-40"
                aria-label="Previous article"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.4"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={next}
                disabled={animating}
                className="w-10 h-10 border border-stone-900 bg-stone-900 hover:bg-[#8ABC37] hover:border-[#8ABC37]
                           flex items-center justify-center
                           text-white
                           transition-all duration-200 disabled:opacity-40"
                aria-label="Next article"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ── Keyboard hint — bottom center ── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none hidden lg:flex items-center gap-2">
        <span className="text-stone-300 text-[8px] uppercase tracking-[0.3em] font-mono">
          Drag to browse
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   GALLERY PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function Gallery() {
  const rootRef = useRef(null);
  const barRef = useRef(null);
  const tickerRef = useRef(null);
  const carouselRef = useRef(null);

  // Index driven by both ticker click and carousel swipe
  const [activeIndex, setActiveIndex] = useState(0);
  const [tickerTarget, setTickerTarget] = useState(null);

  const heroTitle = "Writing from the field.";
  const heroWords = heroTitle.split(" ");

  /* ── Ticker click: update index + smooth scroll to carousel ── */
  const handleTickerSelect = (i) => {
    setTickerTarget(i);
    setActiveIndex(i);
    carouselRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  /* ── Carousel reports back its current index ── */
  const handleCarouselChange = (i) => {
    setActiveIndex(i);
    setTickerTarget(null); // consumed
  };

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

  /* ── Page-level GSAP ── */
  useEffect(() => {
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    const ctx = gsap.context(() => {

      /* Hero word entrance */
      gsap.fromTo(".gallery-hero-word",
        { yPercent: 120, opacity: 0 },
        {
          yPercent: 0, opacity: 1, duration: 1.1, ease: "expo.out",
          stagger: 0.07, delay: 0.2, clearProps: "transform,opacity"
        }
      );
      gsap.from(".gallery-hero-eyebrow", {
        y: 16, opacity: 0, duration: 0.8, ease: "expo.out", delay: 0.15,
        clearProps: "transform,opacity",
      });
      gsap.from(".gallery-hero-sub", {
        y: 28, opacity: 0, duration: 1, ease: "expo.out", delay: 0.95,
        clearProps: "transform,opacity",
      });

      /* Hero parallax */
      gsap.to(".gallery-hero-bg", {
        scale: 1.06, ease: "none",
        scrollTrigger: {
          trigger: ".gallery-hero-section",
          start: "top top", end: "bottom top", scrub: 1
        },
      });
      gsap.to(".gallery-hero-content", {
        scale: 0.9, opacity: 0, yPercent: -8, ease: "none",
        scrollTrigger: {
          trigger: ".gallery-hero-section",
          start: "top top", end: "60% top", scrub: 1
        },
      });

      /* CTA section */
      gsap.to(".gallery-cta-map-bg", {
        yPercent: -20, ease: "none",
        scrollTrigger: {
          trigger: ".gallery-cta-section",
          start: "top bottom", end: "bottom top", scrub: 1
        },
      });
      gsap.from(".gallery-cta-overlay > *", {
        y: 50, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.12,
        clearProps: "transform,opacity",
        scrollTrigger: {
          trigger: ".gallery-cta-section",
          start: "top 72%", once: true
        },
      });

      /* Section dividers */
      gsap.utils.toArray(".section-divider").forEach((el) => {
        gsap.from(el, {
          scaleX: 0, transformOrigin: "left center", duration: 1.2,
          ease: "expo.out", clearProps: "transform",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });

    }, rootRef);

    /* Scroll progress bar */
    const onScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      if (barRef.current)
        barRef.current.style.width = (docH > 0 ? (window.scrollY / docH) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      ctx.revert();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={rootRef} className="font-sans bg-stone-50">

      {/* Scroll-progress bar */}
      {/* <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-transparent pointer-events-none">
        <div ref={barRef} className="h-full bg-[#8ABC37]" style={{ width: "0%" }} />
      </div> */}

      {/* ══════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <section className="gallery-hero-section relative min-h-screen flex flex-col justify-end overflow-hidden bg-green-950">

        <div className="gallery-hero-bg absolute inset-0 will-change-transform">
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
            {[
              "M0,500 C200,420 400,550 600,470 S900,380 1200,460",
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
        {/* <div className="absolute top-8 right-8 z-10 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border border-[#8ABC37]/40 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-[#8ABC37]/60" />
          </div>
          <span className="text-[#8ABC37]/50 text-[10px] tracking-[0.3em] uppercase font-mono">Scroll</span>
        </div> */}

        {/* Article count badge */}
        {/* <div className="absolute top-8 left-6 md:left-12 lg:left-20 z-10">
          <div className="border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-2 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#8ABC37]" />
            <span className="text-white/50 text-[9px] tracking-[0.35em] uppercase font-mono">
              {BLOGS.length} articles
            </span>
          </div>
        </div> */}

        {/* Hero content */}
        <div className="gallery-hero-content relative z-10 px-6 md:px-12 lg:px-20 pb-20 pt-40">
          <div className="overflow-hidden mb-3 gallery-hero-eyebrow">
            <p className="text-[#8ABC37]/70 text-xs tracking-[0.4em] uppercase font-mono">
              — Journal &amp; Insights
            </p>
          </div>
          <h1 className="text-[clamp(2rem,6vw,6rem)] font-black text-white leading-[0.93] tracking-tight uppercase max-w-[18ch]">
            {heroWords.map((word, i) => (
              <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.25em]">
                <span className="gallery-hero-word inline-block will-change-transform">
                  {word}
                </span>
              </span>
            ))}
          </h1>
          <p className="gallery-hero-sub text-stone-300/80 text-lg leading-relaxed max-w-xl mt-8">
            Perspectives on landscape design, sustainable farming and horticultural
            practice from Haritha's consultants and field teams across Kerala.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10 z-10" />
      </section>


      {/* ══════════════════════════════════════════════════════════════
          TICKER STRIP
      ══════════════════════════════════════════════════════════════ */}
      <TickerStrip
        blogs={BLOGS}
        onSelect={handleTickerSelect}
        activeIndex={activeIndex}
        trackRef={tickerRef}
      />


      {/* ══════════════════════════════════════════════════════════════
          SECTION LABEL ROW
      ══════════════════════════════════════════════════════════════ */}
      <div ref={carouselRef} className="bg-stone-50">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex items-center gap-6 py-8 border-b border-stone-200">
            <span className="text-stone-400 text-[10px] tracking-[0.4em] uppercase font-mono shrink-0">
              01 / Field notes
            </span>
            <div className="section-divider flex-1 h-px bg-stone-200 origin-left" />
            <span className="text-stone-300 text-[9px] tracking-[0.3em] uppercase font-mono shrink-0">
              {BLOGS.length} articles
            </span>
          </div>
        </div>
      </div>


      {/* ══════════════════════════════════════════════════════════════
          CAROUSEL
      ══════════════════════════════════════════════════════════════ */}
      <BlogCarousel
        blogs={BLOGS}
        externalIndex={tickerTarget}
        onIndexChange={handleCarouselChange}
      />


      {/* ══════════════════════════════════════════════════════════════
          CTA — identical to Projects.jsx
      ══════════════════════════════════════════════════════════════ */}
      <section className="gallery-cta-section relative min-h-[75vh] flex flex-col justify-center overflow-hidden bg-green-950">
        <div className="gallery-cta-map-bg absolute inset-[-20%] will-change-transform">
          <TopoMap />
        </div>
        <div className="absolute inset-0 bg-green-950/75" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 w-full py-32">
          <div className="max-w-2xl gallery-cta-overlay">
            <p className="text-[#8ABC37]/70 text-[10px] uppercase tracking-[0.4em] font-mono mb-6">
              02 / Get in touch
            </p>
            <h2 className="text-[clamp(2.5rem,6vw,7rem)] font-black text-white uppercase leading-[0.92] tracking-tight mb-8">
              Have a plot,<br />
              a problem,<br />
              <span className="text-[#8ABC37]">or a plan?</span>
            </h2>
            <p className="text-stone-300/80 text-lg leading-relaxed max-w-md mb-10">
              We take on residential, commercial and institutional sites of any
              size across all 14 districts of Kerala. Site visits within 48 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#8ABC37] text-green-950 font-bold text-sm uppercase tracking-[0.15em] hover:bg-[#9bd146] transition-colors"
              >
                Discuss your project <span className="text-base">→</span>
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 border border-white/25 text-white text-sm uppercase tracking-[0.15em] hover:border-[#8ABC37]/60 hover:text-[#8ABC37] transition-colors"
              >
                About Haritha
              </Link>
            </div>
            {/* <div className="mt-14 pt-10 border-t border-white/10 grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-stone-400 text-[10px] uppercase tracking-[0.3em] font-mono mb-2">Phone</p>
                <a href="tel:+919400000000" className="text-white text-xl font-bold hover:text-[#8ABC37] transition-colors">
                  +91 94000 00000
                </a>
              </div>
              <div>
                <p className="text-stone-400 text-[10px] uppercase tracking-[0.3em] font-mono mb-2">Email</p>
                <a href="mailto:info@haritha.in" className="text-white text-xl font-semibold hover:text-[#8ABC37] transition-colors">
                  info@haritha.in
                </a>
              </div>
            </div> */}
          </div>
        </div>
      </section>

    </div>
  );
}
