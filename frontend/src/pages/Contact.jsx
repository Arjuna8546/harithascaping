import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import { HERO_GALLERY } from "../data";

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

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const rootRef = useRef(null);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("https://formbold.com/s/oaYGK", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Submission failed. Please try again.");
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const heroWords = "Tell us about your site.".split(" ");

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

      /* ── Hero word entrance — identical to Services ── */
      gsap.fromTo(".contact-hero-word",
        { yPercent: 120, opacity: 0 },
        {
          yPercent: 0, opacity: 1,
          duration: 1.1, ease: "expo.out",
          stagger: 0.055, delay: 0.2,
          clearProps: "transform,opacity",
        }
      );
      gsap.from(".contact-hero-sub", {
        y: 28, opacity: 0, duration: 1, ease: "expo.out", delay: 0.95,
        clearProps: "transform,opacity",
      });
      gsap.from(".contact-hero-eyebrow", {
        y: 16, opacity: 0, duration: 0.8, ease: "expo.out", delay: 0.15,
        clearProps: "transform,opacity",
      });

      /* ── Hero parallax scroll-out — identical to Services ── */
      gsap.to(".contact-hero-bg", {
        scale: 1.06, ease: "none",
        scrollTrigger: {
          trigger: ".contact-hero-section",
          start: "top top", end: "bottom top", scrub: 1,
        },
      });
      gsap.to(".contact-hero-content", {
        scale: 0.9, opacity: 0, yPercent: -8, ease: "none",
        scrollTrigger: {
          trigger: ".contact-hero-section",
          start: "top top", end: "60% top", scrub: 1,
        },
      });

      /* ── Info blocks stagger in ── */
      gsap.from(".contact-info-block", {
        y: 40, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.12,
        clearProps: "transform,opacity",
        scrollTrigger: {
          trigger: ".contact-info-col", start: "top 82%", once: true,
        },
      });

      /* ── Form panel slides up ── */
      gsap.from(".contact-form-panel", {
        y: 60, opacity: 0, duration: 1.1, ease: "expo.out",
        clearProps: "transform,opacity",
        scrollTrigger: {
          trigger: ".contact-form-panel", start: "top 85%", once: true,
        },
      });

      /* ── Section rule draws in ── */
      gsap.from(".contact-rule", {
        scaleX: 0, transformOrigin: "left center",
        duration: 1.2, ease: "expo.out", clearProps: "transform",
        scrollTrigger: {
          trigger: ".contact-main-section", start: "top 88%", once: true,
        },
      });

      /* ── Topo map strip parallax ── */
      gsap.to(".contact-topo-bg", {
        yPercent: -15, ease: "none",
        scrollTrigger: {
          trigger: ".contact-map-strip",
          start: "top bottom", end: "bottom top", scrub: 1,
        },
      });

    }, rootRef);

    return () => { ctx.revert(); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div ref={rootRef} className="font-sans">

      {/* ══════════════════════════════════════════════════════════════
          HERO — mirrors Services.jsx hero exactly
      ══════════════════════════════════════════════════════════════ */}
      <section className="contact-hero-section relative min-h-screen flex flex-col justify-end overflow-hidden bg-green-950">

        {/* Background — same grid + topo curves + glow as Services */}
        <div className="contact-hero-bg absolute inset-0 will-change-transform">
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

        {/* Scroll indicator — top-right, same as Services */}
        <div className="absolute top-8 right-8 z-10 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ border: "1px solid rgba(138,188,55,0.4)" }}>
            <div className="w-1 h-1 rounded-full"
              style={{ backgroundColor: "rgba(138,188,55,0.6)" }} />
          </div>
          <span className="text-[10px] tracking-[0.3em] uppercase font-mono"
            style={{ color: "rgba(138,188,55,0.5)" }}>Scroll</span>
        </div>

        {/* Content */}
        <div className="contact-hero-content relative z-10 px-6 md:px-12 lg:px-20 pb-20 pt-40">
          <div className="overflow-hidden mb-3 contact-hero-eyebrow">
            <p className="text-xs tracking-[0.4em] uppercase font-mono"
              style={{ color: "rgba(138,188,55,0.7)" }}>
              — Contact
            </p>
          </div>
          <h1 className="text-[clamp(2rem,6vw,6rem)] font-black text-white leading-[0.93] tracking-tight uppercase max-w-[18ch]">
            {heroWords.map((word, i) => (
              <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.25em]">
                <span className="contact-hero-word inline-block will-change-transform">{word}</span>
              </span>
            ))}
          </h1>
          <p className="contact-hero-sub text-stone-300/80 text-lg leading-relaxed max-w-xl mt-8">
            Reach out by phone, email, or fill in the form — we'll get back within one business day.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10 z-10" />
      </section>

      {/* ══════════════════════════════════════════════════════════════
          MAIN CONTACT SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section className="contact-main-section bg-stone-50 py-28 md:py-38">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">

          {/* Section eyebrow */}
          <div className="flex items-center gap-6 mb-16 border-t border-stone-300 pt-8">
            <span className="text-stone-400 text-[10px] tracking-[0.4em] uppercase font-mono shrink-0">
              01 / Get in touch
            </span>
            <div className="contact-rule h-px flex-1 bg-stone-300 origin-left" />
          </div>

          <div className="grid lg:grid-cols-2 gap-0 border border-stone-300">

            {/* ── LEFT: Contact info ── */}
            <div className="contact-info-col border-b border-stone-300 lg:border-b-0 lg:border-r">

              {/* Visit */}
              <div className="contact-info-block border-b border-stone-300 p-8 md:p-10">
                <p className="text-[9px] uppercase tracking-[0.4em] font-mono text-stone-400 mb-4">
                  Visit
                </p>
                <p className="text-stone-900 font-black text-xl uppercase tracking-tight leading-snug mb-1">
                  Haritha Agro Consultants
                </p>
                <p className="text-stone-500 text-sm font-mono leading-relaxed">
                  Fortune Tower, Judges Avenue<br />
                  Kaloor, Kochi<br />
                  Kerala — India
                </p>
                <div className="w-6 h-px bg-[#8ABC37] mt-5" />
              </div>

              {/* Call */}
              <div className="contact-info-block border-b border-stone-300 p-8 md:p-10">
                <p className="text-[9px] uppercase tracking-[0.4em] font-mono text-stone-400 mb-4">
                  Call
                </p>
                <a
                  href="tel:+919446336872"
                  className="text-stone-900 font-black text-2xl md:text-3xl uppercase tracking-tight hover:text-[#8ABC37] transition-colors duration-300 block leading-none mb-3"
                >
                  +91 944 633 6872
                </a>
                <p className="text-[10px] uppercase tracking-[0.25em] font-mono text-stone-400">
                  Mon – Sat · 09:00 – 19:00 · Sunday closed
                </p>
                <div className="w-6 h-px bg-[#8ABC37] mt-5" />
              </div>

              {/* Email */}
              <div className="contact-info-block border-b border-stone-300 p-8 md:p-10">
                <p className="text-[9px] uppercase tracking-[0.4em] font-mono text-stone-400 mb-4">
                  Email
                </p>
                <a
                  href="mailto:harithascape@gmail.com"
                  className="text-stone-900 font-black text-lg md:text-xl uppercase tracking-tight hover:text-[#8ABC37] transition-colors duration-300 block leading-none mb-3 break-all"
                >
                  harithascape@gmail.com
                </a>
                <p className="text-[10px] uppercase tracking-[0.25em] font-mono text-stone-400">
                  Response within one business day
                </p>
                <div className="w-6 h-px bg-[#8ABC37] mt-5" />
              </div>

              {/* Coverage */}
              <div className="contact-info-block p-8 md:p-10">
                <p className="text-[9px] uppercase tracking-[0.4em] font-mono text-stone-400 mb-4">
                  Coverage
                </p>
                <p className="text-stone-900 font-black text-xl uppercase tracking-tight leading-tight mb-3">
                  All 14 districts<br />of Kerala.
                </p>
                <p className="text-stone-500 text-sm leading-relaxed">
                  Site visits available within 48 hours.<br />
                  Residential, commercial, and institutional.
                </p>
              </div>

            </div>

            {/* ── RIGHT: Form ── */}
            <div className="contact-form-panel">
              {submitted ? (
                <div className="h-full min-h-[480px] flex items-center justify-center p-10 bg-stone-50">
                  <div className="text-center">
                    <div className="w-16 h-16 border border-[#8ABC37] flex items-center justify-center mx-auto mb-8">
                      <svg className="w-7 h-7 text-[#8ABC37]" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.4em] font-mono text-stone-400 mb-4">
                      Message sent
                    </p>
                    <h3 className="text-2xl font-black text-stone-900 uppercase tracking-tight mb-3">
                      We'll be in touch.
                    </h3>
                    <p className="text-stone-500 text-sm leading-relaxed max-w-xs mx-auto">
                      Your message has been recorded. Expect a reply within one business day.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 md:p-10 bg-white h-full">
                  <div className="mb-10 border-b border-stone-200 pb-8">
                    {error && (
                      <p className="text-red-500 text-[10px] uppercase tracking-[0.25em] font-mono text-center mb-3">
                        {error}
                      </p>
                    )}

                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full py-5 bg-[#8ABC37] text-green-950 font-black text-sm uppercase tracking-[0.2em] hover:bg-[#9bd146] transition-colors duration-200 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Sending…
                        </>
                      ) : (
                        <>Send message <span className="text-base">→</span></>
                      )}
                    </button>

                    <p className="text-[9px] uppercase tracking-[0.25em] font-mono text-stone-400 text-center mt-4">
                      We respond within one business day
                    </p>
                  </div>

                  <div className="space-y-0">

                    {/* Name */}
                    <div className="border-b border-stone-200 pb-7 mb-7">
                      <label className="block text-[9px] uppercase tracking-[0.35em] font-mono text-stone-400 mb-3">
                        Name <span className="text-[#8ABC37]">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Your full name"
                        className="w-full bg-transparent text-stone-900 font-semibold text-base placeholder:text-stone-300 border-0 outline-none focus:outline-none p-0 pb-1 border-b border-transparent focus:border-[#8ABC37] transition-colors duration-300"
                      />
                    </div>

                    {/* Email + Phone */}
                    <div className="grid md:grid-cols-2 gap-0 border-b border-stone-200 mb-7">
                      <div className="md:border-r border-stone-200 pb-7 md:pr-6">
                        <label className="block text-[9px] uppercase tracking-[0.35em] font-mono text-stone-400 mb-3">
                          Email <span className="text-[#8ABC37]">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          required
                          placeholder="you@example.com"
                          className="w-full bg-transparent text-stone-900 font-semibold text-base placeholder:text-stone-300 border-0 outline-none focus:outline-none p-0 pb-1 border-b border-transparent focus:border-[#8ABC37] transition-colors duration-300"
                        />
                      </div>
                      <div className="pb-7 md:pl-6">
                        <label className="block text-[9px] uppercase tracking-[0.35em] font-mono text-stone-400 mb-3">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+91 00000 00000"
                          className="w-full bg-transparent text-stone-900 font-semibold text-base placeholder:text-stone-300 border-0 outline-none focus:outline-none p-0 pb-1 border-b border-transparent focus:border-[#8ABC37] transition-colors duration-300"
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div className="border-b border-stone-200 pb-7 mb-8">
                      <label className="block text-[9px] uppercase tracking-[0.35em] font-mono text-stone-400 mb-3">
                        Message <span className="text-[#8ABC37]">*</span>
                      </label>
                      <textarea
                        name="message"
                        rows={5}
                        value={form.message}
                        onChange={handleChange}
                        required
                        placeholder="Tell us about your site, goals, or questions…"
                        className="w-full bg-transparent text-stone-900 font-semibold text-base placeholder:text-stone-300 border-0 outline-none focus:outline-none p-0 resize-none"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      onClick={handleSubmit}
                      className="w-full py-5 bg-[#8ABC37] text-green-950 font-black text-sm uppercase tracking-[0.2em] hover:bg-[#9bd146] transition-colors duration-200 flex items-center justify-center gap-3"
                    >
                      Send message <span className="text-base">→</span>
                    </button>

                    <p className="text-[9px] uppercase tracking-[0.25em] font-mono text-stone-400 text-center mt-4">
                      We respond within one business day
                    </p>

                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TOPO MAP STRIP — closing parallax band
      ══════════════════════════════════════════════════════════════ */}
      {/* <section className="contact-map-strip relative h-64 md:h-80 overflow-hidden bg-green-950">
        <div className="contact-topo-bg absolute inset-[-20%] will-change-transform">
          <svg viewBox="0 0 1200 400" className="w-full h-full"
            preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <rect width="1200" height="400" fill="#0f2a1a" />
            {[
              "M0,200 C150,160 300,240 450,195 S700,150 850,190 S1050,230 1200,190",
              "M0,230 C120,180 280,260 420,215 S680,165 830,210 S1030,250 1200,210",
              "M0,170 C180,130 340,215 500,170 S740,125 900,168 S1080,205 1200,168",
              "M0,260 C100,205 260,285 400,240 S660,190 820,235 S1020,272 1200,235",
              "M0,140 C200,100 380,185 540,140 S780,95 940,138 S1100,175 1200,138",
              "M0,290 C80,230 240,310 380,265 S640,215 800,260 S1000,298 1200,260",
              "M0,110 C220,70 420,155 580,110 S820,65 980,108 S1140,145 1200,108",
              "M0,320 C60,255 220,335 360,290 S620,240 780,285 S980,322 1200,285",
            ].map((d, i) => (
              <path key={i} d={d} fill="none"
                stroke="rgba(134,239,172,0.2)"
                strokeWidth={i % 3 === 0 ? "1.5" : "0.8"} />
            ))}
            {Array.from({ length: 7 }).map((_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 66} x2="1200" y2={i * 66}
                stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
            ))}
            <text x="20" y="30" fill="rgba(134,239,172,0.35)" fontSize="9"
              fontFamily="monospace" letterSpacing="3">KERALA — INDIA / 8–13°N 74–78°E</text>
            <text x="20" y="385" fill="rgba(134,239,172,0.25)" fontSize="9"
              fontFamily="monospace" letterSpacing="2">HARITHA AGRO CONSULTANTS · KOCHI</text>
          </svg>
        </div>
        <div className="absolute inset-0 bg-green-950/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-[10px] uppercase tracking-[0.5em] font-mono text-[#8ABC37]/60">
            08°30′N 76°54′E — Kaloor, Kochi
          </p>
        </div>
      </section> */}

    </div>
  );
}
