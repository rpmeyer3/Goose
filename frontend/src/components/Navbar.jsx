import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

export default function Navbar() {
  const link = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-display font-semibold tracking-wide transition-all duration-300 ${
      isActive
        ? "bg-wizard-gold/20 text-wizard-gold border border-wizard-gold/40 shadow-glow"
        : "text-parchment/70 hover:text-wizard-gold hover:bg-wizard-purple/50"
    }`;

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-dark-wizard/90 backdrop-blur-md border-b border-wizard-gold/20"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3">
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.img
            src="/bytehacks11.png"
            alt="Byte's Bank"
            className="h-10 w-10"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-xl font-display font-bold tracking-widest text-wizard-gold drop-shadow-[0_0_8px_rgba(212,168,67,0.5)]">
            Byte's Bank
          </span>
        </motion.div>
        <div className="flex gap-2">
          {[
            { to: "/", label: "🪄 Summon" },
            { to: "/budget", label: "📜 Vault" },
            { to: "/about", label: "🔮 Oracle" },
          ].map((item, i) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
            >
              <NavLink to={item.to} className={link}>
                {item.label}
              </NavLink>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}
