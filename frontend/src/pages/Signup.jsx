import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../supabase/AuthContext";

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { error: authError } = await signUp({
      email,
      password,
      firstName,
      lastName,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Supabase sends a confirmation email by default.
    // If email confirmation is disabled in your project settings,
    // the user is signed in immediately and we can redirect.
    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="spell-card rounded-2xl p-8 sm:p-10 max-w-md w-full text-center"
        >
          <div className="text-5xl mb-4">🦉</div>
          <h2 className="text-2xl font-display font-bold text-wizard-gold tracking-widest mb-3">
            Owl Dispatched!
          </h2>
          <p className="text-parchment/70 font-serif leading-relaxed">
            Check your email for a confirmation link. Once confirmed, you can{" "}
            <Link
              to="/login"
              className="text-wizard-gold hover:text-wizard-gold-light font-semibold transition-colors"
            >
              sign in
            </Link>
            .
          </p>
        </motion.div>
      </div>
    );
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
              Enroll at Gringotts
            </motion.h1>
            <p className="text-parchment/60 mt-2 font-serif">
              Create your wizarding account
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
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="signup-first"
                  className="block text-sm font-display font-semibold text-wizard-gold/80 mb-1.5 tracking-wide"
                >
                  First Name
                </label>
                <input
                  id="signup-first"
                  type="text"
                  required
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-lg border border-wizard-gold/20 bg-dark-wizard/60 px-4 py-2.5 text-parchment placeholder-parchment/30 focus:border-wizard-gold/60 focus:ring-2 focus:ring-wizard-gold/20 focus:outline-none transition-all"
                  placeholder="Arthur"
                />
              </div>
              <div>
                <label
                  htmlFor="signup-last"
                  className="block text-sm font-display font-semibold text-wizard-gold/80 mb-1.5 tracking-wide"
                >
                  Last Name
                </label>
                <input
                  id="signup-last"
                  type="text"
                  required
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-lg border border-wizard-gold/20 bg-dark-wizard/60 px-4 py-2.5 text-parchment placeholder-parchment/30 focus:border-wizard-gold/60 focus:ring-2 focus:ring-wizard-gold/20 focus:outline-none transition-all"
                  placeholder="Weasly"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="signup-email"
                className="block text-sm font-display font-semibold text-wizard-gold/80 mb-1.5 tracking-wide"
              >
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-wizard-gold/20 bg-dark-wizard/60 px-4 py-2.5 text-parchment placeholder-parchment/30 focus:border-wizard-gold/60 focus:ring-2 focus:ring-wizard-gold/20 focus:outline-none transition-all"
                placeholder="aweasly@gryffins.com.uk"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="signup-password"
                className="block text-sm font-display font-semibold text-wizard-gold/80 mb-1.5 tracking-wide"
              >
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-wizard-gold/20 bg-dark-wizard/60 px-4 py-2.5 text-parchment placeholder-parchment/30 focus:border-wizard-gold/60 focus:ring-2 focus:ring-wizard-gold/20 focus:outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="signup-confirm"
                className="block text-sm font-display font-semibold text-wizard-gold/80 mb-1.5 tracking-wide"
              >
                Confirm Password
              </label>
              <input
                id="signup-confirm"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? "Enrolling…" : "Create Account"}
            </motion.button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-parchment/50">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-wizard-gold hover:text-wizard-gold-light transition-colors font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
