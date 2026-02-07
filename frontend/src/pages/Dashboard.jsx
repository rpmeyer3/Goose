import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../supabase/AuthContext";
import { supabase } from "../supabase/client";

export default function Dashboard() {
  const { user, profile } = useAuth();

  const [stats, setStats] = useState(null);
  const [topCategories, setTopCategories] = useState([]);
  const [recentStatements, setRecentStatements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadDashboard();
  }, [user]);

  async function loadDashboard() {
    setLoading(true);

    const { data: statements, error } = await supabase
      .from("bank_statements")
      .select("*")
      .eq("user_id", user.id)
      .order("statement_date", { ascending: false });

    if (error) {
      console.error("Dashboard fetch error:", error.message);
      setLoading(false);
      return;
    }

    // ── Aggregate totals across all statements ──
    let totalIncome = 0;
    let totalSpent = 0;
    const categoryMap = {};

    for (const stmt of statements || []) {
      totalIncome += Number(stmt.total_income || 0);
      totalSpent += Number(stmt.total_spent || 0);

      if (stmt.category_spending) {
        for (const [cat, amount] of Object.entries(stmt.category_spending)) {
          categoryMap[cat] = (categoryMap[cat] || 0) + Number(amount);
        }
      }
    }

    const balance = totalIncome - totalSpent;

    setStats({ totalIncome, totalSpent, balance, statementCount: statements.length });

    // ── Top categories by spending ──
    const sorted = Object.entries(categoryMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);
    setTopCategories(sorted);

    // ── Most recent 5 statements ──
    setRecentStatements((statements || []).slice(0, 5));

    setLoading(false);
  }

  function fmtMoney(n) {
    return Number(n).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  }

  function fmtDate(d) {
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse-glow spell-card rounded-xl px-8 py-6">
          <p className="text-wizard-gold font-display text-lg tracking-wide">
            Conjuring your financial overview…
          </p>
        </div>
      </div>
    );
  }

  const budgetGoal = profile?.monthly_budget_goal;
  const savingsGoal = profile?.savings_goal;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-display font-bold text-wizard-gold tracking-widest drop-shadow-[0_0_8px_rgba(212,168,67,0.5)]">
            Financial Rundown
          </h1>
          <p className="text-parchment/50 font-serif mt-2">
            Your complete vault overview across{" "}
            <span className="text-wizard-gold">{stats?.statementCount || 0}</span>{" "}
            {stats?.statementCount === 1 ? "statement" : "statements"}
          </p>
        </div>

        {/* No data */}
        {stats?.statementCount === 0 && (
          <div className="spell-card rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">🏦</div>
            <p className="text-parchment/60 font-serif text-lg">
              No financial data yet. Upload a bank statement to see your rundown.
            </p>
          </div>
        )}

        {stats && stats.statementCount > 0 && (
          <>
            {/* ─── Summary Cards ─────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                {
                  label: "Total Income",
                  value: stats.totalIncome,
                  icon: "💰",
                  color: "text-wizard-emerald",
                  border: "border-wizard-emerald/30",
                },
                {
                  label: "Total Spent",
                  value: stats.totalSpent,
                  icon: "🔥",
                  color: "text-wizard-crimson",
                  border: "border-wizard-crimson/30",
                },
                {
                  label: "Net Balance",
                  value: stats.balance,
                  icon: stats.balance >= 0 ? "✨" : "⚠️",
                  color: stats.balance >= 0 ? "text-wizard-gold" : "text-wizard-crimson",
                  border:
                    stats.balance >= 0
                      ? "border-wizard-gold/30"
                      : "border-wizard-crimson/30",
                },
              ].map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className={`spell-card rounded-xl p-6 text-center border ${card.border}`}
                >
                  <div className="text-3xl mb-2">{card.icon}</div>
                  <p className="text-xs text-parchment/40 font-serif uppercase tracking-widest mb-1">
                    {card.label}
                  </p>
                  <p className={`text-2xl font-display font-bold ${card.color}`}>
                    {fmtMoney(card.value)}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* ─── Budget & Savings Progress ─────────────── */}
            {(budgetGoal || savingsGoal) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {budgetGoal && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="spell-card rounded-xl p-6"
                  >
                    <p className="text-sm font-display font-semibold text-wizard-gold/80 tracking-wide mb-3">
                      Budget Goal
                    </p>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-parchment/50 font-serif">
                        {fmtMoney(stats.totalSpent)} spent
                      </span>
                      <span className="text-parchment/50 font-serif">
                        {fmtMoney(budgetGoal)} goal
                      </span>
                    </div>
                    <div className="h-3 bg-wizard-slate rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(
                            (stats.totalSpent / Number(budgetGoal)) * 100,
                            100
                          )}%`,
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          stats.totalSpent > Number(budgetGoal)
                            ? "bg-gradient-to-r from-wizard-crimson/80 to-wizard-crimson"
                            : "bg-gradient-to-r from-wizard-gold/60 to-wizard-gold"
                        }`}
                      />
                    </div>
                    {stats.totalSpent > Number(budgetGoal) && (
                      <p className="text-xs text-wizard-crimson mt-2 font-serif">
                        ⚠️ Over budget by {fmtMoney(stats.totalSpent - Number(budgetGoal))}
                      </p>
                    )}
                  </motion.div>
                )}

                {savingsGoal && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="spell-card rounded-xl p-6"
                  >
                    <p className="text-sm font-display font-semibold text-wizard-gold/80 tracking-wide mb-3">
                      Savings Goal
                    </p>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-parchment/50 font-serif">
                        {fmtMoney(Math.max(stats.balance, 0))} saved
                      </span>
                      <span className="text-parchment/50 font-serif">
                        {fmtMoney(savingsGoal)} goal
                      </span>
                    </div>
                    <div className="h-3 bg-wizard-slate rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(
                            (Math.max(stats.balance, 0) / Number(savingsGoal)) * 100,
                            100
                          )}%`,
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-wizard-emerald/60 to-wizard-emerald rounded-full"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* ─── Two-column: Categories + Recent ───────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top categories */}
              {topCategories.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="spell-card rounded-xl p-6"
                >
                  <p className="text-sm font-display font-semibold text-wizard-gold/80 tracking-wide mb-4">
                    Top Spending Categories
                  </p>
                  <div className="space-y-3">
                    {topCategories.map(([cat, amount], i) => {
                      const maxAmt = topCategories[0]?.[1] || 1;
                      const pct = (amount / maxAmt) * 100;
                      return (
                        <div key={cat}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-parchment/60 font-serif capitalize">
                              {cat}
                            </span>
                            <span className="text-parchment/50">{fmtMoney(amount)}</span>
                          </div>
                          <div className="h-2 bg-wizard-slate rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{
                                duration: 0.6,
                                delay: 0.5 + i * 0.1,
                                ease: "easeOut",
                              }}
                              className="h-full bg-gradient-to-r from-wizard-gold/50 to-wizard-gold rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Recent statements */}
              {recentStatements.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="spell-card rounded-xl p-6"
                >
                  <p className="text-sm font-display font-semibold text-wizard-gold/80 tracking-wide mb-4">
                    Recent Statements
                  </p>
                  <div className="space-y-2">
                    {recentStatements.map((stmt) => (
                      <div
                        key={stmt.id}
                        className="flex items-center justify-between bg-dark-wizard/30 rounded-lg px-4 py-3"
                      >
                        <div>
                          <p className="text-sm text-parchment/70 font-display font-semibold">
                            {stmt.bank_name || "Statement"}
                          </p>
                          <p className="text-xs text-parchment/35 font-serif">
                            {fmtDate(stmt.statement_date)}
                          </p>
                        </div>
                        <div className="text-right text-xs">
                          <span className="text-wizard-emerald">
                            +{fmtMoney(stmt.total_income)}
                          </span>
                          <span className="text-parchment/20 mx-1">|</span>
                          <span className="text-wizard-crimson">
                            -{fmtMoney(stmt.total_spent)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* ─── Wizard stats ──────────────────────────── */}
            {profile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8 spell-card rounded-xl p-6"
              >
                <p className="text-sm font-display font-semibold text-wizard-gold/80 tracking-wide mb-4">
                  Wizard Stats
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  {[
                    { label: "Rank", value: profile.wizard_rank || "Muggle", icon: "🏆" },
                    { label: "Analyses", value: profile.total_analyses || 0, icon: "📊" },
                    { label: "Streak", value: `${profile.streak_days || 0} days`, icon: "🔥" },
                    {
                      label: "Last Analysis",
                      value: profile.last_analysis_at
                        ? fmtDate(profile.last_analysis_at)
                        : "Never",
                      icon: "🕐",
                    },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-dark-wizard/30 rounded-lg px-3 py-4">
                      <div className="text-xl mb-1">{stat.icon}</div>
                      <p className="text-xs text-parchment/40 font-serif mb-1">
                        {stat.label}
                      </p>
                      <p className="text-sm font-display font-bold text-parchment/80">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
