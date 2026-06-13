export default function PageHero({ eyebrow, title, lede }) {
  return (
    <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 pt-32 pb-20 overflow-hidden">
      {/* Topographic contour lines SVG overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        viewBox="0 0 1200 400"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {[0, 40, 80, 120, 160, 200].map((offset) => (
          <path
            key={offset}
            d={`M0,${200 + offset} C200,${160 + offset} 400,${240 + offset} 600,${190 + offset} S900,${220 + offset} 1200,${200 + offset}`}
            fill="none"
            stroke="white"
            strokeWidth="1.5"
          />
        ))}
      </svg>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <p className="text-green-300 text-sm font-medium tracking-widest uppercase mb-4">
          {eyebrow}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
          {title}
        </h1>
        {lede && (
          <p className="text-green-100/80 text-lg leading-relaxed max-w-2xl mx-auto">
            {lede}
          </p>
        )}
      </div>

      {/* Wave divider */}
      <svg
        className="absolute bottom-0 left-0 right-0 text-white"
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        style={{ height: 100 }}
        aria-hidden="true"
      >
        <path
          d="M0,40 C150,10 300,60 450,35 C600,10 750,60 900,35 C1050,10 1150,50 1200,35 L1200,60 L0,60 Z"
          fill="currentColor"
        />
      </svg>
    </section>
  );
}
