import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Google Sign-In button (Google Identity Services).
 *
 * Requires a Google OAuth Client ID. Create one at
 * https://console.cloud.google.com/apis/credentials
 * (OAuth client ID → Web application → add http://localhost:5173 to
 * "Authorized JavaScript origins"), then put it in frontend/.env:
 *
 *   VITE_GOOGLE_CLIENT_ID=1234567890-abc.apps.googleusercontent.com
 *
 * Restart `npm run dev` after editing .env. If no client ID is set,
 * this component renders nothing, so the app works fine without it.
 */
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function GoogleSignIn() {
  const { loginWithGoogle } = useAuth();
  const nav = useNavigate();
  const btnRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!CLIENT_ID) return;

    const init = () => {
      if (!window.google?.accounts?.id || !btnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: async (response) => {
          try {
            await loginWithGoogle(response.credential);
            nav("/");
          } catch (err) {
            setError(err.message);
          }
        },
      });
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: "outline",
        size: "large",
        width: 280,
      });
    };

    if (window.google?.accounts?.id) {
      init();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = init;
    document.head.appendChild(script);
  }, [loginWithGoogle, nav]);

  if (!CLIENT_ID) return null;

  return (
    <div className="google-signin">
      <div className="or-divider"><span>or</span></div>
      <div ref={btnRef} />
      {error && <p className="error">{error}</p>}
    </div>
  );
}
