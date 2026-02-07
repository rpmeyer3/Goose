import { Link } from "react-router-dom";
import {
  UserCircle,
  FolderArchive,
  BarChart3,
  Mail,
  Github,
  ExternalLink,
} from "lucide-react";

const quickLinks = [
  { to: "/profile", icon: <UserCircle size={14} />, label: "Edit Profile" },
  { to: "/statements", icon: <FolderArchive size={14} />, label: "Statements" },
  { to: "/dashboard", icon: <BarChart3 size={14} />, label: "Finances" },
];

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-wizard-gold/10 bg-dark-wizard/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* ─── Col 1: Brand ──────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img
                src="/bytehacks11.png"
                alt="Byte's Bank"
                className="h-7 w-7"
              />
              <span className="font-display font-bold text-wizard-gold tracking-widest text-lg">
                Byte's Bank
              </span>
            </div>
            <p className="text-sm text-parchment/40 font-serif leading-relaxed max-w-xs">
              Your enchanted financial companion. Upload bank statements,
              uncover spending patterns, and let the Gringotts Advisor guide
              your galleons to safety.
            </p>
          </div>

          {/* ─── Col 2: Quick Links ────────────────────── */}
          <div>
            <h3 className="font-display font-semibold text-sm text-wizard-gold/80 tracking-widest uppercase mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="flex items-center gap-2 text-sm text-parchment/50 hover:text-wizard-gold transition-colors duration-200 font-serif group"
                  >
                    <span className="text-parchment/30 group-hover:text-wizard-gold/70 transition-colors">
                      {link.icon}
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ─── Col 3: Support & Social ───────────────── */}
          <div>
            <h3 className="font-display font-semibold text-sm text-wizard-gold/80 tracking-widest uppercase mb-4">
              Support
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="mailto:support@bytesbank.app"
                  className="flex items-center gap-2 text-sm text-parchment/50 hover:text-wizard-gold transition-colors duration-200 font-serif group"
                >
                  <Mail
                    size={14}
                    className="text-parchment/30 group-hover:text-wizard-gold/70 transition-colors"
                  />
                  support@bytesbank.app
                </a>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-parchment/50 hover:text-wizard-gold transition-colors duration-200 font-serif group"
                >
                  <Github
                    size={14}
                    className="text-parchment/30 group-hover:text-wizard-gold/70 transition-colors"
                  />
                  GitHub
                  <ExternalLink size={11} className="opacity-0 group-hover:opacity-50 transition-opacity" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-wizard-gold/5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-parchment/25 font-serif">
            &copy; {new Date().getFullYear()} Byte's Bank. All rights reserved.
          </p>
          <p className="text-xs text-parchment/20 font-serif">
            Built with magic at UGA Hacks 11
          </p>
        </div>
      </div>
    </footer>
  );
}
