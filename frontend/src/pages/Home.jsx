import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext.jsx";

export default function Home() {
  const { t } = useLang();

  // Cards follow the nav menu order (Pantries lives in the hero button instead).
  const features = [
    { to: "/get-help",     icon: "✨", title: t("cardGetHelpTitle"),  body: t("cardGetHelpBody"), hero: true },
    { to: "/resources",    icon: "📚", title: t("resources"),         body: t("cardResourcesBody") },
    { to: "/food-recovery",icon: "♻️", title: t("foodRecovery"),      body: t("cardRecoveryBody") },
    { to: "/volunteers",   icon: "🤝", title: t("volunteers"),        body: t("cardVolunteersBody") },
    { to: "/meal-planner", icon: "🍲", title: t("mealPlanner"),       body: t("cardMealBody") },
    { to: "/chat",         icon: "💬", title: t("chatbot"),           body: t("cardChatBody") },
    { to: "/donors",       icon: "💝", title: t("donors"),            body: t("donorsIntro") },
    { to: "/donate",       icon: "💵", title: t("donate"),            body: t("cardDonateBody") },
    { to: "/youth",        icon: "🎒", title: t("youth"),             body: t("cardYouthBody") },
  ];

  const whoItems = [
    ["🛡️", t("who1")], ["📄", t("who2")], ["🌎", t("who3")],
    ["🎓", t("who4")], ["🧓", t("who5")], ["👶", t("who6")],
    ["🍱", t("who7")], ["🏚️", t("who8")],
  ];

  return (
    <div className="home">
      <section className="hero-v2">
        <div className="hero-text">
          <span className="eyebrow">{t("homeEyebrow")}</span>
          <h1>{t("appName")}</h1>
          <p className="tagline">{t("tagline")}</p>
          <p className="intro">{t("homeIntro")}</p>
          <div className="cta">
            <Link className="btn primary large" to="/resources">📚 {t("resources")} →</Link>
            <Link className="btn large" to="/pantries">🥕 {t("pantries")} →</Link>
          </div>
          <div className="trust-row">
            <span>🛡️ {t("trustImmSafe")}</span>
            <span>🪪 {t("trustNoId")}</span>
            <span>🤫 {t("trustConfidential")}</span>
          </div>
        </div>
        <div className="hero-art" aria-hidden>🥕🍞🥬🍎🌽🥑</div>
      </section>

      <section className="who-section">
        <h2>{t("whoTitle")}</h2>
        <p className="muted">{t("whoSubtitle")}</p>
        <div className="who-grid">
          {whoItems.map(([icon, text], i) => (
            <div key={i} className="who-card">
              <span className="who-icon">{icon}</span>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <Link className="btn primary large" to="/get-help">{t("startHere")}</Link>
      </section>

      <section className="safety-section">
        <div className="safety-shield" aria-hidden>🛡️</div>
        <div className="safety-body">
          <h2>{t("safe_title")}</h2>
          <ul>
            <li>✓ {t("safe_everyone")}</li>
            <li>✓ {t("safe_noStatus")}</li>
            <li>✓ {t("safe_noShare")}</li>
            <li>✓ {t("safe_local")}</li>
          </ul>
        </div>
      </section>

      <section className="card-grid">
        {features.map((c) => (
          <Link key={c.to} to={c.to} className={`card ${c.hero ? "card-hero" : ""}`}>
            <span className="card-icon" aria-hidden>{c.icon}</span>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
