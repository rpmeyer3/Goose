import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../supabase/AuthContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    setMenuOpen(false);
    navigate("/login");
  }

  const displayName =
    profile?.first_name || user?.user_metadata?.first_name || null;

  const link = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-display font-semibold tracking-wide transition-all duration-300 ${
      isActive
        ? "bg-wizard-gold/20 text-wizard-gold border border-wizard-gold/40 shadow-glow"
        : "text-parchment/70 hover:text-wizard-gold hover:bg-wizard-purple/50"
    }`;

  const mobileLink = ({ isActive }) =>
    `block px-4 py-3 rounded-lg text-base font-display font-semibold tracking-wide transition-all duration-300 ${
      isActive
        ? "bg-wizard-gold/20 text-wizard-gold border border-wizard-gold/40 shadow-glow"
        : "text-parchment/70 hover:text-wizard-gold hover:bg-wizard-purple/50"
    }`;

  const publicItems = [
    { to: "/", label: "🪄 Summon" },
    { to: "/about", label: "🔮 Oracle" },
  ];

  const authedItems = [
    { to: "/dashboard", label: "📊 Rundown" },
    { to: "/budget", label: "📜 Vault" },
    { to: "/statements", label: "🗂️ Archive" },
    { to: "/chat", label: "💬 Advisor" },
    { to: "/profile", label: "🧙 Profile" },
  ];

  const navItems = user
    ? [{ to: "/", label: "🪄 Summon" }, ...authedItems]
    : publicItems;

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-dark-wizard/90 backdrop-blur-md border-b border-wizard-gold/20"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        <motion.div
          className="flex items-center gap-2 sm:gap-3"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.img
            src="/bytehacks11.png"
            alt="Byte's Bank"
            className="h-8 w-8 sm:h-10 sm:w-10"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-lg sm:text-xl font-display font-bold tracking-widest text-wizard-gold drop-shadow-[0_0_8px_rgba(212,168,67,0.5)]">
            Byte's Bank
          </span>
        </motion.div>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-2">
          {navItems.map((item, i) => (
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

          {/* Auth section */}
          {user ? (
            <div className="flex items-center gap-3 ml-3 pl-3 border-l border-wizard-gold/20">
              {displayName && (
                <span className="text-sm text-parchment/70 font-serif">
                  ⚡ {displayName}
                </span>
              )}
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-lg text-sm font-display font-semibold text-parchment/60 hover:text-wizard-crimson hover:bg-wizard-crimson/10 border border-transparent hover:border-wizard-crimson/30 transition-all duration-300"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-3 pl-3 border-l border-wizard-gold/20">
              <NavLink
                to="/login"
                className="px-4 py-2 rounded-lg text-sm font-display font-semibold text-parchment/70 hover:text-wizard-gold hover:bg-wizard-purple/50 transition-all duration-300"
              >
                Sign In
              </NavLink>
              <NavLink
                to="/signup"
                className="px-4 py-2 rounded-lg text-sm font-display font-semibold bg-wizard-gold/90 hover:bg-wizard-gold text-dark-wizard tracking-wide transition-colors shadow-glow"
              >
                Sign Up
              </NavLink>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <motion.span
            animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            className="block w-6 h-0.5 bg-wizard-gold rounded"
          />
          <motion.span
            animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
            className="block w-6 h-0.5 bg-wizard-gold rounded"
          />
          <motion.span
            animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            className="block w-6 h-0.5 bg-wizard-gold rounded"
          />
        </button>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="sm:hidden overflow-hidden bg-dark-wizard/95 backdrop-blur-md border-t border-wizard-gold/10"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={mobileLink}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}

              {/* Mobile auth section */}
              <div className="mt-2 pt-2 border-t border-wizard-gold/10">
                {user ? (
                  <>
                    {displayName && (
                      <p className="px-4 py-2 text-sm text-parchment/50 font-serif">
                        ⚡ {displayName}
                      </p>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-3 rounded-lg text-base font-display font-semibold text-parchment/60 hover:text-wizard-crimson hover:bg-wizard-crimson/10 transition-all duration-300"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink
                      to="/login"
                      className={mobileLink}
                      onClick={() => setMenuOpen(false)}
                    >
                      Sign In
                    </NavLink>
                    <NavLink
                      to="/signup"
                      className={mobileLink}
                      onClick={() => setMenuOpen(false)}
                    >
                      Sign Up
                    </NavLink>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
