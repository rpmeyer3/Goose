import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FadeInSection, StaggerContainer, StaggerItem, TiltCard } from "../components/MagicEffects";

const COLORS = [
  "bg-wizard-crimson/20 text-red-300",
  "bg-sky-900/30 text-sky-300",
  "bg-wizard-gold/20 text-wizard-gold",
  "bg-wizard-emerald/20 text-emerald-300",
  "bg-violet-900/30 text-violet-300",
  "bg-orange-900/30 text-orange-300",
  "bg-teal-900/30 text-teal-300",
  "bg-pink-900/30 text-pink-300",
];

const BAR_COLORS = [
  "from-red-500 to-red-400",
  "from-sky-500 to-sky-400",
  "from-wizard-gold to-wizard-gold-light",
  "from-emerald-500 to-emerald-400",
  "from-violet-500 to-violet-400",
  "from-orange-500 to-orange-400",
  "from-teal-500 to-teal-400",
  "from-pink-500 to-pink-400",
];

/**
 * Component to display the Gemini AI generated summary from Gringotts
 */
function AdvisorSection({ summary }) {
  return (
    <FadeInSection delay={0.1}>
      <TiltCard>
        <motion.div
          className="spell-card relative overflow-hidden mb-10 p-8 rounded-2xl border border-wizard-gold/30 bg-wizard-deep/40 backdrop-blur-md shadow-glow-sm"
          whileHover={{ boxShadow: "0 0 30px rgba(212, 168, 67, 0.15)" }}
        >
          {/* Decorative Top Border */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-wizard-gold/50 to-transparent" />

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">📜</span>
            <h2 className="text-xl font-display font-bold text-wizard-gold tracking-wide">
              Gringotts Financial Prophecy
            </h2>
          </div>

          <p className="text-parchment/90 font-serif italic leading-relaxed text-lg relative z-10">
            {summary}
          </p>

          {/* Floating magical background icon */}
          <motion.div
            className="absolute -bottom-2 -right-2 text-6xl opacity-10 pointer-events-none"
            animate={{ rotate: [0, 10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            ⚖️
          </motion.div>
        </motion.div>
      </TiltCard>
    </FadeInSection>
  );
}

function StatCard({ label, value, accent, sub, icon, delay = 0 }) {
  return (
    <TiltCard>
      <motion.div
        className="spell-card rounded-2xl p-6 animate-pulse-glow"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
      >
        {icon && <div className="text-2xl mb-2">{icon}</div>}
        <p className="text-sm text-parchment/50 mb-1 font-serif">{label}</p>
        <p className={`text-2xl font-display font-bold ${accent}`}>{value}</p>
        {sub && <p className="text-xs text-parchment/40 mt-1">{sub}</p>}
      </motion.div>
    </TiltCard>
  );
}

function fmt(n) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function prettyCat(name) {
  const WIZARD_NAMES = {
    potions_ingredients: "Potions & Elixirs",
    magical_supplies: "Magical Provisions",
    books_education: "Spellbooks & Scrolls",
    food_dining: "Sustenance & Feasts",
    clothing_robes: "Robes & Garments",
    transportation: "Broomsticks & Portkeys",
    entertainment: "Enchanted Amusements",
    healthcare: "Healing & Remedies",
    pets_familiars: "Familiars & Creatures",
    utilities_services: "Owl Post & Utilities",
    defense_equipment: "Dark Arts Defense",
  };
  return WIZARD_NAMES[name] || name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Budget({ data }) {
  const navigate = useNavigate();

  // Empty state if no data is passed
  if (!data) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <motion.div
          className="text-6xl mb-4"
          animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          🔮
        </motion.div>
        <FadeInSection>
          <h2 className="text-2xl font-display font-bold mb-3 text-wizard-gold">The Vault is Empty</h2>
          <p className="text-parchment/50 mb-8 font-serif italic">
            No parchments have been enchanted yet. Present a scroll to unlock thy vault.
          </p>
          <motion.button
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(212, 168, 67, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-xl font-display font-bold tracking-wider text-dark-wizard bg-gradient-to-r from-wizard-gold to-wizard-gold-light hover:from-wizard-gold-light hover:to-wizard-gold transition-all duration-300 shadow-glow wand-trail"
          >
            🪄 Summon a Scroll
          </motion.button>
        </FadeInSection>
      </div>
    );
  }

  const { metrics, advisor_summary } = data;
  const leftOver = metrics.left_over;
  const categories = Object.entries(metrics.category_spending).sort(
    (a, b) => b[1] - a[1]
  );
  const maxSpend = categories.length ? categories[0][1] : 1;
  const dailyEntries = Object.entries(metrics.daily_spending || {}).sort(
    (a, b) => a[0].localeCompare(b[0])
  );
  const maxDaily = dailyEntries.length
    ? Math.max(...dailyEntries.map(([, v]) => v))
    : 1;

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <FadeInSection>
        <h1 className="text-3xl font-display font-bold mb-8 text-wizard-gold drop-shadow-[0_0_12px_rgba(212,168,67,0.4)]">
          📜 Vault Overview
        </h1>
      </FadeInSection>

      {/* 1. Gemini AI Advisor Section */}
      {advisor_summary && <AdvisorSection summary={advisor_summary} />}

      <h1 className="text-3xl font-display font-bold mb-8 text-wizard-gold drop-shadow-[0_0_12px_rgba(212,168,67,0.4)]">
          💲 Breakdown
      </h1>
      {/* 2. Top-level Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Galleons Earned"
          value={fmt(metrics.total_income)}
          accent="text-emerald-400"
          icon="💰"
          delay={0.1}
        />
        <StatCard
          label="Galleons Spent"
          value={fmt(metrics.total_spent)}
          accent="text-red-400"
          icon="🔥"
          delay={0.2}
        />
        <StatCard
          label="Vault Remainder"
          value={fmt(leftOver)}
          accent={leftOver >= 0 ? "text-emerald-400" : "text-red-400"}
          icon={leftOver >= 0 ? "✨" : "💀"}
          delay={0.3}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {metrics.category_most_spent && (
          <StatCard
            label="Most Bewitching Category"
            value={prettyCat(metrics.category_most_spent)}
            accent="text-red-400"
            sub={fmt(metrics.category_spending[metrics.category_most_spent])}
            icon="🧨"
            delay={0.4}
          />
        )}
        {metrics.category_least_spent && (
          <StatCard
            label="Most Frugal Enchantment"
            value={prettyCat(metrics.category_least_spent)}
            accent="text-sky-400"
            sub={fmt(metrics.category_spending[metrics.category_least_spent])}
            icon="🪙"
            delay={0.5}
          />
        )}
      </div>

      {/* 3. Category Spending Bars */}
      <FadeInSection delay={0.2}>
        <h2 className="text-xl font-display font-semibold mb-5 text-wizard-gold-light">Spending by Enchantment</h2>
      </FadeInSection>

      <StaggerContainer className="space-y-4 mb-12" stagger={0.08}>
        {categories.map(([category, amount], i) => {
          const pct = Math.round((amount / maxSpend) * 100);
          const color = COLORS[i % COLORS.length];
          const barColor = BAR_COLORS[i % BAR_COLORS.length];

          return (
            <StaggerItem key={category}>
              <motion.div whileHover={{ x: 4, transition: { duration: 0.2 } }}>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-display font-semibold px-2.5 py-0.5 rounded-full ${color}`}
                  >
                    {prettyCat(category)}
                  </span>
                  <span className="text-sm font-medium text-parchment/70">
                    {fmt(amount)}
                  </span>
                </div>
                <div className="w-full bg-wizard-slate rounded-full h-3 overflow-hidden">
                  <motion.div
                    className={`h-3 rounded-full bg-gradient-to-r ${barColor} shadow-glow`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            </StaggerItem>
          );
        })}

        {categories.length === 0 && (
          <p className="text-parchment/40 text-center py-8 font-serif italic">
            No enchantment categories detected in thy scroll.
          </p>
        )}
      </StaggerContainer>

      {/* 4. Daily Spending Chart */}
      {dailyEntries.length > 0 && (() => {
        const CHART_W = 700;
        const CHART_H = 220;
        const PAD = { top: 20, right: 20, bottom: 50, left: 60 };
        const plotW = CHART_W - PAD.left - PAD.right;
        const plotH = CHART_H - PAD.top - PAD.bottom;

        const niceMax = Math.ceil(maxDaily / 50) * 50 || 50;
        const yTicks = [];
        const yStep = niceMax <= 200 ? 50 : niceMax <= 500 ? 100 : Math.ceil(niceMax / 5 / 100) * 100;
        for (let v = 0; v <= niceMax; v += yStep) yTicks.push(v);

        const points = dailyEntries.map(([date, amount], i) => {
          const x = PAD.left + (dailyEntries.length === 1 ? plotW / 2 : (i / (dailyEntries.length - 1)) * plotW);
          const y = PAD.top + plotH - (amount / niceMax) * plotH;
          return { x, y, date, amount };
        });

        const lineD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
        const areaD = `${lineD} L${points[points.length - 1].x},${PAD.top + plotH} L${points[0].x},${PAD.top + plotH} Z`;

        return (
          <>
            <FadeInSection delay={0.1}>
              <h2 className="text-xl font-display font-semibold mb-5 text-wizard-gold-light">Daily Enchantments</h2>
            </FadeInSection>
            <FadeInSection delay={0.2}>
              <motion.div
                className="spell-card rounded-2xl p-6 mb-12 overflow-hidden"
                whileHover={{ boxShadow: "0 0 30px rgba(212, 168, 67, 0.2)" }}
              >
              <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4a843" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#d4a843" stopOpacity="0.03" />
                  </linearGradient>
                </defs>
                {yTicks.map((v) => {
                  const y = PAD.top + plotH - (v / niceMax) * plotH;
                  return (
                    <g key={v}>
                      <line x1={PAD.left} x2={PAD.left + plotW} y1={y} y2={y} stroke="#3d3566" strokeWidth="1" />
                      <text x={PAD.left - 8} y={y + 3} textAnchor="end" fontSize="10" fill="#8b7eb8">${v}</text>
                    </g>
                  );
                })}
                <path d={areaD} fill="url(#areaGrad)" />
                <path d={lineD} fill="none" stroke="#d4a843" strokeWidth="2.5" strokeLinejoin="round" />
                {points.map((p) => (
                  <g key={p.date} className="group">
                    <circle cx={p.x} cy={p.y} r="10" fill="transparent" className="cursor-pointer" />
                    <circle cx={p.x} cy={p.y} r="4" fill="#d4a843" stroke="#0d0221" strokeWidth="2" />
                  </g>
                ))}
              </svg>
              </motion.div>
            </FadeInSection>
          </>
        );
      })()}

      {/* 5. Full Transaction Ledger */}
      <FadeInSection delay={0.1}>
        <div className="pt-8 border-t border-wizard-gold/20">
          <h2 className="text-xl font-display font-semibold mb-4 text-wizard-gold-light">📖 Transaction Ledger</h2>
          <div className="overflow-x-auto rounded-xl border border-wizard-gold/20">
            <table className="w-full text-sm text-left">
              <thead className="bg-wizard-deep text-wizard-gold/70 uppercase text-xs font-display tracking-wider">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wizard-gold/10">
                {data.transactions.map((tx, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(i * 0.03, 1), duration: 0.3 }}
                    whileHover={{ backgroundColor: "rgba(45, 27, 105, 0.5)" }}
                    className="transition-colors cursor-default"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-parchment/70">{tx.date}</td>
                    <td className="px-4 py-3 text-parchment/80">{tx.description}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-display font-medium px-2 py-0.5 rounded-full bg-wizard-slate text-wizard-gold/80">
                        {prettyCat(tx.category)}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${tx.amount >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {fmt(tx.amount)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FadeInSection>
    </div>
  );
}