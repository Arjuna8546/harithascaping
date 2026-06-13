import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV_LINKS } from "../data";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-stone-950/96 backdrop-blur-md border-b border-white/8 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="w-full px-6 md:px-12 lg:px-20 flex items-center justify-between">

        {/* ── Brand ── */}
        <Link to="/" className="group flex items-center shrink-0">
          {/* Circular icon */}
          <img
            src="/img/logo.png"
            alt=""
            aria-hidden="true"
            className="h-14 w-14 object-contain transition-opacity duration-300 group-hover:opacity-80"
          />
          {/* Wordmark */}
          <img
            src="/img/logo_name.png"
            alt="Haritha Agro Consultants"
            className="h-11 w-auto object-contain transition-opacity duration-300 group-hover:opacity-80"
          />
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden md:flex items-center gap-0">
          {NAV_LINKS.map((link) => {
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.id}
                to={link.path}
                className={`relative px-5 py-2 text-sm uppercase tracking-[0.2em] font-mono transition-colors duration-200 ${
                  active
                    ? "text-[#8ABC37]"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
                {/* Active underline */}
                {active && (
                  <span className="absolute bottom-0 left-5 right-5 h-px bg-[#8ABC37]" />
                )}
              </Link>
            );
          })}

          {/* CTA — matches hero button style exactly */}
          {/* <Link
            to="/contact"
            className="ml-6 inline-flex items-center gap-2 px-6 py-3 bg-[#8ABC37] text-green-950 font-bold text-sm uppercase tracking-[0.15em] hover:bg-[#9bd146] transition-colors duration-200"
          >
            Consult <span>→</span>
          </Link> */}
        </nav>

        {/* ── Mobile Hamburger ── */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2 group"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle navigation"
        >
          <span
            className={`block w-6 h-px bg-white transition-all duration-300 ${
              open ? "rotate-45 translate-y-[7px]" : ""
            }`}
          />
          <span
            className={`block w-6 h-px bg-white transition-all duration-300 ${
              open ? "opacity-0 scale-x-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-px bg-white transition-all duration-300 ${
              open ? "-rotate-45 -translate-y-[7px]" : ""
            }`}
          />
        </button>
      </div>

      {/* ── Mobile Menu ── full-bleed dark panel */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-400 bg-stone-950 border-t border-white/10 ${
          open ? "max-h-[28rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="max-w-[1400px] mx-auto px-6 md:px-12 py-6 flex flex-col gap-0">
          {NAV_LINKS.map((link) => {
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.id}
                to={link.path}
                className={`flex items-center justify-between py-5 border-b border-white/8 text-sm uppercase tracking-[0.25em] font-mono transition-colors duration-200 ${
                  active ? "text-[#8ABC37]" : "text-white/60 hover:text-white"
                }`}
              >
                {link.label}
                {/* <span className="text-white/20">→</span> */}
              </Link>
            );
          })}
          {/* <Link
            to="/contact"
            className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#8ABC37] text-green-950 font-bold text-sm uppercase tracking-[0.15em] hover:bg-[#9bd146] transition-colors duration-200"
          >
            Book a consultation <span>→</span>
          </Link> */}
        </nav>
      </div>
    </header>
  );
}