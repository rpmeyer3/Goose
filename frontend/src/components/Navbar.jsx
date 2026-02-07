import { NavLink } from "react-router-dom";

export default function Navbar() {
  const link = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-display font-semibold tracking-wide transition-all duration-300 ${
      isActive
        ? "bg-wizard-gold/20 text-wizard-gold border border-wizard-gold/40 shadow-glow"
        : "text-parchment/70 hover:text-wizard-gold hover:bg-wizard-purple/50"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-dark-wizard/90 backdrop-blur-md border-b border-wizard-gold/20">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <img src="/bytehacks11.png" alt="Byte's Bank" className="h-10 w-10" />
          <span className="text-xl font-display font-bold tracking-widest text-wizard-gold drop-shadow-[0_0_8px_rgba(212,168,67,0.5)]">
            Byte's Bank
          </span>
        </div>
        <div className="flex gap-2">
          <NavLink to="/" className={link}>
            🪄 Summon
          </NavLink>
          <NavLink to="/budget" className={link}>
            📜 Vault
          </NavLink>
          <NavLink to="/about" className={link}>
            🔮 Oracle
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
