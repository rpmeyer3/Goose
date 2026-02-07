import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../supabase/AuthContext";

/**
 * Wrap any <Route> element to require authentication.
 * Unauthenticated users are redirected to /login, preserving
 * the intended destination so they return after sign-in.
 */
export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse-glow spell-card rounded-xl px-8 py-6">
          <p className="text-wizard-gold font-display text-lg tracking-wide">
            Verifying your credentials…
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
