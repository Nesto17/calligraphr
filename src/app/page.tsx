import Link from "next/link";

const FLOATING_CHARS = [
  { char: "A", color: "#E63946", top: "15%", left: "8%", rotate: "-12deg", delay: "0s" },
  { char: "b", color: "#457B9D", top: "25%", right: "12%", rotate: "8deg", delay: "0.5s" },
  { char: "Z", color: "#F4A261", top: "60%", left: "5%", rotate: "15deg", delay: "1s" },
  { char: "3", color: "#E63946", top: "70%", right: "8%", rotate: "-8deg", delay: "1.5s" },
  { char: "k", color: "#457B9D", bottom: "20%", left: "15%", rotate: "10deg", delay: "0.3s" },
  { char: "R", color: "#F4A261", top: "10%", right: "25%", rotate: "-5deg", delay: "0.8s" },
];

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden notebook-bg">
      {/* Floating doodle characters */}
      {FLOATING_CHARS.map((item, i) => (
        <div
          key={i}
          className="absolute text-6xl font-bold opacity-15 select-none float"
          style={{
            color: item.color,
            top: item.top,
            left: item.left,
            right: item.right,
            bottom: item.bottom,
            transform: `rotate(${item.rotate})`,
            animationDelay: item.delay,
          }}
        >
          {item.char}
        </div>
      ))}

      <div className="text-center space-y-8 z-10 px-4">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-7xl font-bold text-[#2B2B2B] leading-tight">
            <span className="inline-block transform -rotate-2 text-[#E63946]">Doodle</span>{" "}
            <span className="inline-block transform rotate-1 text-[#457B9D]">Font</span>{" "}
            <span className="inline-block transform -rotate-1 text-[#F4A261]">Maker</span>
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="h-1 w-16 bg-[#E63946] rounded-full" />
            <div className="h-1 w-16 bg-[#457B9D] rounded-full" />
            <div className="h-1 w-16 bg-[#F4A261] rounded-full" />
          </div>
        </div>

        {/* Description */}
        <p className="text-xl text-gray-600 max-w-lg mx-auto leading-relaxed">
          Turn your handwriting into a real font!
          <br />
          Draw each letter, preview your creation, and download a{" "}
          <span className="font-bold text-[#457B9D]">.otf font file</span>{" "}
          you can install anywhere.
        </p>

        {/* Feature cards */}
        <div className="flex flex-wrap gap-4 justify-center max-w-2xl mx-auto">
          {[
            { icon: "✏️", text: "Draw on a guided canvas", color: "#E63946" },
            { icon: "👀", text: "Live font preview", color: "#457B9D" },
            { icon: "📥", text: "Download .otf file", color: "#F4A261" },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-white px-5 py-3 rounded-xl border-2 border-[#2B2B2B] shadow-[3px_3px_0px_#2B2B2B] flex items-center gap-2"
              style={{ transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}
            >
              <span className="text-2xl">{feature.icon}</span>
              <span className="font-bold" style={{ color: feature.color }}>
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Link
          href="/create"
          className="sticker-btn bg-[#E63946] text-white inline-block text-2xl"
        >
          Start Creating!
        </Link>

        <p className="text-sm text-gray-400">
          A-Z, a-z, 0-9 — 62 characters to make your font complete
        </p>
      </div>
    </main>
  );
}
