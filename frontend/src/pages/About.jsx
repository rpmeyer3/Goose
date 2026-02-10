import { motion } from "framer-motion";
import { FadeInSection, StaggerContainer, StaggerItem, TiltCard } from "../components/MagicEffects";

const MEMBERS = [
  {
    name: "Igor Goncalves",
    role: "Dark Arts of Data",
    emoji: "🧙‍♂️",
  },
  {
    name: "Jordan Delp",
    role: "Keeper of the Backend",
    emoji: "⚗️",
  },
  {
    name: "Ryan Meyer",
    role: "Charm of the Interface",
    emoji: "✨",
  },
];

const STEPS = [
  { icon: "📜", text: "Present thy bank statement parchment (PDF) from the Summoning page." },
  { icon: "⚗️", text: "The backend cauldron extracts transaction runes using pdfplumber." },
  { icon: "🎩", text: "Each transaction is classified by a Naive Bayes sorting charm trained on TF-IDF enchantments." },
  { icon: "🔮", text: "Summary prophecies and a full ledger of transactions are conjured as JSON and rendered upon the Vault page." },
];

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <FadeInSection>
        <h1 className="text-3xl font-display font-bold mb-3 text-wizard-gold drop-shadow-[0_0_12px_rgba(212,168,67,0.4)]">
          🔮 About Byte's Bank
        </h1>
      </FadeInSection>

      <FadeInSection delay={0.15}>
        <p className="text-parchment/50 mb-8 sm:mb-10 max-w-xl font-serif italic text-sm sm:text-base">
          Byte's Bank is a magical bank statement analyzer forged at UGA Hacks 11. Present
          a parchment scroll (PDF) and the enchantment shall reveal all thy income, spending habits,
          and category-level breakdowns — powered by arcane machine learning sorcery.
        </p>
      </FadeInSection>

      <FadeInSection delay={0.2}>
        <div className="mb-12">
          <h2 className="text-xl font-display font-semibold mb-4 text-wizard-gold-light">📜 How the Magic Works</h2>
          <StaggerContainer className="space-y-4" stagger={0.12}>
            {STEPS.map((step, i) => (
              <StaggerItem key={i}>
                <motion.div
                  className="spell-card rounded-xl p-4 flex items-start gap-4"
                  whileHover={{ x: 8, boxShadow: "0 0 20px rgba(212, 168, 67, 0.2)", transition: { duration: 0.2 } }}
                >
                  <span className="text-2xl flex-shrink-0 mt-0.5">{step.icon}</span>
                  <div>
                    <span className="text-wizard-gold/50 font-display text-xs font-semibold mr-2">Step {i + 1}</span>
                    <span className="text-parchment/60 text-sm font-serif leading-relaxed">{step.text}</span>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </FadeInSection>

      <FadeInSection delay={0.1}>
        <h2 className="text-xl font-display font-semibold mb-5 text-wizard-gold-light">⚡ The Order of Developers</h2>
      </FadeInSection>

      <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5" stagger={0.15}>
        {MEMBERS.map((m) => (
          <StaggerItem key={m.name}>
            <TiltCard className="h-full">
              <div className="spell-card rounded-2xl p-6 h-full">
                <motion.div
                  className="h-14 w-14 rounded-full bg-wizard-gold/15 text-wizard-gold flex items-center justify-center font-bold text-3xl mb-4 border border-wizard-gold/30"
                  whileHover={{ scale: 1.2, rotate: 10, transition: { type: "spring" } }}
                >
                  {m.emoji}
                </motion.div>
                <h3 className="font-display font-semibold text-base text-parchment">{m.name}</h3>
                <p className="text-xs text-wizard-gold font-display font-medium mb-2">{m.role}</p>
              </div>
            </TiltCard>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <FadeInSection delay={0.3}>
        <motion.div
          className="mt-12 pt-8 border-t border-wizard-gold/20 text-sm text-parchment/30 font-serif italic text-center"
          whileHover={{ color: "rgba(212, 168, 67, 0.5)", transition: { duration: 0.3 } }}
        >
          Forged with React, FastAPI, scikit-learn, pdfplumber, and Tailwind CSS — under the light of a full moon. 🌕
        </motion.div>
      </FadeInSection>
    </div>
  );
}
