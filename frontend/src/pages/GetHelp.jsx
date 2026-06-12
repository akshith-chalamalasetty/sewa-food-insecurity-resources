import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useLang } from "../context/LangContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import ResourceCard from "../components/ResourceCard.jsx";

const SITUATIONS = [
  { tag: "undocumented",     icon: "🛡️",  key: "sit_undocumented" },
  { tag: "mixed_status",     icon: "👨‍👩‍👧", key: "sit_mixed_status" },
  { tag: "recent_immigrant", icon: "🌎",  key: "sit_recent_immigrant" },
  { tag: "denied_snap",      icon: "📄",  key: "sit_denied_snap" },
  { tag: "student",          icon: "🎓",  key: "sit_student" },
  { tag: "senior",           icon: "🧓",  key: "sit_senior" },
  { tag: "children",         icon: "👶",  key: "sit_children" },
  { tag: "no_kitchen",       icon: "🍱",  key: "sit_no_kitchen" },
  { tag: "no_address",       icon: "🏚️",  key: "sit_no_address" },
];

export default function GetHelp() {
  const { t } = useLang();
  const { user, updateUser } = useAuth();
  const [selected, setSelected] = useState(new Set());
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  const savedTags = (user?.situation_tags || "").split(",").filter(Boolean);
  const hasSaved = savedTags.length > 0;

  // Pre-select previously saved answers when a logged-in user returns.
  useEffect(() => {
    if (hasSaved && selected.size === 0 && !results) {
      setSelected(new Set(savedTags));
    }
    // eslint-disable-next-line
  }, [user]);

  const toggle = (tag) => {
    const next = new Set(selected);
    next.has(tag) ? next.delete(tag) : next.add(tag);
    setSelected(next);
  };

  const fetchResults = async (tags) => {
    setLoading(true);
    setSavedOk(false);
    try {
      const data = await api.recommend({ situation_tags: tags, zip_code: null });
      setResults(data);
      if (user) {
        try {
          // Backend returns the updated user — push it into the auth context
          // immediately so saved answers reflect without a page refresh.
          const updated = await api.saveIntake({ situation_tags: tags, zip_code: null });
          updateUser(updated);
          setSavedOk(true);
        } catch { /* save failed silently; results still show */ }
      }
    } finally { setLoading(false); }
  };

  const submit = (e) => {
    e.preventDefault();
    fetchResults(Array.from(selected));
  };

  const useSaved = () => {
    setSelected(new Set(savedTags));
    fetchResults(savedTags);
  };

  const reset = () => { setResults(null); setSelected(new Set()); setSavedOk(false); };

  if (results) {
    return (
      <div className="page">
        <div className="results-header">
          <h2>{t("gh_resultsTitle")}</h2>
          <button className="btn" onClick={reset}>{t("gh_startOver")}</button>
        </div>
        {savedOk && <p className="badge ok saved-pill">✓ {t("gh_savedOk")}</p>}
        {!user && <p className="muted small">🔑 {t("gh_loginToSave")} <Link to="/login">{t("login")}</Link></p>}
        <div className="callout safe">
          <strong>{t("gh_safeCallout")}</strong> {t("gh_safeBody")}
        </div>
        {results.length === 0 && <p className="muted">{t("gh_noMatch")}</p>}
        <div className="list">
          {results.map((r) => <ResourceCard key={r.id} r={r} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="intake-hero">
        <h2>{t("gh_title")}</h2>
        <p className="muted">{t("gh_subtitle")}</p>
      </div>

      {hasSaved && (
        <div className="callout safe saved-banner">
          <strong>👋 {t("gh_savedBanner")}</strong>{" "}
          <button className="btn primary small" onClick={useSaved}>
            {t("gh_showSaved")} →
          </button>
        </div>
      )}

      <form className="intake-form" onSubmit={submit}>
        <div className="situation-grid">
          {SITUATIONS.map((s) => (
            <button
              type="button"
              key={s.tag}
              className={`situation-chip ${selected.has(s.tag) ? "active" : ""}`}
              onClick={() => toggle(s.tag)}
              aria-pressed={selected.has(s.tag)}
            >
              <span className="emoji">{s.icon}</span>
              <span>{t(s.key)}</span>
            </button>
          ))}
        </div>

        <div className="intake-footer">
          <button className="btn primary large" type="submit" disabled={selected.size === 0 || loading}>
            {loading ? t("gh_finding") : t("gh_showResources")}
          </button>
        </div>

        <p className="muted small disclaimer">
          {user ? `✓ ${t("gh_willSave")}` : t("gh_disclaimer")}
        </p>
      </form>
    </div>
  );
}
