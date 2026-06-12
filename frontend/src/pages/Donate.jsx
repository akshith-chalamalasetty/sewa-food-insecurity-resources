import { useState } from "react";
import { useLang } from "../context/LangContext.jsx";

// Real Venmo profile. To change later, edit these two lines:
const VENMO_USERNAME = "KIRAN-CHALAMALASETTY";
const VENMO_URL = `https://venmo.com/u/${VENMO_USERNAME}`;

// Free public QR-code service.
const QR_SRC = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(VENMO_URL)}`;

const note = encodeURIComponent("Sewa Food Resources");
const venmoLink = (amount) =>
  amount && Number(amount) > 0
    ? `${VENMO_URL}?txn=pay&amount=${amount}&note=${note}`
    : VENMO_URL;

export default function Donate() {
  const { t } = useLang();
  const [custom, setCustom] = useState("");

  const presets = [10, 25, 50, 100];

  return (
    <div className="page">
      <h2>💝 {t("donate")}</h2>
      <p className="muted">{t("donateIntro")}</p>

      <div className="donate-card">
        <div className="donate-left">
          <div className="venmo-brand">
            <span className="venmo-logo" aria-hidden>𝓥</span>
            <h3>{t("donate_venmoTitle")}</h3>
          </div>
          <p>{t("donate_venmoSubtitle")}</p>

          <div className="amount-chips">
            {presets.map((a) => (
              <a key={a} className="amount-chip" href={venmoLink(a)} target="_blank" rel="noreferrer">
                ${a}
              </a>
            ))}
          </div>

          <div className="custom-amount">
            <span className="dollar-sign">$</span>
            <input
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              placeholder={t("donate_otherAmount")}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
            />
            <a
              className={`btn primary ${!custom || Number(custom) <= 0 ? "disabled" : ""}`}
              href={venmoLink(custom)}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => { if (!custom || Number(custom) <= 0) e.preventDefault(); }}
            >
              {custom && Number(custom) > 0 ? `${t("donate")} $${custom}` : t("donate")}
            </a>
          </div>

          <a className="btn large venmo-btn" href={VENMO_URL} target="_blank" rel="noreferrer">
            {t("donate_openVenmo")}
          </a>

          <p className="venmo-handle">@{VENMO_USERNAME}</p>
        </div>

        <div className="donate-right">
          <p className="muted small">{t("donate_scanQR")}</p>
          <img src={QR_SRC} alt={`Venmo QR for ${VENMO_USERNAME}`} className="qr-image" />
          <p className="muted small">{t("donate_qrInstr")}</p>
        </div>
      </div>

      <div className="donate-footnote">
        <p className="muted small">{t("donate_thankYouNote")}</p>
        <p className="muted small">{t("donate_taxNote")}</p>
      </div>
    </div>
  );
}
