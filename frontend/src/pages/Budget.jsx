import { useNavigate } from "react-router-dom";

const COLORS = [
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-orange-100 text-orange-700",
  "bg-teal-100 text-teal-700",
  "bg-pink-100 text-pink-700",
];

function StatCard({ label, value, accent, sub }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function fmt(n) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function Budget({ data }) {
  const navigate = useNavigate();

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold mb-3">No Data Yet</h2>
        <p className="text-gray-500 mb-8">
          Upload a bank statement first to see your budget breakdown.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  const { metrics } = data;
  const leftOver = metrics.left_over;
  const categories = Object.entries(metrics.category_spending).sort(
    (a, b) => b[1] - a[1]
  );
  const maxSpend = categories.length ? categories[0][1] : 1;
  const dailyEntries = Object.entries(metrics.daily_spending || {}).sort(
    (a, b) => a[0].localeCompare(b[0])
  );
  const maxDaily = dailyEntries.length
    ? Math.max(...dailyEntries.map(([, v]) => v))
    : 1;

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <h1 className="text-3xl font-bold mb-8">Budget Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total Income"
          value={fmt(metrics.total_income)}
          accent="text-emerald-600"
        />
        <StatCard
          label="Total Spent"
          value={fmt(metrics.total_spent)}
          accent="text-rose-600"
        />
        <StatCard
          label="Left Over"
          value={fmt(leftOver)}
          accent={leftOver >= 0 ? "text-emerald-600" : "text-rose-600"}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {metrics.category_most_spent && (
          <StatCard
            label="Most Spent Category"
            value={metrics.category_most_spent}
            accent="text-rose-600"
            sub={fmt(metrics.category_spending[metrics.category_most_spent])}
          />
        )}
        {metrics.category_least_spent && (
          <StatCard
            label="Least Spent Category"
            value={metrics.category_least_spent}
            accent="text-sky-600"
            sub={fmt(metrics.category_spending[metrics.category_least_spent])}
          />
        )}
      </div>

      <h2 className="text-xl font-semibold mb-5">Spending by Category</h2>

      <div className="space-y-4 mb-12">
        {categories.map(([category, amount], i) => {
          const pct = Math.round((amount / maxSpend) * 100);
          const color = COLORS[i % COLORS.length];

          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${color}`}
                >
                  {category}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {fmt(amount)}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}

        {categories.length === 0 && (
          <p className="text-gray-400 text-center py-8">
            No spending categories found.
          </p>
        )}
      </div>

      {dailyEntries.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-5">Daily Spending</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-12">
            <div className="flex items-end gap-1 h-40">
              {dailyEntries.map(([date, amount]) => {
                const pct = Math.max((amount / maxDaily) * 100, 4);
                return (
                  <div
                    key={date}
                    className="flex-1 flex flex-col items-center justify-end gap-1 group"
                  >
                    <span className="text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {fmt(amount)}
                    </span>
                    <div
                      className="w-full max-w-[28px] bg-indigo-500 rounded-t-md transition-all hover:bg-indigo-600"
                      style={{ height: `${pct}%` }}
                    />
                    <span className="text-[9px] text-gray-400 truncate w-full text-center">
                      {date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="pt-8 border-t border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Transactions</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.transactions.map((tx, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">{tx.date}</td>
                  <td className="px-4 py-3">{tx.description}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {tx.category}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-medium ${
                      tx.amount >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {fmt(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
