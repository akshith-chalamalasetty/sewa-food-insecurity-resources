import { useEffect, useState } from "react";
import { api } from "../api";
import { useLang } from "../context/LangContext.jsx";

const DIETS = [
  { key: "any",         tKey: "diet_all",        icon: "🍽️" },
  { key: "vegetarian",  tKey: "diet_vegetarian", icon: "🥦" },
  { key: "vegan",       tKey: "diet_vegan",      icon: "🌱" },
  { key: "halal",       tKey: "diet_halal",      icon: "🕌" },
  { key: "gluten_free", tKey: "diet_glutenFree", icon: "🌾" },
  { key: "diabetic",    tKey: "diet_diabetic",   icon: "💙" },
];

// Localized weekday abbreviations (backend stores English keys).
const DAY_NAMES = {
  en: { Mon: "Mon", Tue: "Tue", Wed: "Wed", Thu: "Thu", Fri: "Fri", Sat: "Sat", Sun: "Sun" },
  es: { Mon: "Lun", Tue: "Mar", Wed: "Mié", Thu: "Jue", Fri: "Vie", Sat: "Sáb", Sun: "Dom" },
  zh: { Mon: "周一", Tue: "周二", Wed: "周三", Thu: "周四", Fri: "周五", Sat: "周六", Sun: "周日" },
  vi: { Mon: "T2", Tue: "T3", Wed: "T4", Thu: "T5", Fri: "T6", Sat: "T7", Sun: "CN" },
  ko: { Mon: "월", Tue: "화", Wed: "수", Thu: "목", Fri: "금", Sat: "토", Sun: "일" },
  tl: { Mon: "Lun", Tue: "Mar", Wed: "Miy", Thu: "Huw", Fri: "Biy", Sat: "Sab", Sun: "Lin" },
  hy: { Mon: "Երկ", Tue: "Երք", Wed: "Չրք", Thu: "Հնգ", Fri: "Ուրբ", Sat: "Շբթ", Sun: "Կիր" },
  fa: { Mon: "دوشنبه", Tue: "سه‌شنبه", Wed: "چهارشنبه", Thu: "پنجشنبه", Fri: "جمعه", Sat: "شنبه", Sun: "یکشنبه" },
  ru: { Mon: "Пн", Tue: "Вт", Wed: "Ср", Thu: "Чт", Fri: "Пт", Sat: "Сб", Sun: "Вс" },
  ar: { Mon: "الإثنين", Tue: "الثلاثاء", Wed: "الأربعاء", Thu: "الخميس", Fri: "الجمعة", Sat: "السبت", Sun: "الأحد" },
  hi: { Mon: "सोम", Tue: "मंगल", Wed: "बुध", Thu: "गुरु", Fri: "शुक्र", Sat: "शनि", Sun: "रवि" },
  ja: { Mon: "月", Tue: "火", Wed: "水", Thu: "木", Fri: "金", Sat: "土", Sun: "日" },
  km: { Mon: "ចន្ទ", Tue: "អង្គារ", Wed: "ពុធ", Thu: "ព្រហ", Fri: "សុក្រ", Sat: "សៅរ៍", Sun: "អាទិត្យ" },
  th: { Mon: "จ.", Tue: "อ.", Wed: "พ.", Thu: "พฤ.", Fri: "ศ.", Sat: "ส.", Sun: "อา." },
  pt: { Mon: "Seg", Tue: "Ter", Wed: "Qua", Thu: "Qui", Fri: "Sex", Sat: "Sáb", Sun: "Dom" },
  de: { Mon: "Mo", Tue: "Di", Wed: "Mi", Thu: "Do", Fri: "Fr", Sat: "Sa", Sun: "So" },
  pa: { Mon: "ਸੋਮ", Tue: "ਮੰਗਲ", Wed: "ਬੁੱਧ", Thu: "ਵੀਰ", Fri: "ਸ਼ੁੱਕਰ", Sat: "ਸ਼ਨੀ", Sun: "ਐਤ" },
};

export default function MealPlanner() {
  const { t, lang } = useLang();
  const [budget, setBudget] = useState("");
  const [diet, setDiet] = useState("any");
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async (d = diet, b = budget) => {
    setLoading(true);
    try {
      const params = {};
      if (b) params.max_budget = b;
      if (d && d !== "any") params.diet = d;
      setPlans(await api.mealPlans(params));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [diet]);

  const dietLabel = (key) => {
    const d = DIETS.find((x) => x.key === key);
    return d ? `${d.icon} ${t(d.tKey)}` : key;
  };

  return (
    <div className="page">
      <h2>🍲 {t("mealPlanner")}</h2>
      <p className="muted">{t("mealPlannerIntro")}</p>

      <div className="category-pills">
        {DIETS.map((d) => (
          <button
            key={d.key}
            className={`pill ${diet === d.key ? "active" : ""}`}
            onClick={() => setDiet(d.key)}
          >
            <span aria-hidden>{d.icon}</span> {t(d.tKey)}
          </button>
        ))}
      </div>

      <form className="filter-row" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <input
          type="number"
          placeholder={t("maxBudget")}
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />
        <button className="btn primary" type="submit">{t("search")}</button>
      </form>

      {loading ? <p>{t("loading")}</p> : (
        <div className="list">
          {plans.length === 0 && <p className="muted">{t("noMatch")}</p>}
          {plans.map((p) => {
            const recipes = JSON.parse(p.recipes_json);
            const noKitchen = p.title.toLowerCase().includes("no kitchen");
            // Build the title and summary client-side so they follow the UI language.
            const household = noKitchen
              ? t("mp_noKitchen")
              : p.servings === 1
                ? t("mp_1adult")
                : `${p.servings} ${t("mp_personsUnit")}`;
            const title = `$${p.weekly_budget_usd}${t("mp_perWeek")} · ${household}`;
            const summary = t(noKitchen ? "mps_nokitchen" : `mps_${p.diet}`);
            return (
              <article key={p.id} className="resource-card">
                <header>
                  <h3>{title}</h3>
                  <div className="badge-row" style={{ marginTop: 0 }}>
                    <span className="badge ok">${p.weekly_budget_usd}{t("mp_perWeek")}</span>
                    <span className="badge lang">👥 {p.servings}</span>
                    {p.diet !== "any" && <span className="badge cat">{dietLabel(p.diet)}</span>}
                  </div>
                </header>
                <p>{summary}</p>
                <table className="recipes">
                  <thead><tr><th>{t("mp_day")}</th><th>{t("mp_meal")}</th><th>{t("mp_cost")}</th></tr></thead>
                  <tbody>
                    {recipes.map((r, i) => (
                      <tr key={i}>
                        <td>{DAY_NAMES[lang]?.[r.day] ?? r.day}</td>
                        <td>{r.meal}</td>
                        <td>${r.cost.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
