import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LangContext.jsx";

const AVAIL_OPTIONS = [
  { key: "weekdays", tKey: "vol_availWeekdays", icon: "🗓️" },
  { key: "evenings", tKey: "vol_availEvenings", icon: "🌙" },
  { key: "weekends", tKey: "vol_availWeekends", icon: "☀️" },
];

export default function Volunteers() {
  const { t } = useLang();
  const { user } = useAuth();
  const [zip, setZip] = useState("");
  const [searchLang, setSearchLang] = useState("");
  const [rows, setRows] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const [phone, setPhone] = useState("");
  const [zips, setZips] = useState("");
  const [languages, setLanguages] = useState("");
  const [avail, setAvail] = useState(new Set());
  const [hasCar, setHasCar] = useState(false);
  const [notes, setNotes] = useState("");

  const load = async () => {
    const params = {};
    if (zip) params.zip = zip;
    if (searchLang) params.language = searchLang;
    setRows(await api.volunteers(params));
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const toggleAvail = (key) => {
    const next = new Set(avail);
    next.has(key) ? next.delete(key) : next.add(key);
    setAvail(next);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const availText = Array.from(avail).map((a) => {
      const opt = AVAIL_OPTIONS.find((o) => o.key === a);
      return opt ? t(opt.tKey) : a;
    });
    const parts = [];
    if (availText.length) parts.push(`${t("vol_availability")}: ${availText.join(", ")}`);
    if (hasCar) parts.push(`🚗 ${t("vol_hasCar")}`);
    if (notes.trim()) parts.push(notes.trim());
    try {
      await api.registerVolunteer({
        phone: phone || null,
        service_zips: zips || null,
        languages: languages.trim() || "English",
        notes: parts.join(" · ") || null,
      });
      setShowForm(false);
      setDone(true);
      setPhone(""); setZips(""); setLanguages(""); setAvail(new Set()); setHasCar(false); setNotes("");
      await load();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="page">
      <h2>🤝 {t("volunteers")}</h2>
      <p className="muted">{t("volunteersIntro")}</p>

      {user ? (
        <>
          {done && <p className="badge ok saved-pill">✓ {t("vol_joined")}</p>}
          <button className="btn primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? t("cancel") : `🤝 ${t("vol_signupTitle")}`}
          </button>
          {showForm && (
            <form className="card-form vol-form" onSubmit={submit}>
              <p className="muted small">👤 {t("donors_signingAs")} <strong>{user.full_name}</strong> · 📧 {user.email}</p>

              <label className="field-label">{t("phone")} <span className="muted small">({t("vol_optional")})</span>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(213) 555-0100" />
              </label>

              <label className="field-label">{t("vol_zipsLabel")}
                <input value={zips} onChange={(e) => setZips(e.target.value)} placeholder="90011, 90015" required />
              </label>

              <label className="field-label">{t("vol_languages")}
                <input
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder={t("vol_langsPlaceholder")}
                  required
                />
              </label>

              <div className="field-label">{t("vol_availability")}
                <div className="chip-row">
                  {AVAIL_OPTIONS.map((a) => (
                    <button key={a.key} type="button"
                      className={`pill ${avail.has(a.key) ? "active" : ""}`}
                      onClick={() => toggleAvail(a.key)}>
                      {a.icon} {t(a.tKey)}
                    </button>
                  ))}
                </div>
              </div>

              <label className="check">
                <input type="checkbox" checked={hasCar} onChange={(e) => setHasCar(e.target.checked)} />
                🚗 {t("vol_hasCar")}
              </label>

              <label className="field-label">{t("notes")} <span className="muted small">({t("vol_optional")})</span>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
              </label>

              {error && <p className="error">{error}</p>}
              <button className="btn primary" type="submit">{t("submit")}</button>
            </form>
          )}
        </>
      ) : (
        <p className="muted">🔑 {t("vol_loginRequired")} <Link to="/login">{t("login")}</Link></p>
      )}

      <form className="filter-row" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <input placeholder={t("zip")} value={zip} onChange={(e) => setZip(e.target.value)} maxLength={5} />
        <input
          placeholder={`🌐 ${t("vol_languages")}`}
          value={searchLang}
          onChange={(e) => setSearchLang(e.target.value)}
        />
        <button className="btn primary" type="submit">{t("search")}</button>
      </form>

      <div className="list">
        {rows.map((v) => (
          <article key={v.id} className="resource-card">
            <header>
              <h3>{v.name}</h3>
              <span className="badge">{v.role === "snap_coordinator" ? t("snapCoordinator") : t("volunteer")}</span>
            </header>
            {v.phone && <p className="rc-meta">📞 <a href={`tel:${v.phone}`}>{v.phone}</a></p>}
            {v.email && <p className="rc-meta">📧 <a href={`mailto:${v.email}`}>{v.email}</a></p>}
            {v.service_zips && <p className="rc-meta">📍 {v.service_zips}</p>}
            <p className="muted small">🌐 {v.languages}</p>
            {v.notes && <p>{v.notes}</p>}
          </article>
        ))}
        {rows.length === 0 && <p className="muted">{t("vol_emptyList")}</p>}
      </div>
    </div>
  );
}
