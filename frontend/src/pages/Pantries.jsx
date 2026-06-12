import { useEffect, useState } from "react";
import { api } from "../api";
import { useLang } from "../context/LangContext.jsx";
import PantryMap from "../components/PantryMap.jsx";

export default function Pantries() {
  const { t } = useLang();
  const [zip, setZip] = useState("");
  const [noElig, setNoElig] = useState(true);
  const [noId, setNoId] = useState(true);
  const [immSafe, setImmSafe] = useState(true);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLoc, setUserLoc] = useState(null);
  const [locStatus, setLocStatus] = useState("idle");

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (zip) params.zip = zip;
      if (noElig) params.no_eligibility_only = true;
      if (noId) params.no_id_only = true;
      if (immSafe) params.immigration_safe_only = true;
      setRows(await api.pantries(params));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const askLocation = () => {
    if (!navigator.geolocation) { setLocStatus("denied"); return; }
    setLocStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocStatus("ok");
      },
      () => setLocStatus("denied"),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  return (
    <div className="page">
      <h2>🥕 {t("pantries")}</h2>
      <p className="muted">{t("pantriesIntro")}</p>

      <div className="view-toggle">
        <button className="pill active" onClick={askLocation} disabled={locStatus === "locating"}>
          {locStatus === "locating" ? t("locating") : t("useMyLocation")}
        </button>
        {locStatus === "denied" && <span className="muted small">{t("locationDenied")}</span>}
        {locStatus === "ok" && <span className="muted small">📍 Located</span>}
      </div>

      <form className="filter-row" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <input placeholder={t("zip")} value={zip} onChange={(e) => setZip(e.target.value)} maxLength={5} inputMode="numeric" />
        <label className="check"><input type="checkbox" checked={noElig} onChange={(e) => setNoElig(e.target.checked)} /> {t("noEligibility")}</label>
        <label className="check"><input type="checkbox" checked={noId} onChange={(e) => setNoId(e.target.checked)} /> {t("noId")}</label>
        <label className="check"><input type="checkbox" checked={immSafe} onChange={(e) => setImmSafe(e.target.checked)} /> {t("immigrationSafe")}</label>
        <button className="btn primary" type="submit">{t("search")}</button>
      </form>

      {loading ? <p>{t("loading")}</p> : <PantryMap pantries={rows} userLoc={userLoc} />}
    </div>
  );
}
