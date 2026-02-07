const MEMBERS = [
  {
    name: "Igor Goncalves",
    role: "Dark Arts of Data",
    desc: "Conjured the Naive Bayes classification enchantment that sorts every Galleon into its rightful category.",
    emoji: "🧙‍♂️",
  },
  {
    name: "Jordan Delp",
    role: "Keeper of the Backend",
    desc: "Forged the FastAPI cauldron, PDF extraction spell, and the data processing incantations.",
    emoji: "⚗️",
  },
  {
    name: "Ryan Meyer",
    role: "Charm of the Interface",
    desc: "Enchanted the React scroll-face, summoning flow, and vault visualization chamber.",
    emoji: "✨",
  },
];

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <h1 className="text-3xl font-display font-bold mb-3 text-wizard-gold drop-shadow-[0_0_12px_rgba(212,168,67,0.4)]">
        🔮 About Byte's Bank
      </h1>
      <p className="text-parchment/50 mb-10 max-w-xl font-serif italic">
        Byte's Bank is a magical bank statement analyzer forged at UGA Hacks 11. Present
        a parchment scroll (PDF) and the enchantment shall reveal all thy income, spending habits,
        and category-level breakdowns — powered by arcane machine learning sorcery.
      </p>

      <div className="mb-12">
        <h2 className="text-xl font-display font-semibold mb-2 text-wizard-gold-light">📜 How the Magic Works</h2>
        <ol className="list-decimal list-inside space-y-2 text-parchment/60 text-sm leading-relaxed font-serif">
          <li>Present thy bank statement parchment (PDF) from the Summoning page.</li>
          <li>The backend cauldron extracts transaction runes using pdfplumber.</li>
          <li>Each transaction is classified by a Naive Bayes sorting charm trained on TF-IDF enchantments.</li>
          <li>Summary prophecies and a full ledger of transactions are conjured as JSON and rendered upon the Vault page.</li>
        </ol>
      </div>

      <h2 className="text-xl font-display font-semibold mb-5 text-wizard-gold-light">⚡ The Order of Developers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {MEMBERS.map((m) => (
          <div
            key={m.name}
            className="spell-card rounded-2xl p-6 hover:shadow-glow transition-all duration-300"
          >
            <div className="h-12 w-12 rounded-full bg-wizard-gold/15 text-wizard-gold flex items-center justify-center font-bold text-2xl mb-4 border border-wizard-gold/30">
              {m.emoji}
            </div>
            <h3 className="font-display font-semibold text-base text-parchment">{m.name}</h3>
            <p className="text-xs text-wizard-gold font-display font-medium mb-2">{m.role}</p>
            <p className="text-sm text-parchment/50 leading-relaxed font-serif">{m.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-wizard-gold/20 text-sm text-parchment/30 font-serif italic">
        Forged with React, FastAPI, scikit-learn, pdfplumber, and Tailwind CSS — under the light of a full moon. 🌕
      </div>
    </div>
  );
}
