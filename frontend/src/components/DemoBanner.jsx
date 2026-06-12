import { useLang } from "../context/LangContext.jsx";

/** Honest banner shown above lists that currently contain sample data. */
export default function DemoBanner() {
  const { t } = useLang();
  return (
    <div className="demo-banner" role="note">
      ⚠️ {t("demoBanner")}
    </div>
  );
}
