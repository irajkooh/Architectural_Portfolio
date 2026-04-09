import { useState, useRef, useEffect } from "react";
import { Send, X, Copy, Volume2, VolumeX, Cpu } from "lucide-react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";

interface ChatInfo { device: string; model: string; location: string; }

interface Message {
  id: string;
  question: string;
  answer: string;
}

export default function ChatSection() {
  const [messages, setMessages]       = useState<Message[]>([]);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [summary, setSummary]         = useState("");
  const [reading, setReading]         = useState(false);
  const [sampleQuestions, setSampleQuestions] = useState<string[]>([]);
  const [info, setInfo]               = useState<ChatInfo | null>(null);
  const bottomRef                     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchQuestions = () =>
      fetch("/api/chat/sample-questions", { cache: "no-store" })
        .then((r) => r.json()).then(setSampleQuestions).catch(() => {});

    fetchQuestions();
    fetch("/api/chat/info", { cache: "no-store" })
      .then((r) => r.json()).then(setInfo).catch(() => {});

    const onVisible = () => { if (document.visibilityState === "visible") fetchQuestions(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  useEffect(() => {
    if (messages.length > 0 || loading)
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (question: string) => {
    const q = question.trim();
    if (!q || loading) return;
    setInput("");
    setLoading(true);
    try {
      const res  = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ question: q, chat_summary: summary }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Error");
      const msg: Message = { id: Date.now().toString(), question: q, answer: data.answer };
      setMessages((m) => [...m, msg]);
      setSummary(data.summary);
      if (reading) speak(data.answer);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to get answer");
    }
    setLoading(false);
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    // Strip markdown special characters so the reader doesn't say them aloud
    const clean = text
      .replace(/\*\*(.+?)\*\*/g, "$1")   // bold
      .replace(/\*(.+?)\*/g, "$1")        // italic
      .replace(/`+([^`]*)`+/g, "$1")      // code
      .replace(/#{1,6}\s*/g, "")          // headings
      .replace(/[*_~>#|\\]/g, "")         // remaining special chars
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links → text only
      .replace(/\s{2,}/g, " ")
      .trim();
    const utt   = new SpeechSynthesisUtterance(clean);
    utt.onend   = () => setReading(false);
    utt.onerror = () => setReading(false);
    window.speechSynthesis.speak(utt);
    setReading(true);
  };

  const toggleRead = () => {
    if (reading) {
      window.speechSynthesis.cancel();
      setReading(false);
    } else if (messages.length > 0) {
      speak(messages[messages.length - 1].answer);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  const clear = () => {
    window.speechSynthesis.cancel();
    setMessages([]);
    setSummary("");
    setReading(false);
  };

  return (
    <section id="chat" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="section" style={{ maxWidth: 800 }}>
        <p className="section-label">Chat</p>
        <h2 className="section-title">Ask About My Work</h2>
        <div className="gold-line" />
        <p className="section-subtitle">
          Ask anything about my education, experience, or skills — answered from my resume.
        </p>

        {/* Status bar */}
        {info && (
          <div style={{
            display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap",
            background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.25)",
            borderRadius: "var(--radius)", padding: "0.55rem 1rem",
            fontSize: "0.78rem", color: "#60a5fa", marginBottom: "1.5rem",
          }}>
            <Cpu size={13} style={{ flexShrink: 0 }} />
            <span>
              Running:{" "}
              <a href={info.location} target="_blank" rel="noreferrer"
                style={{ color: "#60a5fa", textDecoration: "underline" }}>
                {info.location}
              </a>
            </span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span>Device: <strong style={{ color: "#93c5fd" }}>{info.device}</strong></span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span>LLM: <strong style={{ color: "#93c5fd" }}>{info.model}</strong></span>
          </div>
        )}

        {/* Messages */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "1.5rem" }}>
          {messages.length === 0 && !loading && (
            <p style={{ opacity: 0.35, textAlign: "center", padding: "1.5rem 0", fontSize: "0.9rem" }}>
              Ask a question or pick one below...
            </p>
          )}

          {messages.map((m) => (
            <div key={m.id}>
              {/* Question bubble */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.6rem" }}>
                <div style={{
                  background: "rgba(201,168,76,0.12)",
                  border: "1px solid rgba(201,168,76,0.25)",
                  borderRadius: "var(--radius-lg)",
                  padding: "0.75rem 1.1rem",
                  maxWidth: "75%",
                  fontSize: "0.95rem",
                }}>
                  {m.question}
                </div>
              </div>

              {/* Answer bubble + copy */}
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                <div style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "0.85rem 1.1rem",
                  flex: 1,
                  fontSize: "0.95rem",
                  lineHeight: 1.75,
                }}>
                  <ReactMarkdown>{m.answer}</ReactMarkdown>
                </div>
                <button
                  onClick={() => copy(m.answer)}
                  title="Copy answer"
                  style={{
                    background: "none",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: "0.45rem",
                    cursor: "pointer",
                    color: "var(--fg)",
                    opacity: 0.45,
                    flexShrink: 0,
                    marginTop: 3,
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.45")}
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", gap: "6px", paddingLeft: "0.25rem", alignItems: "center" }}>
              <span className="chat-dot" />
              <span className="chat-dot" style={{ animationDelay: "0.2s" }} />
              <span className="chat-dot" style={{ animationDelay: "0.4s" }} />
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Sample questions */}
        {sampleQuestions.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "0.5rem",
            marginBottom: "1.25rem",
          }}>
            {sampleQuestions.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                disabled={loading}
                style={{
                  padding: "0.6rem 1rem",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--fg)",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  opacity: 0.7,
                  transition: "border-color 0.2s, opacity 0.2s",
                  textAlign: "left",
                  lineHeight: 1.4,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.opacity = "1"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.opacity = "0.7"; }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <button
            onClick={toggleRead}
            className={`btn ${reading ? "btn-accent" : "btn-outline"}`}
            style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", gap: "0.4rem" }}
            title={reading ? "Stop reading" : "Read last answer aloud"}
            disabled={messages.length === 0}
          >
            {reading ? <Volume2 size={15} /> : <VolumeX size={15} />}
            READ
          </button>
          <button
            onClick={clear}
            className="btn btn-outline"
            style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}
            disabled={messages.length === 0}
          >
            <X size={14} /> Clear Chat
          </button>
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          style={{ display: "flex", gap: "0.75rem" }}
        >
          <input
            className="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about education, skills, projects..."
            disabled={loading}
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            className="btn btn-accent"
            disabled={loading || !input.trim()}
            style={{ padding: "0 1.25rem" }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </section>
  );
}
