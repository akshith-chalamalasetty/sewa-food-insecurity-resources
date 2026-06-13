import { useState, useRef, useEffect } from "react";
import { api } from "../api";
import { useLang } from "../context/LangContext.jsx";

export default function Chatbot() {
  const { t, lang } = useLang();
  const [messages, setMessages] = useState([
    { role: "assistant", content: t("chatGreeting") },
  ]);
  const [suggestions, setSuggestions] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { api.chatStatus().then(setStatus).catch(() => setStatus({ ai_online: false })); }, []);

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message) return;
    const newHistory = [...messages, { role: "user", content: message }];
    setMessages(newHistory);
    setInput("");
    setBusy(true);
    try {
      // Send full conversation (Ollama uses it; rule-based ignores it)
      const r = await api.chat(message, lang, newHistory.slice(0, -1));
      setMessages((m) => [...m, { role: "assistant", content: r.reply, source: r.source }]);
      setSuggestions(r.suggestions || []);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, something went wrong." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page chat">
      <div className="chat-header">
        <h2>{t("chatbot")}</h2>
        {status && (
          <span className={`status-dot ${status.ai_online ? "online" : "offline"}`}>
            {status.ai_online
              ? `🟢 AI online (${status.model})`
              : "🟡 Fallback mode (no AI key configured)"}
          </span>
        )}
      </div>

      <div className="chat-window">
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role === "user" ? "user" : "bot"}`}>
            {m.content}
            {m.source === "gemini" && <span className="bubble-tag">AI</span>}
          </div>
        ))}
        {busy && <div className="bubble bot typing">…</div>}
        <div ref={endRef} />
      </div>

      {suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((s, i) => (
            <button key={i} className="btn" onClick={() => send(s)}>{s}</button>
          ))}
        </div>
      )}

      <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <input
          placeholder={t("chatPlaceholder")}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="btn primary" type="submit" disabled={busy}>{t("chatSend")}</button>
      </form>
    </div>
  );
}
