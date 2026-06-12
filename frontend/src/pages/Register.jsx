import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LangContext.jsx";
import GoogleSignIn from "../components/GoogleSignIn.jsx";

export default function Register() {
  const { register } = useAuth();
  const { t, lang } = useLang();
  const nav = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    preferred_language: lang,
  });
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      nav("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="form-page">
      <h2>{t("register")}</h2>
      <form onSubmit={onSubmit}>
        <label>{t("name")}
          <input value={form.full_name} onChange={set("full_name")} required />
        </label>
        <label>{t("email")}
          <input type="email" value={form.email} onChange={set("email")} required />
        </label>
        <label>{t("password")}
          <input type="password" value={form.password} onChange={set("password")} required minLength={6} />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn primary" type="submit">{t("register")}</button>
      </form>
      <GoogleSignIn />
      <p>Already have an account? <Link to="/login">{t("login")}</Link></p>
    </div>
  );
}
