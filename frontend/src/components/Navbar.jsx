import { NavLink } from "react-router-dom";

export default function Navbar() {
  const link = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-indigo-600 text-white"
        : "text-gray-600 hover:bg-gray-200"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3">
        <span className="text-lg font-bold tracking-tight text-indigo-600">
          Impendios
        </span>
        <div className="flex gap-2">
          <NavLink to="/" className={link}>
            Upload
          </NavLink>
          <NavLink to="/budget" className={link}>
            Budget
          </NavLink>
          <NavLink to="/about" className={link}>
            About
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
