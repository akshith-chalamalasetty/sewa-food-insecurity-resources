import { useLang } from "../context/LangContext.jsx";
import { localizedDescription } from "../resourceI18n.js";

const CATEGORY_ICONS = {
  community_fridge: "🧊",
  mutual_aid: "🤝",
  wic: "🍼",
  school_meal: "🏫",
  senior: "🧓",
  student: "🎓",
  immigrant_org: "🌎",
  legal_aid: "⚖️",
  know_your_rights: "📘",
  hotline: "📞",
};

export default function ResourceCard({ r }) {
  const { t, lang } = useLang();
  const icon = CATEGORY_ICONS[r.category] || "📍";
  // t() falls back to the raw category name if no translation key exists.
  const label = t(`cat_${r.category}`);
  return (
    <article className="resource-card">
      <header>
        <div className="rc-title">
          <span className="rc-icon" aria-hidden>{icon}</span>
          <h3>{r.name}</h3>
        </div>
        <span className="badge cat">{label}</span>
      </header>
      <p>{localizedDescription(r, lang)}</p>
      {r.address && <p className="rc-meta">📍 {r.address}{r.zip_code ? `, ${r.zip_code}` : ""}</p>}
      {r.phone && <p className="rc-meta">📞 <a href={`tel:${r.phone}`}>{r.phone}</a></p>}
      {r.url && (
        <p className="rc-meta">
          🔗 <a href={r.url} target="_blank" rel="noreferrer">{r.url.replace(/^https?:\/\//, "").split("/")[0]}</a>
        </p>
      )}
      <div className="badge-row">
        {r.no_id_required && <span className="badge ok">{t("noId")}</span>}
        {r.immigration_safe && <span className="badge safe">{t("immigrationSafe")}</span>}
        {r.languages && <span className="badge lang">🌐 {r.languages}</span>}
      </div>
    </article>
  );
}
