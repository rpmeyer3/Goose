import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../supabase/AuthContext";
import { supabase } from "../supabase/client";

export default function Statements() {
  const { user } = useAuth();

  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // expanded statement
  const [error, setError] = useState("");

  // ── Fetch user's statements ────────────────────────────
  useEffect(() => {
    if (!user) return;
    fetchStatements();
  }, [user]);

  async function fetchStatements() {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("bank_statements")
      .select("*")
      .eq("user_id", user.id)
      .order("statement_date", { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setStatements(data || []);
    }
    setLoading(false);
  }

  // ── Delete a statement ─────────────────────────────────
  async function handleDelete(id) {
    const { error: err } = await supabase
      .from("bank_statements")
      .delete()
      .eq("id", id);

    if (err) {
      setError(err.message);
      return;
    }
    setStatements((prev) => prev.filter((s) => s.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  // ── Format helpers ─────────────────────────────────────
  function fmtDate(d) {
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function fmtMoney(n) {
    if (n == null) return "—";
    return Number(n).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  }

  // ── Loading state ──────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse-glow spell-card rounded-xl px-8 py-6">
          <p className="text-wizard-gold font-display text-lg tracking-wide">
            Summoning your scrolls…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-display font-bold text-wizard-gold tracking-widest drop-shadow-[0_0_8px_rgba(212,168,67,0.5)]">
            Statement Archive
          </h1>
          <p className="text-parchment/50 font-serif mt-2">
            {statements.length} {statements.length === 1 ? "scroll" : "scrolls"} stored in your vault
          </p>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 rounded-lg border border-wizard-crimson/50 bg-wizard-crimson/10 px-4 py-3"
          >
            <p className="text-sm text-red-300">{error}</p>
          </motion.div>
        )}

        {/* Empty state */}
        {statements.length === 0 && (
          <div className="spell-card rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-parchment/60 font-serif text-lg">
              No statements yet. Upload a bank statement on the{" "}
              <a href="/" className="text-wizard-gold hover:text-wizard-gold-light transition-colors">
                Summon page
              </a>{" "}
              to get started.
            </p>
          </div>
        )}

        {/* Statement list + detail panel */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* List */}
          {statements.length > 0 && (
            <div className={`space-y-3 ${selected ? "lg:col-span-2" : "lg:col-span-5"}`}>
              {statements.map((stmt) => (
                <motion.div
                  key={stmt.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`spell-card rounded-xl p-5 cursor-pointer transition-all duration-300 ${
                    selected?.id === stmt.id
                      ? "border-wizard-gold/60 shadow-glow"
                      : "hover:border-wizard-gold/40"
                  }`}
                  onClick={() => setSelected(selected?.id === stmt.id ? null : stmt)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display font-semibold text-wizard-gold text-sm tracking-wide">
                        {stmt.bank_name || "Unknown Bank"}
                        {stmt.account_last_four && (
                          <span className="text-parchment/40 ml-2">
                            ••••{stmt.account_last_four}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-parchment/40 font-serif mt-1">
                        {fmtDate(stmt.statement_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-display text-parchment/70">
                        {fmtMoney(stmt.total_balance)}
                      </p>
                      <div className="flex gap-2 text-xs mt-1">
                        <span className="text-wizard-emerald">
                          +{fmtMoney(stmt.total_income)}
                        </span>
                        <span className="text-wizard-crimson">
                          -{fmtMoney(stmt.total_spent)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Detail panel */}
          <AnimatePresence>
            {selected && (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.3 }}
                className="lg:col-span-3 spell-card rounded-2xl p-6 sm:p-8 self-start sticky top-24"
              >
                {/* Detail header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-display font-bold text-wizard-gold tracking-wide">
                      {selected.bank_name || "Statement"}
                    </h2>
                    <p className="text-sm text-parchment/40 font-serif">
                      {fmtDate(selected.statement_date)}
                      {selected.account_last_four &&
                        ` · ••••${selected.account_last_four}`}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-parchment/40 hover:text-parchment transition-colors text-lg"
                  >
                    ✕
                  </button>
                </div>

                {/* Financial summary */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: "Balance", value: selected.total_balance, color: "text-wizard-gold" },
                    { label: "Income", value: selected.total_income, color: "text-wizard-emerald" },
                    { label: "Spent", value: selected.total_spent, color: "text-wizard-crimson" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-dark-wizard/40 rounded-lg px-3 py-3 text-center"
                    >
                      <p className="text-xs text-parchment/40 font-serif mb-1">
                        {item.label}
                      </p>
                      <p className={`font-display font-bold text-sm ${item.color}`}>
                        {fmtMoney(item.value)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Category spending */}
                {selected.category_spending &&
                  Object.keys(selected.category_spending).length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm font-display font-semibold text-wizard-gold/80 mb-3 tracking-wide">
                        Spending by Category
                      </p>
                      <div className="space-y-2">
                        {Object.entries(selected.category_spending)
                          .sort(([, a], [, b]) => b - a)
                          .map(([cat, amount]) => {
                            const maxSpend = Math.max(
                              ...Object.values(selected.category_spending)
                            );
                            const pct = maxSpend > 0 ? (amount / maxSpend) * 100 : 0;
                            return (
                              <div key={cat}>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-parchment/60 font-serif capitalize">
                                    {cat}
                                  </span>
                                  <span className="text-parchment/50">
                                    {fmtMoney(amount)}
                                  </span>
                                </div>
                                <div className="h-1.5 bg-wizard-slate rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-wizard-gold/60 to-wizard-gold rounded-full"
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                {/* AI advisor summary */}
                {selected.advisor_summary && (
                  <div className="mb-6">
                    <p className="text-sm font-display font-semibold text-wizard-gold/80 mb-2 tracking-wide">
                      🧙 Gringotts Advisor
                    </p>
                    <p className="text-sm text-parchment/60 font-serif leading-relaxed bg-dark-wizard/40 rounded-lg p-4">
                      {selected.advisor_summary}
                    </p>
                  </div>
                )}

                {/* Transactions */}
                {selected.transaction_data &&
                  selected.transaction_data.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm font-display font-semibold text-wizard-gold/80 mb-3 tracking-wide">
                        Transactions ({selected.transaction_data.length})
                      </p>
                      <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                        {selected.transaction_data.map((tx, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center text-xs bg-dark-wizard/30 rounded-lg px-3 py-2"
                          >
                            <div>
                              <span className="text-parchment/70">
                                {tx.description || tx.name || `Transaction ${i + 1}`}
                              </span>
                              {tx.category && (
                                <span className="ml-2 text-parchment/30 capitalize">
                                  ({tx.category})
                                </span>
                              )}
                            </div>
                            <span
                              className={
                                (tx.amount ?? 0) >= 0
                                  ? "text-wizard-emerald font-semibold"
                                  : "text-wizard-crimson font-semibold"
                              }
                            >
                              {fmtMoney(tx.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Delete */}
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="w-full rounded-lg border border-wizard-crimson/30 text-wizard-crimson/70 hover:bg-wizard-crimson/10 hover:text-wizard-crimson px-4 py-2.5 font-display font-semibold text-sm tracking-wide transition-all duration-300"
                >
                  Delete Statement
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
