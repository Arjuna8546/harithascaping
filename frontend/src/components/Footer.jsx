import { Link } from "react-router-dom";
import { SERVICES } from "../data";

export default function Footer() {
  return (
    <footer className="site-footer bg-stone-950 text-stone-400">
      <div className="w-full px-6 md:px-12 lg:px-20">

        {/* ── Top rule ── */}
        <div className="footer-line h-px bg-stone-800" />

        {/* ════════════════════════════════════════════════════════
            MOBILE FOOTER  (hidden on lg+)
            Compact single-column layout — brand, quick links, contact
        ════════════════════════════════════════════════════════ */}
        <div className="lg:hidden py-10 space-y-8">

          {/* Brand row */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/img/logo.png"
                alt=""
                aria-hidden="true"
                className="h-8 w-8 object-contain"
              />
              <img
                src="/img/logo_name.png"
                alt="Haritha Agro Consultants"
                className="h-6 w-auto object-contain"
              />
            </Link>
            {/* Social icons — compact */}
            <div className="flex gap-2">
              {[
                { label: "Facebook",  char: "f"  },
                { label: "Instagram", char: "ig" },
                { label: "LinkedIn",  char: "in" },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="w-8 h-8 border border-stone-700 flex items-center justify-center text-[10px] font-mono text-stone-500 hover:border-[#8ABC37] hover:text-[#8ABC37] transition-colors duration-200"
                >
                  {s.char}
                </a>
              ))}
            </div>
          </div>

          {/* Two-column quick-links + contact */}
          <div className="grid grid-cols-2 gap-6 border-t border-stone-800 pt-8">

            {/* Nav links */}
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] font-mono text-stone-600 mb-4">
                Navigate
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: "About",    path: "/about"    },
                  { label: "Services", path: "/services"  },
                  { label: "Projects", path: "/projects"  },
                  { label: "Gallery",  path: "/gallery"   },
                  { label: "Contact",  path: "/contact"   },
                ].map((l) => (
                  <li key={l.path}>
                    <Link
                      to={l.path}
                      className="text-[10px] uppercase tracking-[0.15em] font-mono text-stone-500 hover:text-[#8ABC37] transition-colors duration-200"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] font-mono text-stone-600 mb-4">
                Contact
              </p>
              <ul className="space-y-3">
                <li className="text-[10px] font-mono leading-relaxed text-stone-600">
                  Kaloor, Kochi<br />Kerala — India
                </li>
                <li>
                  <a
                    href="tel:+919446336872"
                    className="text-[10px] font-mono text-stone-400 hover:text-[#8ABC37] transition-colors duration-200"
                  >
                    +91 944 633 6872
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:harithascape@gmail.com"
                    className="text-[10px] font-mono text-stone-400 hover:text-[#8ABC37] transition-colors duration-200 break-all"
                  >
                    harithascape@gmail.com
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* CTA button — full width on mobile */}
          <Link
            to="/contact"
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#8ABC37] text-green-950 font-bold text-xs uppercase tracking-[0.15em] hover:bg-[#9bd146] transition-colors duration-200"
          >
            Book a visit <span>→</span>
          </Link>

          {/* Bottom bar */}
          <div className="border-t border-stone-800 pt-6 flex items-center justify-between">
            <p className="text-[9px] uppercase tracking-[0.25em] font-mono text-stone-700">
              © {new Date().getFullYear()} Haritha Agro Consultants
            </p>
            <p className="text-[9px] uppercase tracking-[0.25em] font-mono text-stone-700">
              Est. 1999
            </p>
          </div>

        </div>

        {/* ════════════════════════════════════════════════════════
            DESKTOP FOOTER  (hidden below lg) — original, untouched
        ════════════════════════════════════════════════════════ */}
        <div className="hidden lg:block">

          {/* ── Main grid ── */}
          <div className="grid grid-cols-4 border-b border-stone-800">

            {/* Col 1 — Brand + tagline */}
            <div className="py-14 pr-10 border-r border-stone-800">
              <Link to="/" className="group flex items-center mb-6">
                <img
                  src="/img/logo.png"
                  alt=""
                  aria-hidden="true"
                  className="h-12 w-12 object-contain"
                />
                <img
                  src="/img/logo_name.png"
                  alt="Haritha Agro Consultants"
                  className="h-9 w-auto object-contain"
                />
              </Link>
              <p className="text-stone-500 text-sm leading-relaxed max-w-[24ch]">
                Kerala's first horticulture-based turnkey firm. Est. 1999.
              </p>
              <div className="mt-8 flex gap-3">
                {[
                  { label: "Facebook",  char: "fb" , redirect :"https://www.facebook.com/Harithascape/" },
                  { label: "Instagram", char: "ig" , redirect :"https://www.instagram.com/harithascape/"},
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.redirect}
                    aria-label={s.label}
                    className="w-9 h-9 border border-stone-700 flex items-center justify-center text-xs font-mono text-stone-500 hover:border-[#8ABC37] hover:text-[#8ABC37] transition-colors duration-200"
                  >
                    {s.char}
                  </a>
                ))}
              </div>
            </div>

            {/* Col 2 — Services */}
            <div className="py-14 px-10 border-r border-stone-800">
              <p className="text-[10px] uppercase tracking-[0.3em] font-mono text-stone-600 mb-6">
                Services
              </p>
              <ul className="space-y-3">
                {SERVICES.slice(0, 6).map((s) => (
                  <li key={s.code}>
                    <Link
                      to="/services"
                      className="flex items-center gap-3 text-[11px] uppercase tracking-[0.15em] font-mono text-stone-500 hover:text-[#8ABC37] transition-colors duration-200 group"
                    >
                      <span className="text-stone-700 group-hover:text-green-600 transition-colors duration-200 shrink-0">
                        {s.code}
                      </span>
                      <span>{s.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Navigation */}
            <div className="py-14 px-10 border-r border-stone-800">
              <p className="text-[10px] uppercase tracking-[0.3em] font-mono text-stone-600 mb-6">
                Navigate
              </p>
              <ul className="space-y-3">
                {[
                  { label: "About Us",  path: "/about"    },
                  { label: "Services",  path: "/services"  },
                  { label: "Projects",  path: "/projects"  },
                  { label: "Gallery",   path: "/gallery"   },
                  { label: "Contact",   path: "/contact"   },
                ].map((l) => (
                  <li key={l.path}>
                    <Link
                      to={l.path}
                      className="text-[11px] uppercase tracking-[0.15em] font-mono text-stone-500 hover:text-[#8ABC37] transition-colors duration-200"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4 — Contact */}
            <div className="py-14 pl-10">
              <p className="text-[10px] uppercase tracking-[0.3em] font-mono text-stone-600 mb-6">
                Contact
              </p>
              <ul className="space-y-4 text-sm">
                <li className="text-[11px] font-mono leading-relaxed text-stone-600">
                  Fortune Tower, Judges Avenue<br />
                  Kaloor, Kochi<br />
                  Kerala — India
                </li>
                <li>
                  <a
                    href="tel:+919446336872"
                    className="text-[11px] uppercase tracking-[0.15em] font-mono text-stone-400 hover:text-[#8ABC37] transition-colors duration-200"
                  >
                    +91 944 633 6872
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:harithascape@gmail.com"
                    className="text-[11px] font-mono text-stone-400 hover:text-[#8ABC37] transition-colors duration-200 break-all"
                  >
                    harithascape@gmail.com
                  </a>
                </li>
                <li className="text-[10px] uppercase tracking-[0.15em] font-mono text-stone-700">
                  Mon – Sat · 09:00 – 19:00
                </li>
              </ul>

              <Link
                to="/contact"
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-[#8ABC37] text-green-950 font-bold text-xs uppercase tracking-[0.15em] hover:bg-[#9bd146] transition-colors duration-200"
              >
                Book a visit <span>→</span>
              </Link>
            </div>

          </div>

          {/* ── Bottom bar ── */}
          <div className="py-6 flex items-center justify-between gap-2">
            <p className="text-[10px] uppercase tracking-[0.25em] font-mono text-stone-700">
              © {new Date().getFullYear()} Haritha Agro Consultants
            </p>
            <p className="text-[10px] uppercase tracking-[0.25em] font-mono text-stone-700">
              Kerala · 8–13°N / 74–78°E
            </p>
          </div>

        </div>
        {/* end desktop footer */}

      </div>
    </footer>
  );
}