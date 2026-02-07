import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client";

/**
 * Handles the redirect back from Supabase email confirmation / OAuth.
 * Supabase appends tokens to the URL hash; the client library
 * automatically exchanges them for a session when detectSessionInUrl
 * is enabled, but we need a route to land on.
 */
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // The PKCE code exchange happens automatically via onAuthStateChange
    // in AuthContext. We just wait briefly and redirect.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_IN") {
          navigate("/", { replace: true });
        }
      }
    );

    // Fallback redirect after 5 s in case the event already fired
    const timeout = setTimeout(() => navigate("/login", { replace: true }), 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="spell-card rounded-xl px-8 py-6 animate-pulse-glow">
        <p className="text-wizard-gold font-display text-lg tracking-wide">
          Confirming your identity…
        </p>
      </div>
    </div>
  );
}
