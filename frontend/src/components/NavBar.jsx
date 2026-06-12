import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang, LANGUAGES } from "../context/LangContext.jsx";

export default function NavBar() {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLang();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  const tabs = [
    ["/",              "🏠", t("home")],
    ["/get-help",      "✨", t("getHelp")],
    ["/pantries",      "🥕", t("pantries")],
    ["/resources",     "📚", t("resources")],
    ["/food-recovery", "♻️", t("foodRecovery")],
    ["/volunteers",    "🤝", t("volunteers")],
    ["/meal-planner",  "🍲", t("mealPlanner")],
    ["/chat",          "💬", t("chatbot")],
    ["/donors",        "💝", t("donors")],
    ["/donate",        "💵", t("donate")],
    ["/youth",         "🎒", t("youth")],
    ["/contact",       "📬", t("contact")],
  ];

  return (
    <header className="navbar">
      <div className="nav-top">
        <div className="brand">
          <NavLink to="/" onClick={() => setOpen(false)}>
            <span className="logo">🥕</span>
            <span className="brand-text">{t("appName")}</span>
          </NavLink>
        </div>
        <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Menu">
          ☰
        </button>
        <div className="nav-actions">
          <select aria-label="Language" value={lang} onChange={(e) => setLang(e.target.value)}>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
          {user ? (
            <>
              <span className="user-chip">👤 {user.full_name.split(" ")[0]}</span>
              <button className="btn small" onClick={() => { logout(); nav("/"); }}>{t("logout")}</button>
            </>
          ) : (
            <>
              <NavLink className="btn small" to="/login">{t("login")}</NavLink>
              <NavLink className="btn small primary" to="/register">{t("register")}</NavLink>
            </>
          )}
        </div>
      </div>
      <nav className={`tabs ${open ? "open" : ""}`}>
        {tabs.map(([to, icon, label]) => (
          <NavLink key={to} to={to} end={to === "/"} onClick={() => setOpen(false)}>
            <span className="tab-icon" aria-hidden>{icon}</span> {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
