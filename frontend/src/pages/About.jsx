const MEMBERS = [
  {
    name: "Igor Goncalves",
    role: "Machine Learning",
    desc: "Built the Naive Bayes classification pipeline that categorizes every transaction.",
  },
  {
    name: "Jordan Delp",
    role: "Backend Engineer",
    desc: "Designed the FastAPI server, PDF ingestion, and data processing pipeline.",
  },
  {
    name: "Ryan Meyer",
    role: "Frontend Engineer",
    desc: "Created the React UI, upload flow, and budget visualization dashboard.",
  },
];

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <h1 className="text-3xl font-bold mb-3">About Impendios</h1>
      <p className="text-gray-500 mb-10 max-w-xl">
        Impendios is a bank statement analyzer built at UGA Hacks 11. Upload a
        PDF statement and get instant insight into your income, spending habits,
        and category-level breakdowns — powered by machine learning.
      </p>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-2">How It Works</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 text-sm leading-relaxed">
          <li>Upload a bank statement PDF from the Home page.</li>
          <li>The backend extracts transaction text using pdfplumber.</li>
          <li>Each transaction is classified into a spending category by a Naive Bayes model trained on TF-IDF features.</li>
          <li>Summary metrics and a full transaction breakdown are returned as JSON and rendered on the Budget page.</li>
        </ol>
      </div>

      <h2 className="text-xl font-semibold mb-5">The Team</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {MEMBERS.map((m) => (
          <div
            key={m.name}
            className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6"
          >
            <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg mb-4">
              {m.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <h3 className="font-semibold text-base">{m.name}</h3>
            <p className="text-xs text-indigo-600 font-medium mb-2">{m.role}</p>
            <p className="text-sm text-gray-500 leading-relaxed">{m.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-400">
        Built with React, FastAPI, scikit-learn, pdfplumber, and Tailwind CSS.
      </div>
    </div>
  );
}
