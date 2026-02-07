import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../supabase/AuthContext";
import { supabase } from "../supabase/client";

const TABS = [
  { key: "profile", label: "🧙 Profile" },
  { key: "preferences", label: "⚙️ Preferences" },
];

const CURRENCIES = ["USD", "EUR", "GBP", "GAL"];

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ── Profile fields ──
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // ── Preference fields ──
  const [currency, setCurrency] = useState("USD");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [savingsGoal, setSavingsGoal] = useState("");
  const [defaultBank, setDefaultBank] = useState("");
  const [notifyOverspend, setNotifyOverspend] = useState(true);
  const [notifyWeekly, setNotifyWeekly] = useState(true);
  const [notifyAiTips, setNotifyAiTips] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // Populate from existing profile
  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.first_name || "");
    setLastName(profile.last_name || "");
    setPhone(profile.phone || "");
    setAvatarUrl(profile.avatar_url || "");
    setCurrency(profile.preferred_currency || "USD");
    setMonthlyBudget(profile.monthly_budget_goal ?? "");
    setSavingsGoal(profile.savings_goal ?? "");
    setDefaultBank(profile.default_bank || "");
    setNotifyOverspend(profile.notify_overspend ?? true);
    setNotifyWeekly(profile.notify_weekly_recap ?? true);
    setNotifyAiTips(profile.notify_ai_tips ?? true);
    setDarkMode(profile.dark_mode ?? true);
  }, [profile]);

  function clearMessages() {
    setSuccess("");
    setError("");
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    clearMessages();
    setSaving(true);

    const { error: err } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim(),
        phone,
        avatar_url: avatarUrl,
      })
      .eq("id", user.id);

    if (err) {
      setError(err.message);
    } else {
      setSuccess("Profile updated!");
      await refreshProfile();
    }
    setSaving(false);
  }

  async function handleSavePreferences(e) {
    e.preventDefault();
    clearMessages();
    setSaving(true);

    const { error: err } = await supabase
      .from("profiles")
      .update({
        preferred_currency: currency,
        monthly_budget_goal: monthlyBudget === "" ? null : Number(monthlyBudget),
        savings_goal: savingsGoal === "" ? null : Number(savingsGoal),
        default_bank: defaultBank,
        notify_overspend: notifyOverspend,
        notify_weekly_recap: notifyWeekly,
        notify_ai_tips: notifyAiTips,
        dark_mode: darkMode,
      })
      .eq("id", user.id);

    if (err) {
      setError(err.message);
    } else {
      setSuccess("Preferences saved!");
      await refreshProfile();
    }
    setSaving(false);
  }

  const inputClass =
    "w-full rounded-lg border border-wizard-gold/20 bg-dark-wizard/60 px-4 py-2.5 text-parchment placeholder-parchment/30 focus:border-wizard-gold/60 focus:ring-2 focus:ring-wizard-gold/20 focus:outline-none transition-all";

  const labelClass =
    "block text-sm font-display font-semibold text-wizard-gold/80 mb-1.5 tracking-wide";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-wizard-gold tracking-widest drop-shadow-[0_0_8px_rgba(212,168,67,0.5)]">
            Wizard Profile
          </h1>
          {profile && (
            <p className="text-parchment/50 font-serif mt-2">
              Rank: <span className="text-wizard-gold">{profile.wizard_rank}</span>
              {" · "}
              {profile.total_analyses} {profile.total_analyses === 1 ? "analysis" : "analyses"}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 justify-center">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                clearMessages();
              }}
              className={`px-5 py-2.5 rounded-lg text-sm font-display font-semibold tracking-wide transition-all duration-300 ${
                activeTab === tab.key
                  ? "bg-wizard-gold/20 text-wizard-gold border border-wizard-gold/40 shadow-glow"
                  : "text-parchment/60 hover:text-wizard-gold hover:bg-wizard-purple/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-lg border border-wizard-crimson/50 bg-wizard-crimson/10 px-4 py-3"
          >
            <p className="text-sm text-red-300">{error}</p>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-lg border border-wizard-emerald/50 bg-wizard-emerald/10 px-4 py-3"
          >
            <p className="text-sm text-green-300">{success}</p>
          </motion.div>
        )}

        {/* ─── Profile Tab ───────────────────────────────── */}
        {activeTab === "profile" && (
          <motion.form
            key="profile"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSaveProfile}
            className="spell-card rounded-2xl p-8 space-y-5"
          >
            {/* Avatar preview */}
            <div className="flex justify-center mb-2">
              <div className="h-20 w-20 rounded-full border-2 border-wizard-gold/40 bg-wizard-purple/30 flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">🧙</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="prof-first" className={labelClass}>First Name</label>
                <input
                  id="prof-first"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputClass}
                  placeholder="Harry"
                />
              </div>
              <div>
                <label htmlFor="prof-last" className={labelClass}>Last Name</label>
                <input
                  id="prof-last"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputClass}
                  placeholder="Potter"
                />
              </div>
            </div>

            <div>
              <label htmlFor="prof-email" className={labelClass}>Email</label>
              <input
                id="prof-email"
                type="email"
                value={user?.email || ""}
                disabled
                className={`${inputClass} opacity-50 cursor-not-allowed`}
              />
              <p className="text-xs text-parchment/30 mt-1 font-serif">
                Email is managed by Supabase Auth and cannot be changed here.
              </p>
            </div>

            <div>
              <label htmlFor="prof-phone" className={labelClass}>Phone</label>
              <input
                id="prof-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                placeholder="+1 555-0123"
              />
            </div>

            <div>
              <label htmlFor="prof-avatar" className={labelClass}>Avatar URL</label>
              <input
                id="prof-avatar"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className={inputClass}
                placeholder="https://example.com/avatar.png"
              />
            </div>

            <motion.button
              type="submit"
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-lg bg-wizard-gold/90 hover:bg-wizard-gold px-4 py-3 font-display font-bold text-dark-wizard tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-glow"
            >
              {saving ? "Saving…" : "Save Profile"}
            </motion.button>
          </motion.form>
        )}

        {/* ─── Preferences Tab ───────────────────────────── */}
        {activeTab === "preferences" && (
          <motion.form
            key="preferences"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSavePreferences}
            className="spell-card rounded-2xl p-8 space-y-5"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="pref-currency" className={labelClass}>Currency</label>
                <select
                  id="pref-currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={inputClass}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="pref-bank" className={labelClass}>Default Bank</label>
                <input
                  id="pref-bank"
                  type="text"
                  value={defaultBank}
                  onChange={(e) => setDefaultBank(e.target.value)}
                  className={inputClass}
                  placeholder="Gringotts"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="pref-budget" className={labelClass}>Monthly Budget</label>
                <input
                  id="pref-budget"
                  type="number"
                  step="0.01"
                  min="0"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  className={inputClass}
                  placeholder="2000.00"
                />
              </div>
              <div>
                <label htmlFor="pref-savings" className={labelClass}>Savings Goal</label>
                <input
                  id="pref-savings"
                  type="number"
                  step="0.01"
                  min="0"
                  value={savingsGoal}
                  onChange={(e) => setSavingsGoal(e.target.value)}
                  className={inputClass}
                  placeholder="500.00"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-2">
              <p className={labelClass}>Notifications</p>
              {[
                { label: "Overspend alerts", value: notifyOverspend, set: setNotifyOverspend },
                { label: "Weekly recap", value: notifyWeekly, set: setNotifyWeekly },
                { label: "AI advisor tips", value: notifyAiTips, set: setNotifyAiTips },
                { label: "Dark mode", value: darkMode, set: setDarkMode },
              ].map((toggle) => (
                <label
                  key={toggle.label}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-wizard-purple/20 transition-colors cursor-pointer"
                >
                  <span className="text-parchment/70 font-serif text-sm">{toggle.label}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={toggle.value}
                    onClick={() => toggle.set(!toggle.value)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
                      toggle.value ? "bg-wizard-gold/80" : "bg-wizard-slate"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-dark-wizard transition-transform duration-300 ${
                        toggle.value ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </label>
              ))}
            </div>

            <motion.button
              type="submit"
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-lg bg-wizard-gold/90 hover:bg-wizard-gold px-4 py-3 font-display font-bold text-dark-wizard tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-glow"
            >
              {saving ? "Saving…" : "Save Preferences"}
            </motion.button>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
}
