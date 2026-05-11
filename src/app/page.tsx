import Link from "next/link";
import CreateBoardButton from "@/components/CreateBoardButton";

export default function Home() {
  return (
    <main className="paper-grid relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16">
      {/* floating doodles */}
      <Doodle className="left-[6%] top-[12%]" rot={-12}>
        <PencilDoodle />
      </Doodle>
      <Doodle className="right-[8%] top-[18%]" rot={14}>
        <BulbDoodle />
      </Doodle>
      <Doodle className="left-[10%] bottom-[14%]" rot={6}>
        <ArrowDoodle />
      </Doodle>
      <Doodle className="right-[12%] bottom-[18%]" rot={-8}>
        <StarDoodle />
      </Doodle>

      <div className="relative z-10 flex max-w-3xl flex-col items-center text-center">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-sun px-4 py-1 font-[family-name:var(--font-hand)] text-sm">
          <span className="size-2 animate-pulse rounded-full bg-coral" />
          Live · multiplayer · AI-powered
        </span>

        <h1 className="font-[family-name:var(--font-display)] text-6xl leading-[0.95] tracking-tight sm:text-7xl md:text-8xl">
          a whiteboard with a{" "}
          <span className="relative inline-block">
            <span className="relative z-10">brain</span>
            <span className="absolute inset-x-0 bottom-1 -z-0 h-4 bg-mint/70" />
          </span>
          .
        </h1>

        <p className="mt-6 max-w-xl font-[family-name:var(--font-hand)] text-xl text-ink-soft sm:text-2xl">
          Sketch with friends in real time. Then ask AI to turn your doodles
          into code, generate diagrams from a sentence, or summarize the whole
          board into meeting notes.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <CreateBoardButton />
          <Link
            href="#features"
            className="font-[family-name:var(--font-hand)] text-lg underline decoration-wavy decoration-coral underline-offset-4 hover:text-coral"
          >
            see what it can do ↓
          </Link>
        </div>
      </div>

      <section
        id="features"
        className="relative z-10 mt-32 grid w-full max-w-5xl gap-6 sm:grid-cols-3"
      >
        <FeatureCard color="bg-coral/30" emoji="✏️" title="Sketch → Code">
          Draw a UI mockup, hit one button, and Claude returns clean React +
          Tailwind you can paste into your project.
        </FeatureCard>
        <FeatureCard color="bg-sky/30" emoji="📐" title="Text → Diagram">
          Type{" "}
          <em className="font-[family-name:var(--font-hand)]">
            &ldquo;a microservices architecture with redis cache&rdquo;
          </em>{" "}
          and watch AI sketch it onto your board.
        </FeatureCard>
        <FeatureCard color="bg-grape/30" emoji="📝" title="Board → Notes">
          End your meeting with a click. AI reads everything on the board and
          gives you structured markdown notes.
        </FeatureCard>
      </section>

      <footer className="relative z-10 mt-24 flex items-center gap-3 font-[family-name:var(--font-hand)] text-sm text-ink-soft">
        <span>built with</span>
        <span className="rounded-md border border-ink/30 bg-paper px-2 py-0.5">
          Next.js 16
        </span>
        <span className="rounded-md border border-ink/30 bg-paper px-2 py-0.5">
          tldraw
        </span>
        <span className="rounded-md border border-ink/30 bg-paper px-2 py-0.5">
          Claude
        </span>
      </footer>
    </main>
  );
}

function FeatureCard({
  color,
  emoji,
  title,
  children,
}: {
  color: string;
  emoji: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className={`sticky-card ${color} p-6`}>
      <div className="mb-3 text-4xl">{emoji}</div>
      <h3 className="font-[family-name:var(--font-display)] text-3xl">
        {title}
      </h3>
      <p className="mt-2 font-[family-name:var(--font-hand)] text-lg leading-snug text-ink">
        {children}
      </p>
    </article>
  );
}

function Doodle({
  className,
  rot,
  children,
}: {
  className: string;
  rot: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`float-doodle pointer-events-none absolute hidden text-ink/70 sm:block ${className}`}
      style={{ ["--rot" as never]: `${rot}deg` }}
    >
      {children}
    </div>
  );
}

function PencilDoodle() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      <path
        d="M10 60 L52 18 L62 28 L20 70 Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
        fill="#ffd93d"
      />
      <path d="M52 18 L60 10 L70 20 L62 28" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" fill="#ff6b6b" />
      <path d="M10 60 L18 68" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}

function BulbDoodle() {
  return (
    <svg width="64" height="80" viewBox="0 0 64 80" fill="none">
      <path
        d="M32 8 C18 8 10 18 12 30 C14 40 22 44 24 52 L40 52 C42 44 50 40 52 30 C54 18 46 8 32 8 Z"
        stroke="currentColor"
        strokeWidth="3"
        fill="#ffd93d"
      />
      <rect x="22" y="56" width="20" height="6" stroke="currentColor" strokeWidth="3" fill="#fffdf5" />
      <rect x="24" y="64" width="16" height="6" stroke="currentColor" strokeWidth="3" fill="#fffdf5" />
      <path d="M8 14 L2 10 M56 14 L62 10 M32 0 L32 6" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ArrowDoodle() {
  return (
    <svg width="90" height="60" viewBox="0 0 90 60" fill="none">
      <path
        d="M5 30 C25 5 50 55 80 28"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M80 28 L72 22 M80 28 L72 36"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StarDoodle() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
      <path
        d="M30 4 L36 22 L56 22 L40 34 L46 54 L30 42 L14 54 L20 34 L4 22 L24 22 Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
        fill="#b388eb"
      />
    </svg>
  );
}
