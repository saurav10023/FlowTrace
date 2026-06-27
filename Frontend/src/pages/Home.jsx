import { useState, useEffect } from "react";

/* ─── Data ───────────────────────────────────────────────── */

const TICKER_EVENTS = [
  { id: 1, type: "UPI",    label: "UPI Payment",     amount: "₹1,249",   status: "success", to: "@ybl",        time: "just now" },
  { id: 2, type: "CARD",   label: "Visa Debit",       amount: "₹8,999",   status: "success", to: "Amazon Pay",  time: "2s ago" },
  { id: 3, type: "WALLET", label: "Paytm Wallet",     amount: "₹450",     status: "pending", to: "Swiggy",      time: "5s ago" },
  { id: 4, type: "IMPS",   label: "IMPS Transfer",    amount: "₹25,000",  status: "success", to: "HDFC ••4821", time: "8s ago" },
  { id: 5, type: "UPI",    label: "QR Scan",          amount: "₹120",     status: "success", to: "@okaxis",     time: "11s ago" },
  { id: 6, type: "EMI",    label: "No-cost EMI",      amount: "₹3,333",   status: "success", to: "Flipkart",    time: "14s ago" },
  { id: 7, type: "NEFT",   label: "NEFT Transfer",    amount: "₹1,00,000",status: "success", to: "ICICI ••9201",time: "17s ago" },
  { id: 8, type: "UPI",    label: "Collect Request",  amount: "₹650",     status: "failed",  to: "@paytm",      time: "20s ago" },
];

const METHODS = [
  { key: "razorpay", name: "Razorpay",             tag: "Hosted Checkout", desc: "Drop-in checkout with cards, UPI, netbanking & wallets. Fastest to production.",             difficulty: "Easy",   color: "border-t-[#3395FF]", href: "#razorpay", icon: "💳" },
  { key: "upi",      name: "Custom UPI Gateway",   tag: "Self-built",      desc: "DIY UPI flow via deep links + SMS parsing. Full control, no third-party cut.",               difficulty: "Hard",   color: "border-t-indigo-500", href: "#upi",      icon: "⚡" },
  { key: "phonepe",  name: "PhonePe SDK",           tag: "Native SDK",      desc: "Intent-based UPI redirect with PhonePe's Android/iOS SDK and server-side callback.",        difficulty: "Medium", color: "border-t-purple-600", href: "#phonepe",  icon: "📱" },
  { key: "cashfree", name: "Cashfree",              tag: "Payout API",      desc: "Instant payouts and split settlements via Cashfree's Payouts API — great for marketplaces.", difficulty: "Medium", color: "border-t-teal-500",  href: "#cashfree", icon: "🏦" },
  { key: "paytm",    name: "Paytm PG",              tag: "Wallet + Cards",  desc: "Paytm payment gateway with wallet, UPI, and card flows via server-side token generation.",  difficulty: "Medium", color: "border-t-sky-400",   href: "#paytm",    icon: "👛" },
  { key: "neft",     name: "NEFT / IMPS",           tag: "Bank Transfer",   desc: "Manual and automated bank transfer verification using UTR matching and webhook callbacks.", difficulty: "Hard",   color: "border-t-amber-400", href: "#neft",     icon: "🏛️" },
];

const STATS = [
  { value: "6",     label: "Payment methods" },
  { value: "₹0",   label: "Third-party dependency for UPI" },
  { value: "3ms",  label: "Avg webhook response" },
  { value: "100%", label: "Replay-attack prevention" },
];

/* ─── Type chip colors ───────────────────────────────────── */
const TYPE_STYLES = {
  UPI:    "bg-indigo-500/10 text-indigo-400",
  CARD:   "bg-blue-500/10 text-blue-400",
  WALLET: "bg-sky-500/10 text-sky-400",
  IMPS:   "bg-green-500/10 text-green-400",
  NEFT:   "bg-amber-500/10 text-amber-400",
  EMI:    "bg-purple-500/10 text-purple-400",
};

const STATUS_STYLES = {
  success: { wrap: "bg-green-500/10 text-green-400 border-green-500/20", dot: "bg-green-400", label: "SUCCESS" },
  pending: { wrap: "bg-amber-500/10 text-amber-400 border-amber-500/20", dot: "bg-amber-400", label: "PENDING" },
  failed:  { wrap: "bg-red-500/10  text-red-400  border-red-500/20",  dot: "bg-red-400",  label: "FAILED"  },
};

const DIFFICULTY_STYLES = {
  Easy:   "bg-green-500/10 text-green-400 border-green-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Hard:   "bg-red-500/10  text-red-400  border-red-500/20",
};

/* ─── Sub-components ─────────────────────────────────────── */

