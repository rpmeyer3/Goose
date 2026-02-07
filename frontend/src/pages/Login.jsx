import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../supabase/AuthContext";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await signIn({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    navigate(from, { replace: true });
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <motion.div
        initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="spell-card rounded-2xl p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1
              className="text-3xl font-display font-bold text-wizard-gold tracking-widest drop-shadow-[0_0_8px_rgba(212,168,67,0.5)]"
              animate={{ textShadow: ["0 0 8px rgba(212,168,67,0.3)", "0 0 16px rgba(212,168,67,0.6)", "0 0 8px rgba(212,168,67,0.3)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Welcome Back
            </motion.h1>
            <p className="text-parchment/60 mt-2 font-serif">
              Enter your credentials to access the vault
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-lg border border-wizard-crimson/50 bg-wizard-crimson/10 px-4 py-3"
            >
              <p className="text-sm text-red-300">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-display font-semibold text-wizard-gold/80 mb-1.5 tracking-wide"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-wizard-gold/20 bg-dark-wizard/60 px-4 py-2.5 text-parchment placeholder-parchment/30 focus:border-wizard-gold/60 focus:ring-2 focus:ring-wizard-gold/20 focus:outline-none transition-all"
                placeholder="harry@hogwarts.edu"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-display font-semibold text-wizard-gold/80 mb-1.5 tracking-wide"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-wizard-gold/20 bg-dark-wizard/60 px-4 py-2.5 text-parchment placeholder-parchment/30 focus:border-wizard-gold/60 focus:ring-2 focus:ring-wizard-gold/20 focus:outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-lg bg-wizard-gold/90 hover:bg-wizard-gold px-4 py-3 font-display font-bold text-dark-wizard tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-glow"
            >
              {loading ? "Casting spell…" : "Sign In"}
            </motion.button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-parchment/50">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-wizard-gold hover:text-wizard-gold-light transition-colors font-semibold"
            >
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
