import { useState } from "react";
import { useLang } from "../context/LangContext.jsx";

const CONTACT = {
  name: "Sewa Food Resources Team",
  email: "sewafoodinsecuritynonprofitorg@gmail.com",
};

const SUBJECT = "Sewa Food Resources — ";

// Gmail web-compose URL (works on any device with a browser, no mail app needed).
const gmailLink = (subject, body = "") =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

// Universal mailto fallback (uses the user's default mail app if they have one).
const mailtoLink = (subject) =>
  `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}`;

export default function Contact() {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (very old browser) — no-op.
    }
  };

  const reasons = [
    { icon: "🐛", key: "contact_reasonBug",      subj: SUBJECT + "Bug report" },
    { icon: "💡", key: "contact_reasonIdea",     subj: SUBJECT + "Suggestion / feedback" },
    { icon: "📍", key: "contact_reasonResource", subj: SUBJECT + "Suggest a resource" },
    { icon: "🤝", key: "contact_reasonVolunteer",subj: SUBJECT + "I'd like to volunteer" },
    { icon: "📰", key: "contact_reasonPress",    subj: SUBJECT + "Press inquiry" },
  ];

  return (
    <div className="page">
      <h2>📬 {t("contact")}</h2>
      <p className="muted">{t("contactIntro")}</p>

      <div className="contact-grid single">
        <div className="contact-card email">
          <span className="contact-icon">📧</span>
          <div className="contact-meta">
            <span className="contact-label">{t("email")}</span>
            <span className="contact-value">{CONTACT.email}</span>
          </div>
          <div className="contact-buttons">
            <a className="btn primary small" href={gmailLink(SUBJECT + "Hello")} target="_blank" rel="noreferrer">
              ✉️ Gmail
            </a>
            <a className="btn small" href={mailtoLink(SUBJECT + "Hello")}>
              📨 {t("contact_sendEmail")}
            </a>
            <button className="btn small" type="button" onClick={copyEmail}>
              {copied ? "✓ Copied" : "📋 Copy"}
            </button>
          </div>
        </div>
      </div>

      <section className="contact-reasons">
        <h3>{t("contact_quickReasons")}</h3>
        <p className="muted small">{t("contact_quickReasonsSubtitle")}</p>
        <div className="reason-grid">
          {reasons.map((r) => (
            <a
              key={r.key}
              href={gmailLink(r.subj)}
              className="reason-card"
              target="_blank"
              rel="noreferrer"
            >
              <span className="reason-icon">{r.icon}</span>
              <span>{t(r.key)}</span>
            </a>
          ))}
        </div>
      </section>

      <div className="contact-footnote">
        <p className="muted small">⏱️ {t("contact_responseTime")}</p>
        <p className="muted small">🔒 {t("contact_privacy")}</p>
      </div>
    </div>
  );
}
