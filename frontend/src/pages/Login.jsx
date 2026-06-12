import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LangContext.jsx";
import GoogleSignIn from "../components/GoogleSignIn.jsx";

export default function Login() {
  const { login } = useAuth();
  const { t } = useLang();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      nav("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="form-page">
      <h2>{t("login")}</h2>
      <form onSubmit={onSubmit}>
        <label>{t("email")}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>{t("password")}
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn primary" type="submit">{t("login")}</button>
      </form>
      <GoogleSignIn />
      <p>New here? <Link to="/register">{t("register")}</Link></p>
    </div>
  );
}
