import { useEffect, useState } from "react";
import { api } from "../api";
import { useLang } from "../context/LangContext.jsx";
import ResourceCard from "../components/ResourceCard.jsx";

const CATEGORIES = [
  { key: "",                 tKey: "cat_all",              icon: "✨" },
  { key: "community_fridge", tKey: "cat_community_fridge", icon: "🧊" },
  { key: "mutual_aid",       tKey: "cat_mutual_aid",       icon: "🤝" },
  { key: "wic",              tKey: "cat_wic",              icon: "🍼" },
  { key: "school_meal",      tKey: "cat_school_meal",      icon: "🏫" },
  { key: "senior",           tKey: "cat_senior",           icon: "🧓" },
  { key: "student",          tKey: "cat_student",          icon: "🎓" },
  { key: "immigrant_org",    tKey: "cat_immigrant_org",    icon: "🌎" },
  { key: "legal_aid",        tKey: "cat_legal_aid",        icon: "⚖️" },
  { key: "know_your_rights", tKey: "cat_know_your_rights", icon: "📘" },
  { key: "hotline",          tKey: "cat_hotline",          icon: "📞" },
];

export default function Resources() {
  const { t } = useLang();
  // Multi-select: empty set = "All". Filtering happens client-side so
  // toggling pills is instant with no refetch.
  const [cats, setCats] = useState(new Set());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setRows(await api.resources());
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const toggleCat = (key) => {
    if (key === "") { setCats(new Set()); return; }  // "All" clears selection
    const next = new Set(cats);
    next.has(key) ? next.delete(key) : next.add(key);
    setCats(next);
  };

  const filtered = cats.size === 0 ? rows : rows.filter((r) => cats.has(r.category));

  return (
    <div className="page">
      <h2>📚 {t("resources")}</h2>
      <p className="muted">{t("resourcesIntro")}</p>

      <div className="category-pills">
        {CATEGORIES.map((c) => (
          <button
            key={c.key || "all"}
            className={`pill ${(c.key === "" ? cats.size === 0 : cats.has(c.key)) ? "active" : ""}`}
            onClick={() => toggleCat(c.key)}
          >
            <span aria-hidden>{c.icon}</span> {t(c.tKey)}
          </button>
        ))}
      </div>

      {loading ? <p>{t("loading")}</p> : (
        <div className="list">
          {filtered.length === 0 && <p className="muted">{t("noMatch")}</p>}
          {filtered.map((r) => <ResourceCard key={r.id} r={r} />)}
        </div>
      )}
    </div>
  );
}