function TypeChip({ type }) {
  return (
    <span className={`font-mono text-[9px] font-bold tracking-[0.05em] rounded px-1.5 py-0.5 ${TYPE_STYLES[type] || "bg-white/5 text-[#7b7b9a]"}`}>
      {type}
    </span>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.success;
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.05em] border rounded px-1.5 py-0.5 ${s.wrap}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function DifficultyBadge({ level }) {
  return (
    <span className={`font-mono text-[10px] font-bold tracking-[0.05em] border rounded px-2 py-0.5 ${DIFFICULTY_STYLES[level] || DIFFICULTY_STYLES.Easy}`}>
      {level}
    </span>
  );
}

/* ─── Transaction Ticker ─────────────────────────────────── */

function TransactionTicker() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % TICKER_EVENTS.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full max-w-[480px] bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.08] bg-white/[0.02]">
        <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80] animate-pulse" />
        <span className="font-mono text-[11px] text-[#7b7b9a] tracking-[0.05em]">LIVE · TRANSACTION STREAM</span>
        <span className="ml-auto font-mono text-[10px] text-[#7b7b9a]">{TICKER_EVENTS.length} events</span>
      </div>

      {/* Rows */}
      {TICKER_EVENTS.map((ev, i) => (
        <div
          key={ev.id}
          className={`flex items-center gap-3 px-4 py-2.5 transition-colors duration-300 ${
            i < TICKER_EVENTS.length - 1 ? "border-b border-white/[0.04]" : ""
          } ${active === i ? "bg-indigo-500/[0.07]" : "bg-transparent"}`}
        >
          <TypeChip type={ev.type} />
          <span className="font-sans text-[13px] text-[#e8e8f0] flex-1 min-w-0 truncate">
            {ev.label}
            <span className="text-[#7b7b9a] ml-1.5 text-xs">→ {ev.to}</span>
          </span>
          <span className="font-mono text-[13px] font-semibold text-[#e8e8f0] flex-shrink-0">{ev.amount}</span>
          <StatusBadge status={ev.status} />
          <span className="font-mono text-[10px] text-[#7b7b9a] flex-shrink-0 min-w-[48px] text-right">{ev.time}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Home Page ──────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="bg-[#0a0a0f] min-h-screen text-[#e8e8f0] font-sans">

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 pt-24 pb-20 overflow-hidden">
        {/* Glow */}
        <div className="pointer-events-none absolute top-[-120px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.18)_0%,transparent_70%)]" />

        {/* Eyebrow */}
        <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.12em] uppercase text-indigo-400 bg-indigo-500/15 border border-indigo-500/25 rounded-full px-3.5 py-1.5 mb-7">
          🇮🇳 India Payment Engineering
        </span>

        {/* Headline */}
        <h1 className="text-[clamp(40px,6vw,72px)] font-extrabold leading-[1.08] tracking-[-0.06em] text-[#e8e8f0] max-w-[800px] mb-5">
          Every way to accept<br />
          payments in{" "}
          <span className="bg-gradient-to-br from-[#818cf8] via-indigo-500 to-violet-400 bg-clip-text text-transparent">
            India
          </span>
          ,<br />built and documented.
        </h1>

        {/* Subheading */}
        <p className="text-[clamp(15px,2vw,18px)] text-[#7b7b9a] max-w-[540px] leading-relaxed mb-10">
          Live demos, architecture walkthroughs, and working code for 6
          payment methods — from Razorpay drop-in checkout to a custom
          UPI gateway you control entirely.
        </p>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          <a
            href="#playground"
            className="font-sans text-[15px] font-semibold text-white no-underline bg-indigo-500 px-6 py-3 rounded-xl transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 shadow-[0_0_0_rgba(99,102,241,0)] hover:shadow-[0_8px_32px_rgba(99,102,241,0.35)]"
          >
            Try live demos →
          </a>
          <a
            href="#methods"
            className="font-sans text-[15px] font-medium text-[#7b7b9a] no-underline bg-white/5 border border-white/[0.08] px-6 py-3 rounded-xl transition-all duration-200 hover:text-[#e8e8f0] hover:bg-white/[0.08] hover:border-white/[0.16]"
          >
            Browse methods
          </a>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap justify-center items-stretch bg-white/[0.03] border border-white/[0.08] rounded-xl px-8 py-5 max-w-[680px] mx-auto">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`text-center px-7 ${i < STATS.length - 1 ? "border-r border-white/[0.08]" : ""} min-w-[120px]`}
            >
              <span className="font-mono text-[22px] font-bold text-indigo-400 tracking-tight block">{s.value}</span>
              <span className="text-[12px] text-[#7b7b9a] mt-0.5 block">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-[1160px] mx-auto px-6">
        <hr className="border-none border-t border-white/[0.08]" />
      </div>

      {/* ── Ticker Section ── */}
      <section className="max-w-[1160px] mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Text */}
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-400 mb-3">
              Under the hood
            </div>
            <h2 className="text-[clamp(26px,3.5vw,40px)] font-extrabold tracking-[-0.04em] text-[#e8e8f0] leading-[1.12] mb-3.5">
              Real payment events,<br />not mocked responses.
            </h2>
            <p className="text-[15px] text-[#7b7b9a] leading-relaxed max-w-[520px] mb-10">
              Every demo on this site processes actual payment flows — UPI collect
              requests, card tokenization, and bank webhooks. Watch live events
              from the transaction stream as you interact with each integration.
            </p>
            <div className="flex flex-wrap gap-8">
              {[
                ["Webhook verified",  "✓ SHA-256 signature"],
                ["Replay protected",  "✓ UTR deduplication"],
                ["Timing-safe",       "✓ timingSafeEqual"],
              ].map(([label, note]) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className="font-mono text-[11px] text-indigo-400 font-bold">{note}</span>
                  <span className="text-[13px] text-[#7b7b9a]">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ticker */}
          <div className="flex justify-center lg:justify-end">
            <TransactionTicker />
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-[1160px] mx-auto px-6">
        <hr className="border-none border-t border-white/[0.08]" />
      </div>

      {/* ── Methods Grid ── */}
      <section className="max-w-[1160px] mx-auto px-6 py-20" id="methods">
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-400 mb-3">
          6 integrations
        </div>
        <h2 className="text-[clamp(26px,3.5vw,40px)] font-extrabold tracking-[-0.04em] text-[#e8e8f0] leading-[1.12] mb-3.5">
          Pick your payment method.
        </h2>
        <p className="text-[15px] text-[#7b7b9a] leading-relaxed max-w-[520px] mb-12">
          Each method includes a live demo, working Node.js source code,
          architecture diagram, and a real-world assessment.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {METHODS.map((m) => (
            <a
              key={m.key}
              href={m.href}
              className={`group relative bg-white/[0.025] border border-white/[0.08] border-t-2 ${m.color} rounded-xl p-6 no-underline flex flex-col gap-3 transition-all duration-200 hover:bg-white/[0.045] hover:border-white/[0.14] hover:-translate-y-1`}
            >
              <span className="text-[28px] leading-none">{m.icon}</span>
              <div className="flex items-start justify-between gap-2">
                <span className="font-sans text-[16px] font-bold text-[#e8e8f0] tracking-tight">{m.name}</span>
                <span className="font-mono text-[9px] font-semibold tracking-[0.04em] text-[#7b7b9a] bg-white/5 border border-white/[0.08] rounded px-1.5 py-0.5 whitespace-nowrap flex-shrink-0">
                  {m.tag}
                </span>
              </div>
              <p className="text-[13px] text-[#7b7b9a] leading-relaxed flex-1">{m.desc}</p>
              <div className="flex items-center justify-between mt-1">
                <DifficultyBadge level={m.difficulty} />
                <span className="font-sans text-[12px] font-semibold text-indigo-400 transition-transform duration-200 group-hover:translate-x-1">
                  Explore →
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="max-w-[1160px] mx-auto px-6">
        <hr className="border-none border-t border-white/[0.08]" />
      </div>

      {/* ── CTA Banner ── */}
      <section className="max-w-[1160px] mx-auto px-6 py-20">
        <div className="relative overflow-hidden border border-indigo-500/25 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-indigo-500/[0.03] px-12 py-14 text-center">
          {/* Glow */}
          <div className="pointer-events-none absolute top-[-80px] left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-[radial-gradient(ellipse,rgba(99,102,241,0.2)_0%,transparent_70%)]" />

          <h2 className="text-[clamp(24px,3vw,36px)] font-extrabold tracking-[-0.03em] text-[#e8e8f0] mb-3 relative">
            See the engineering decisions.
          </h2>
          <p className="text-[15px] text-[#7b7b9a] max-w-[480px] mx-auto mb-8 relative">
            Read how the custom UPI gateway was built, what broke, what was
            fixed with cryptography, and why the final architecture looks the
            way it does.
          </p>
          <div className="flex flex-wrap justify-center gap-3 relative">
            <a
              href="#journey"
              className="font-sans text-[15px] font-semibold text-white no-underline bg-indigo-500 px-6 py-3 rounded-xl transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
            >
              Read My Journey →
            </a>
            <a
              href="#compare"
              className="font-sans text-[15px] font-medium text-[#7b7b9a] no-underline bg-white/5 border border-white/[0.08] px-6 py-3 rounded-xl transition-all duration-200 hover:text-[#e8e8f0] hover:bg-white/[0.08]"
            >
              Compare all methods
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}