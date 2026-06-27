const METHODS = [
  { label: "Razorpay", href: "#razorpay" },
  { label: "Custom UPI Gateway", href: "#upi" },
  { label: "PhonePe SDK", href: "#phonepe" },
  { label: "Paytm", href: "#paytm" },
  { label: "Cashfree", href: "#cashfree" },
  { label: "NEFT / IMPS", href: "#neft" },
];

const SITE = [
  { label: "Home", href: "/" },
  { label: "Compare Methods", href: "#compare" },
  { label: "Live Playground", href: "#playground" },
  { label: "My Journey", href: "#journey" },
  { label: "Architecture Diagrams", href: "#arch" },
];

const TECH = [
  { label: "Node.js + Express", href: "#" },
  { label: "MongoDB / Mongoose", href: "#" },
  { label: "Razorpay API", href: "#" },
  { label: "UPI Deep Links", href: "#" },
  { label: "SMS Webhooks", href: "#" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0a0f] border-t border-white/[0.08] pt-16 pb-8 px-6 font-sans">
      <div className="max-w-[1160px] mx-auto">

        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-12 pb-12 border-b border-white/[0.08]">

          {/* Brand */}
          <div className="lg:col-span-1 md:col-span-2">
            <a href="/" className="flex items-center gap-2.5 no-underline mb-4">
              <div className="w-[34px] h-[34px] rounded-lg bg-indigo-500 flex items-center justify-center font-mono text-sm font-bold text-white">
                ₹
              </div>
              <span className="text-[15px] font-semibold text-[#e8e8f0] tracking-tight">
                payment<span className="text-indigo-400">lab</span>
              </span>
            </a>
            <p className="text-[13.5px] text-[#7b7b9a] leading-relaxed max-w-[280px] mb-6">
              A technical reference for every major payment integration method
              available in India — with live demos, architecture diagrams, and
              an honest engineering case study.
            </p>
            {/* Status pill */}
            <span className="inline-flex items-center gap-2 font-mono text-[11px] font-medium text-[#7b7b9a] bg-white/[0.04] border border-white/[0.08] rounded-full px-3 py-1.5">
              <span className="w-[7px] h-[7px] rounded-full bg-green-400 shadow-[0_0_6px_#4ade80] animate-pulse" />
              All demos live · UPI · Cards · Wallets
            </span>
          </div>

          {/* Payment Methods */}
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-indigo-400 mb-4">
              Payment Methods
            </div>
            <ul className="flex flex-col gap-2.5 list-none">
              {METHODS.map((m) => (
                <li key={m.label}>
                  <a
                    href={m.href}
                    className="text-[13.5px] text-[#7b7b9a] no-underline transition-colors duration-200 hover:text-[#e8e8f0]"
                  >
                    {m.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Site */}
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-indigo-400 mb-4">
              Site
            </div>
            <ul className="flex flex-col gap-2.5 list-none">
              {SITE.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    className="text-[13.5px] text-[#7b7b9a] no-underline transition-colors duration-200 hover:text-[#e8e8f0]"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Built With */}
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-indigo-400 mb-4">
              Built With
            </div>
            <ul className="flex flex-col gap-2.5 list-none">
              {TECH.map((t) => (
                <li key={t.label}>
                  <a
                    href={t.href}
                    className="text-[13.5px] text-[#7b7b9a] no-underline transition-colors duration-200 hover:text-[#e8e8f0]"
                  >
                    {t.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-7">
          <p className="text-[12.5px] text-[#7b7b9a]">
            © {year} paymentlab · Built as a portfolio project ·{" "}
            <a href="#journey" className="text-indigo-400 no-underline hover:underline">
              Read the case study
            </a>
          </p>

          <a
            href="#"
            className="inline-flex items-center gap-2 text-[12.5px] font-medium text-[#7b7b9a] no-underline border border-white/[0.08] rounded-lg px-3 py-1.5 transition-all duration-200 hover:text-[#e8e8f0] hover:border-white/[0.18]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="opacity-70">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            View on GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}