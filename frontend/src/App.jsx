import { Routes, Route } from "react-router-dom";
import { useLang } from "./context/LangContext.jsx";
import NavBar from "./components/NavBar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import GetHelp from "./pages/GetHelp.jsx";
import Pantries from "./pages/Pantries.jsx";
import Resources from "./pages/Resources.jsx";
import FoodRecovery from "./pages/FoodRecovery.jsx";
import Volunteers from "./pages/Volunteers.jsx";
import Donors from "./pages/Donors.jsx";
import MealPlanner from "./pages/MealPlanner.jsx";
import Donate from "./pages/Donate.jsx";
import Chatbot from "./pages/Chatbot.jsx";
import Youth from "./pages/Youth.jsx";
import Contact from "./pages/Contact.jsx";

export default function App() {
  const { t } = useLang();
  return (
    <div className="app">
      <div className="footer-safe-strip">🛡️ {t("footer_safe")}</div>
      <NavBar />
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/get-help" element={<GetHelp />} />
          <Route path="/pantries" element={<Pantries />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/food-recovery" element={<FoodRecovery />} />
          <Route path="/volunteers" element={<Volunteers />} />
          <Route path="/donors" element={<Donors />} />
          <Route path="/meal-planner" element={<MealPlanner />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/chat" element={<Chatbot />} />
          <Route path="/youth" element={<Youth />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <strong>🥕 {t("appName")}</strong>
            <p className="muted small">{t("footer_about")}</p>
          </div>
          <div className="footer-links">
            <a href="https://www.211la.org/" target="_blank" rel="noreferrer">211 LA</a>
            <a href="https://www.lafoodbank.org/" target="_blank" rel="noreferrer">LA Food Bank</a>
            <a href="https://www.chirla.org/" target="_blank" rel="noreferrer">CHIRLA</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
