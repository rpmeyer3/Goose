import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../supabase/AuthContext";
import {
  Wand2,
  BarChart3,
  ScrollText,
  FolderArchive,
  MessageCircle,
  UserCircle,
  Sparkles,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
} from "lucide-react";

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

  const linkClass = ({ isActive }) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-display font-semibold tracking-wide transition-all duration-200 ${
      isActive
        ? "bg-wizard-gold/15 text-wizard-gold shadow-[inset_0_0_0_1px_rgba(212,168,67,0.3)]"
        : "text-parchment/60 hover:text-wizard-gold hover:bg-wizard-purple/40"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-4 py-3 rounded-lg text-base font-display font-semibold tracking-wide transition-all duration-200 ${
      isActive
        ? "bg-wizard-gold/15 text-wizard-gold shadow-[inset_0_0_0_1px_rgba(212,168,67,0.3)]"
        : "text-parchment/60 hover:text-wizard-gold hover:bg-wizard-purple/40"
    }`;

  const iconSize = 16;

  const publicItems = [
    { to: "/", icon: <Wand2 size={iconSize} />, label: "Summon" },
    { to: "/about", icon: <Sparkles size={iconSize} />, label: "Oracle" },
  ];

  const authedItems = [
    { to: "/dashboard", icon: <BarChart3 size={iconSize} />, label: "Rundown" },
    { to: "/budget", icon: <ScrollText size={iconSize} />, label: "Vault" },
    { to: "/statements", icon: <FolderArchive size={iconSize} />, label: "Archive" },
    { to: "/chat", icon: <MessageCircle size={iconSize} />, label: "Advisor" },
    { to: "/profile", icon: <UserCircle size={iconSize} />, label: "Profile" },
  ];

  const navItems = user
    ? [{ to: "/", icon: <Wand2 size={iconSize} />, label: "Summon" }, ...authedItems]
    : publicItems;

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-dark-wizard/90 backdrop-blur-md border-b border-wizard-gold/20"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 shrink-0">
          <motion.img
            src="/bytehacks11.png"
            alt="Byte's Bank"
            className="h-8 w-8"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-lg font-display font-bold tracking-widest text-wizard-gold drop-shadow-[0_0_8px_rgba(212,168,67,0.5)]">
            Byte's Bank
          </span>
        </NavLink>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Auth section */}
          <div className="ml-2 pl-3 border-l border-wizard-gold/15 flex items-center gap-2">
            {user ? (
              <>
                {displayName && (
                  <span className="text-sm text-parchment/50 font-serif hidden lg:inline">
                    {displayName}
                  </span>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-display font-semibold text-parchment/50 hover:text-wizard-crimson hover:bg-wizard-crimson/10 transition-all duration-200"
                >
                  <LogOut size={iconSize} />
                  <span className="hidden lg:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-display font-semibold text-parchment/60 hover:text-wizard-gold hover:bg-wizard-purple/40 transition-all duration-200"
                >
                  <LogIn size={iconSize} />
                  <span>Sign In</span>
                </NavLink>
                <NavLink
                  to="/signup"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-display font-semibold bg-wizard-gold/90 hover:bg-wizard-gold text-dark-wizard tracking-wide transition-colors shadow-glow"
                >
                  <UserPlus size={iconSize} />
                  <span>Sign Up</span>
                </NavLink>
              </>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-wizard-gold"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-dark-wizard/95 backdrop-blur-md border-t border-wizard-gold/10"
          >
            <div className="flex flex-col gap-0.5 px-4 py-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={mobileLinkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}

              <div className="mt-2 pt-2 border-t border-wizard-gold/10">
                {user ? (
                  <>
                    {displayName && (
                      <p className="px-4 py-2 text-sm text-parchment/40 font-serif">
                        Signed in as {displayName}
                      </p>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2.5 w-full text-left px-4 py-3 rounded-lg text-base font-display font-semibold text-parchment/50 hover:text-wizard-crimson hover:bg-wizard-crimson/10 transition-all duration-200"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink
                      to="/login"
                      className={mobileLinkClass}
                      onClick={() => setMenuOpen(false)}
                    >
                      <LogIn size={18} />
                      Sign In
                    </NavLink>
                    <NavLink
                      to="/signup"
                      className={mobileLinkClass}
                      onClick={() => setMenuOpen(false)}
                    >
                      <UserPlus size={18} />
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
