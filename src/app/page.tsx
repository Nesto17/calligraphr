import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6">
      <div className="max-w-xl w-full text-center space-y-10">
        {/* Brand */}
        <div className="space-y-4">
          <h1 className="text-6xl font-accent tracking-tight text-[#1A1A1A]">
            Calligraphr
          </h1>
          <p className="text-lg text-[#71717A] leading-relaxed max-w-md mx-auto">
            Turn your handwriting into a real font. Draw each letter, preview it live,
            and download a <span className="text-[#D4714E] font-medium">.otf file</span> you can install anywhere.
          </p>
        </div>

        {/* Features */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {[
            { label: "Draw", desc: "Guided canvas", color: "#D4714E" },
            { label: "Preview", desc: "See it live", color: "#8B7EC8" },
            { label: "Export", desc: "Download .otf", color: "#E09D4A" },
          ].map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-3 bg-white rounded-xl px-5 py-3 border border-[#E4E4E7] shadow-sm"
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: f.color }}
              />
              <div className="text-left">
                <p className="text-sm font-semibold text-[#1A1A1A]">{f.label}</p>
                <p className="text-xs text-[#A1A1AA]">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 bg-[#D4714E] hover:bg-[#C4623F] text-white px-8 py-3 rounded-full text-base font-medium transition-colors shadow-sm"
          >
            Start creating
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-px">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <p className="text-xs text-[#A1A1AA]">
            A–Z, a–z, 0–9 — 62 characters, fully client-side
          </p>
        </div>
      </div>
    </main>
  );
}
