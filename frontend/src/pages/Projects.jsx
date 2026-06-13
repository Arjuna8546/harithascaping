// Projects.jsx — styled to match About.jsx with GSAP ScrollTrigger animations

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PROJECTS, HERO_GALLERY } from "../data";

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
   Topographic SVG background — reused from About / Home
───────────────────────────────────────────────────────────────────────── */
function TopoMap() {
  return (
    <svg
      viewBox="0 0 1200 800"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
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
        <path
          key={i}
          d={d}
          fill="none"
          stroke="rgba(138,188,55,0.18)"
          strokeWidth={i % 3 === 0 ? "1.5" : "0.8"}
        />
      ))}
      <text
        x="20"
        y="30"
        fill="rgba(138,188,55,0.4)"
        fontSize="9"
        fontFamily="monospace"
        letterSpacing="3"
      >
        KERALA — INDIA / 8–13°N 74–78°E
      </text>
      <text
        x="20"
        y="780"
        fill="rgba(138,188,55,0.3)"
        fontSize="9"
        fontFamily="monospace"
        letterSpacing="2"
      >
        HARITHA AGRO CONSULTANTS
      </text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   STATS — headline numbers for the page banner strip
───────────────────────────────────────────────────────────────────────── */
const STATS = [
  { value: PROJECTS.length, suffix: "+", label: "Projects delivered" },
  { value: 14, suffix: "", label: "Districts covered" },
  { value: 25, suffix: "yrs", label: "Combined experience" },
  { value: 100, suffix: "%", label: "Turnkey execution" },
];

/* ─────────────────────────────────────────────────────────────────────────
   FILTER LABELS — derived from project types
───────────────────────────────────────────────────────────────────────── */
const FILTER_LABELS = [
  "All",
  ...Array.from(new Set(PROJECTS.map((p) => p.type.split("&")[0].trim()))),
];

