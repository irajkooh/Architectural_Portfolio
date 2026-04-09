import { Mail, Linkedin, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useConfig } from "../ConfigContext";
import toast from "react-hot-toast";

export default function ContactSection() {
  const { config } = useConfig();
  const contact = config?.contact;
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [canSend, setCanSend] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/contact/available")
      .then((r) => r.json())
      .then((d) => setCanSend(d.available))
      .catch(() => setCanSend(null));
  }, []);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!canSend) return;
    setSending(true);
    try {
      const res = await fetch("/api/contact/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to send");
      }
      toast.success("Message sent successfully!");
      setForm({ name: "", email: "", message: "" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid var(--border)" }}>
      <div className="section" style={{ maxWidth: 900 }}>
        <p className="section-label">Contact</p>
        <h2 className="section-title">Let's Work Together</h2>
        <div className="gold-line" />
        <p className="section-subtitle">{contact?.message}</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "start" }}>

          {/* ── Left: Contact links ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {contact?.email && (
              <a
                href={`mailto:${contact.email}`}
                style={{
                  display: "flex", alignItems: "center", gap: "1rem",
                  padding: "1.25rem 1.5rem", background: "var(--surface)",
                  border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                <div style={{ background: "rgba(201,168,76,0.15)", padding: "0.75rem", borderRadius: "50%" }}>
                  <Mail size={20} style={{ color: "var(--accent)" }} />
                </div>
                <div>
                  <p style={{ fontSize: "0.75rem", opacity: 0.5, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.2rem" }}>Email</p>
                  <p style={{ fontSize: "0.95rem" }}>{contact.email}</p>
                </div>
              </a>
            )}

            {contact?.linkedin && (
              <a
                href={contact.linkedin.startsWith("http") ? contact.linkedin : `https://${contact.linkedin}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: "1rem",
                  padding: "1.25rem 1.5rem", background: "var(--surface)",
                  border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                <div style={{ background: "rgba(201,168,76,0.15)", padding: "0.75rem", borderRadius: "50%" }}>
                  <Linkedin size={20} style={{ color: "var(--accent)" }} />
                </div>
                <div>
                  <p style={{ fontSize: "0.75rem", opacity: 0.5, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.2rem" }}>LinkedIn</p>
                  <p style={{ fontSize: "0.95rem" }}>Tella Irani Shemirani</p>
                </div>
              </a>
            )}
          </div>

          {/* ── Right: Form when SMTP available, instructions otherwise ── */}
          {canSend === true ? (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="field">
                <label>Your Name</label>
                <input
                  className="input"
                  required
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="field">
                <label>Your Email</label>
                <input
                  className="input"
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="field">
                <label>Message</label>
                <textarea
                  className="textarea"
                  required
                  placeholder="Tell me about your project..."
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                />
              </div>
              <button type="submit" className="btn btn-accent" disabled={sending}>
                <Send size={16} />
                {sending ? "Sending..." : "Send Message"}
              </button>
            </form>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
              }}>
                <p style={{ fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--accent)" }}>
                  How to reach me
                </p>
                <p style={{ fontSize: "0.95rem", lineHeight: 1.75, opacity: 0.85 }}>
                  Click the <strong>Email</strong> link on the left — it opens your email app with my address pre-filled and ready to go.
                </p>
                <p style={{ fontSize: "0.88rem", lineHeight: 1.7, opacity: 0.6 }}>
                  Or copy my email address and send me a message directly from any mail app. I typically respond within 1–2 business days.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-accent"
                disabled
                style={{ opacity: 0.35, cursor: "not-allowed" }}
              >
                <Send size={15} />
                Send Message (Coming Soon)
              </button>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