/* ═══════════════════════════════════════════════════════════════════════════
   PROJECTS PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function Projects() {
  const rootRef = useRef(null);
  const gridRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered =
    activeFilter === "All"
      ? PROJECTS
      : PROJECTS.filter((p) => p.type.includes(activeFilter));

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

  /* ── Main GSAP setup ── */
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
    const ctx = gsap.context(() => {

      /* ── Hero entrance — word by word ── */
      gsap.fromTo(
        ".projects-hero-word",
        { yPercent: 120, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.06,
          delay: 0.2,
          clearProps: "transform,opacity",
        }
      );
      gsap.from(".projects-hero-sub", {
        y: 28,
        opacity: 0,
        duration: 1,
        ease: "expo.out",
        delay: 0.95,
        clearProps: "transform,opacity",
      });
      gsap.from(".projects-hero-eyebrow", {
        y: 16,
        opacity: 0,
        duration: 0.8,
        ease: "expo.out",
        delay: 0.15,
        clearProps: "transform,opacity",
      });
      gsap.from(".projects-hero-meta", {
        y: 20,
        opacity: 0,
        duration: 0.9,
        ease: "expo.out",
        delay: 1.2,
        stagger: 0.08,
        clearProps: "transform,opacity",
      });

      /* ── Hero parallax ── */
      gsap.to(".projects-hero-bg", {
        scale: 1.06,
        ease: "none",
        scrollTrigger: {
          trigger: ".projects-hero-section",
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
      gsap.to(".projects-hero-content", {
        scale: 0.9,
        opacity: 0,
        yPercent: -8,
        ease: "none",
        scrollTrigger: {
          trigger: ".projects-hero-section",
          start: "top top",
          end: "60% top",
          scrub: 1,
        },
      });

      /* ── Stats strip ── */
      gsap.from(".stat-item", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.1,
        clearProps: "transform,opacity",
        scrollTrigger: {
          trigger: ".stats-section",
          start: "top 78%",
          once: true,
        },
      });

      /* ── Grid section heading + filter ── */
      gsap.from(".projects-heading > *", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "expo.out",
        stagger: 0.1,
        clearProps: "transform,opacity",
        scrollTrigger: {
          trigger: ".projects-grid-section",
          start: "top 80%",
          once: true,
        },
      });

      /* ── First-load project cards ── */
      gsap.from(".project-card", {
        y: 80,
        opacity: 0,
        duration: 1,
        ease: "expo.out",
        stagger: 0.1,
        clearProps: "transform,opacity",
        scrollTrigger: {
          trigger: ".projects-grid",
          start: "top 82%",
          once: true,
        },
      });

      /* ── Section divider lines ── */
      gsap.utils.toArray(".section-divider").forEach((el) => {
        gsap.from(el, {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1.2,
          ease: "expo.out",
          clearProps: "transform",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });

      /* ── CTA parallax ── */
      gsap.to(".projects-cta-map-bg", {
        yPercent: -20,
        ease: "none",
        scrollTrigger: {
          trigger: ".projects-cta-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
      gsap.from(".projects-cta-overlay > *", {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "expo.out",
        stagger: 0.12,
        clearProps: "transform,opacity",
        scrollTrigger: {
          trigger: ".projects-cta-section",
          start: "top 72%",
          once: true,
        },
      });
    }, rootRef);

    return () => {
      ctx.revert();
      cancelAnimationFrame(raf);
    };
  }, []);

  /* ── Re-animate cards when filter changes ── */
  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll(".project-card");
    gsap.fromTo(
      cards,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.65,
        ease: "expo.out",
        stagger: 0.08,
        clearProps: "transform,opacity",
      }
    );
  }, [activeFilter]);

  const heroTitle = "Work rooted in Kerala's ground.";
  const heroWords = heroTitle.split(" ");

  return (
    <div ref={rootRef} className="font-sans bg-stone-50">

      {/* ══════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <section className="projects-hero-section relative min-h-screen flex flex-col justify-end overflow-hidden bg-green-950">

        {/* Background — grid + topo curves */}
        <div className="projects-hero-bg absolute inset-0 will-change-transform">
          <HeroGallery images={HERO_GALLERY} />

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(5,30,15,0.55) 0%, rgba(5,30,15,0.35) 50%, rgba(5,30,15,0.72) 100%)",
            }}
          />

          {/* Grid overlay */}
          <svg
            className="absolute inset-0 w-full h-full opacity-20"
            aria-hidden="true"
            viewBox="0 0 1200 900"
            preserveAspectRatio="xMidYMid slice"
          >
            {Array.from({ length: 16 }).map((_, i) => (
              <line
                key={`g${i}`}
                x1="0"
                y1={i * 60}
                x2="1200"
                y2={i * 60}
                stroke="rgba(138,188,55,0.25)"
                strokeWidth="0.5"
              />
            ))}
            {Array.from({ length: 20 }).map((_, i) => (
              <line
                key={`v${i}`}
                x1={i * 63}
                y1="0"
                x2={i * 63}
                y2="900"
                stroke="rgba(138,188,55,0.25)"
                strokeWidth="0.5"
              />
            ))}
            {[
              "M0,500 C200,420 400,550 600,470 S900,380 1200,460",
              "M0,540 C180,450 380,580 580,500 S880,410 1200,500",
              "M0,460 C220,380 420,520 620,440 S920,350 1200,420",
            ].map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke="rgba(138,188,55,0.35)"
                strokeWidth={i === 1 ? "1.2" : "0.7"}
              />
            ))}
          </svg>

          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-[#8ABC37]/8 blur-[120px] pointer-events-none" />
        </div>

        {/* Scroll indicator */}
        <div className="absolute top-8 right-8 z-10 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border border-[#8ABC37]/40 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-[#8ABC37]/60" />
          </div>
          <span className="text-[#8ABC37]/50 text-[10px] tracking-[0.3em] uppercase font-mono">
            Scroll
          </span>
        </div>

        {/* Project count badge — top left */}
        {/* <div className="absolute top-8 left-6 md:left-12 lg:left-20 z-10">
          <div className="border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-2 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#8ABC37]" />
            <span className="text-white/50 text-[9px] tracking-[0.35em] uppercase font-mono">
              {PROJECTS.length} selected projects
            </span>
          </div>
        </div> */}

        {/* Hero content */}
        <div className="projects-hero-content relative z-10 px-6 md:px-12 lg:px-20 pb-20 pt-40">
          <div className="overflow-hidden mb-3 projects-hero-eyebrow">
            <p className="text-[#8ABC37]/70 text-xs tracking-[0.4em] uppercase font-mono">
              — Projects
            </p>
          </div>

          <h1 className="text-[clamp(2rem,6vw,6rem)] font-black text-white leading-[0.93] tracking-tight uppercase max-w-[18ch]">
            {heroWords.map((word, i) => (
              <span
                key={i}
                className="inline-block overflow-hidden align-bottom mr-[0.25em]"
              >
                <span className="projects-hero-word inline-block will-change-transform">
                  {word}
                </span>
              </span>
            ))}
          </h1>

          <p className="projects-hero-sub text-stone-300/80 text-lg leading-relaxed max-w-xl mt-8">
            A selection of landscaping, hi-tech farming and turfing projects
            delivered for residential, hospitality and institutional clients
            across all 14 districts of Kerala.
          </p>

          {/* Inline meta row */}
          {/* <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
            {["Landscape Design", "Hi-Tech Farming", "Sports Turfing", "Residential · Hospitality · Institutional"].map(
              (tag, i) => (
                <p
                  key={i}
                  className="projects-hero-meta text-[10px] text-stone-400 uppercase tracking-[0.3em] font-mono flex items-center gap-2"
                >
                  {i < 3 && (
                    <span className="w-1 h-1 rounded-full bg-[#8ABC37]/60 shrink-0" />
                  )}
                  {tag}
                </p>
              )
            )}
          </div> */}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10 z-10" />
      </section>


      {/* ══════════════════════════════════════════════════════════════
          STATS STRIP
      ══════════════════════════════════════════════════════════════ */}
      {/* <section className="stats-section bg-white border-b border-stone-200 py-0">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-stone-200">
            {STATS.map((s, i) => (
              <div
                key={i}
                className="stat-item py-10 px-6 md:px-10 flex flex-col gap-2 group"
              >
                <p className="text-[clamp(2.2rem,5vw,4rem)] font-black text-stone-900 leading-none tabular-nums tracking-tight">
                  {s.value}
                  <span className="text-[#8ABC37]">{s.suffix}</span>
                </p>
                <p className="text-[10px] text-stone-400 uppercase tracking-[0.35em] font-mono">
                  {s.label}
                </p>
                <div className="w-6 h-px bg-stone-200 group-hover:bg-[#8ABC37] transition-colors duration-300 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </section> */}


      {/* ══════════════════════════════════════════════════════════════
          PROJECTS GRID
      ══════════════════════════════════════════════════════════════ */}
      <section className="projects-grid-section bg-stone-50 pb-28 md:pb-38">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">

          {/* Section header */}
          <div className="flex items-center gap-6 mb-16 border-t border-stone-300 pt-8">
            <span className="text-stone-400 text-[10px] tracking-[0.4em] uppercase font-mono shrink-0">
              01 / Selected work
            </span>
            <div className="section-divider flex-1 h-px bg-stone-300 origin-left" />
          </div>

          {/* Heading + filter row */}
          <div className="projects-heading flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-14">
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-black text-stone-900 uppercase tracking-tight leading-none max-w-[14ch]">
              {PROJECTS.length} projects.<br />
              <span className="text-[#8ABC37]">One firm.</span>
            </h2>

            {/* Filter chips */}
            {/* <div className="flex flex-wrap gap-2">
              {FILTER_LABELS.map((label) => (
                <button
                  key={label}
                  onClick={() => setActiveFilter(label)}
                  className={[
                    "px-5 py-2.5 text-[10px] uppercase tracking-[0.3em] font-mono border transition-all duration-300",
                    activeFilter === label
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-transparent text-stone-400 border-stone-300 hover:border-stone-500 hover:text-stone-700",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div> */}
          </div>

          {/* ── Grid — gap-based so card lift works cleanly ── */}
          <div
            ref={gridRef}
            className="projects-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {filtered.map((p, i) => (
              <article
                key={p.client}
                className="project-card group relative flex flex-col bg-white border border-stone-200
                           transition-all duration-500 ease-out
                           hover:-translate-y-2 hover:shadow-[0_28px_64px_rgba(0,0,0,0.10),0_4px_16px_rgba(0,0,0,0.06)]"
              >
                {/* ── Left accent border — scales down from top on hover ── */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#8ABC37] z-10
                             scale-y-0 group-hover:scale-y-100
                             transition-transform duration-500 ease-out origin-top"
                />

                {/* ── Image ── */}
                <div className="aspect-[16/9] overflow-hidden bg-green-900 relative shrink-0">
                  <img
                    src={p.img}
                    alt={p.client}
                    className="absolute inset-0 w-full h-full object-cover
                               group-hover:scale-105 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      e.target.parentElement.style.background = `hsl(${140 + i * 18}, 30%, ${22 + i * 4}%)`;
                      e.target.style.display = "none";
                    }}
                  />

                  {/* Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                  {/* Ghost index — top left */}
                  <p className="absolute top-3 left-4 text-white/12 text-[clamp(2rem,5vw,3.5rem)] font-black leading-none tabular-nums select-none">
                    {String(i + 1).padStart(2, "0")}
                  </p>

                  {/* Year badge — top right */}
                  {p.year && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 border border-white/20 bg-black/25 backdrop-blur-sm">
                      <span className="text-white/75 text-[9px] uppercase tracking-[0.3em] font-mono">
                        {p.year}
                      </span>
                    </div>
                  )}

                  {/* Green line — expands left→right on hover */}
                  <div
                    className="absolute bottom-0 left-0 h-[2px] bg-[#8ABC37]
                               w-0 group-hover:w-full
                               transition-all duration-500 ease-out delay-75"
                  />
                </div>

                {/* ── Card body ── */}
                <div className="p-6 md:p-8 flex flex-col gap-5 flex-1">

                  {/* Type tag */}
                  <p className="text-[9px] uppercase tracking-[0.4em] font-mono text-[#8ABC37]/60 group-hover:text-[#8ABC37] transition-colors duration-300">
                    {p.type}
                  </p>

                  {/* Client + location */}
                  <div>
                    <h3 className="text-stone-900 text-xl font-black uppercase tracking-tight leading-tight mb-1.5">
                      {p.client}
                    </h3>
                    {p.location && (
                      <div className="flex items-center gap-2">
                        <svg width="9" height="11" viewBox="0 0 9 11" fill="none" className="shrink-0 text-stone-400">
                          <path d="M4.5 0C2.015 0 0 2.015 0 4.5c0 3.375 4.5 6.5 4.5 6.5S9 7.875 9 4.5C9 2.015 6.985 0 4.5 0Zm0 6.125a1.625 1.625 0 1 1 0-3.25 1.625 1.625 0 0 1 0 3.25Z" fill="currentColor" />
                        </svg>
                        <p className="text-stone-400 text-[10px] uppercase tracking-[0.3em] font-mono">
                          {p.location}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-stone-100 group-hover:bg-stone-200 transition-colors duration-300" />

                  {/* Full description — no clamp */}
                  {p.desc && (
                    <p className="text-stone-500 text-sm leading-relaxed">
                      {p.desc}
                    </p>
                  )}

                  {/* Meta row — duration + year */}
                  <div className="flex items-stretch gap-0 border border-stone-100 group-hover:border-stone-200 transition-colors duration-300 mt-auto">
                    {p.duration && (
                      <div className="flex-1 px-4 py-3 border-r border-stone-100 group-hover:border-stone-200 transition-colors duration-300">
                        <p className="text-[8px] text-stone-300 uppercase tracking-[0.3em] font-mono mb-0.5">Duration</p>
                        <p className="text-[11px] text-stone-700 font-bold uppercase tracking-[0.15em] font-mono">{p.duration}</p>
                      </div>
                    )}
                    {p.year && (
                      <div className="flex-1 px-4 py-3">
                        <p className="text-[8px] text-stone-300 uppercase tracking-[0.3em] font-mono mb-0.5">Year</p>
                        <p className="text-[11px] text-stone-700 font-bold uppercase tracking-[0.15em] font-mono">{p.year}</p>
                      </div>
                    )}
                  </div>

                  {/* CTA row */}
                  <div className="flex items-center justify-between pt-2 ">
                    {/* Expanding green dash */}
                    {/* <div className="h-px bg-[#8ABC37] w-6 group-hover:w-14 transition-all duration-400 ease-out" />
                    <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-stone-400 group-hover:text-green-700 transition-colors duration-300 flex items-center gap-2">
                      View project
                      <svg
                        width="12" height="12" viewBox="0 0 14 14" fill="none"
                        className="transition-transform duration-300 group-hover:translate-x-1.5"
                      >
                        <path
                          d="M3 7h8M7 3l4 4-4 4"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span> */}
                  </div>
                </div>
              </article>
            ))}

            {/* Empty state */}
            {filtered.length === 0 && (
              <div className="col-span-full border border-stone-200 py-24 flex flex-col items-center justify-center gap-4 bg-white">
                <div className="w-12 h-px bg-stone-300" />
                <p className="text-stone-400 text-[10px] uppercase tracking-[0.4em] font-mono">
                  No projects in this category yet
                </p>
              </div>
            )}
          </div>

        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════
          PROCESS STRIP — three phases, horizontal
      ══════════════════════════════════════════════════════════════ */}
      {/* <section className="process-section bg-white py-28 md:py-36">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">

          <div className="flex items-center gap-6 mb-16 border-t border-stone-300 pt-8">
            <span className="text-stone-400 text-[10px] tracking-[0.4em] uppercase font-mono shrink-0">
              02 / How we deliver
            </span>
            <div className="section-divider flex-1 h-px bg-stone-300 origin-left" />
          </div>

          <div className="flex items-start justify-between gap-8 mb-14">
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-black text-stone-900 uppercase tracking-tight leading-none max-w-[14ch]">
              Every project,<br />
              <span className="text-[#8ABC37]">turnkey.</span>
            </h2>
            <p className="text-stone-500 leading-relaxed max-w-sm text-right hidden lg:block">
              From initial site assessment through to post-installation
              maintenance, we handle every phase in-house.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-0 border border-stone-300">
            {[
              {
                num: "01",
                title: "Site & Design",
                desc: "Soil assessment, site visit within 48 hours, and a detailed plan drawn up by our in-house horticulturists and engineers.",
              },
              {
                num: "02",
                title: "Execution",
                desc: "Full turnkey delivery — structures, planting, irrigation, turfing and finishing, all handled by our own team.",
              },
              {
                num: "03",
                title: "Maintenance",
                desc: "Scheduled post-installation support so the landscape or farm continues to perform season after season.",
              },
            ].map((item, i) => (
              <div
                key={item.num}
                className={[
                  "process-card p-8 group hover:bg-stone-900 transition-all duration-300",
                  i < 2 ? "border-r border-stone-300" : "",
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
      </section> */}


      {/* ══════════════════════════════════════════════════════════════
          CTA — dark green, parallax topo
      ══════════════════════════════════════════════════════════════ */}
      <section className="projects-cta-section relative min-h-[75vh] flex flex-col justify-center overflow-hidden bg-green-950">

        <div className="projects-cta-map-bg absolute inset-[-20%] will-change-transform">
          <TopoMap />
        </div>
        <div className="absolute inset-0 bg-green-950/75" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 w-full py-32">
          <div className="max-w-2xl projects-cta-overlay">
            <p className="text-[#8ABC37]/70 text-[10px] uppercase tracking-[0.4em] font-mono mb-6">
              03 / Get in touch
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

            {/* Quick contact row */}
            {/* <div className="mt-14 pt-10 border-t border-white/10 grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-stone-400 text-[10px] uppercase tracking-[0.3em] font-mono mb-2">Phone</p>
                <a
                  href="tel:+919400000000"
                  className="text-white text-xl font-bold hover:text-[#8ABC37] transition-colors"
                >
                  +91 94000 00000
                </a>
              </div>
              <div>
                <p className="text-stone-400 text-[10px] uppercase tracking-[0.3em] font-mono mb-2">Email</p>
                <a
                  href="mailto:info@haritha.in"
                  className="text-white text-xl font-semibold hover:text-[#8ABC37] transition-colors"
                >
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
