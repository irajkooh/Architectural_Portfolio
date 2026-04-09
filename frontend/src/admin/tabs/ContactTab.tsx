import { useState, useEffect } from "react";
import { api } from "../../api";
import { useConfig } from "../../ConfigContext";
import toast from "react-hot-toast";

export default function ContactTab() {
  const { config, refresh } = useConfig();
  const contact = config?.contact;

  const [form, setForm] = useState({
    email: contact?.email ?? "",
    linkedin: contact?.linkedin ?? "",
    message: contact?.message ?? "",
  });
  const [saving, setSaving] = useState(false);

  const [smtp, setSmtp] = useState({ host: "smtp.gmail.com", port: "587", user: "", pass: "" });
  const [smtpSaving, setSmtpSaving] = useState(false);

  useEffect(() => {
    api.get("/api/admin/smtp")
      .then((r) => setSmtp({ host: r.data.host, port: String(r.data.port), user: r.data.user, pass: r.data.pass }))
      .catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.post("/api/admin/contact", form);
      await refresh();
      toast.success("Contact info saved!");
    } catch { toast.error("Save failed."); }
    setSaving(false);
  };

  const saveSmtp = async () => {
    setSmtpSaving(true);
    try {
      await api.post("/api/admin/smtp", smtp);
      toast.success("SMTP settings saved!");
    } catch { toast.error("Failed to save SMTP."); }
    setSmtpSaving(false);
  };

  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const fs = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setSmtp((p) => ({ ...p, [key]: e.target.value }));

  return (
    <div>
      <h2 style={{ fontFamily: "var(--header-font)", fontSize: "1.5rem", marginBottom: "0.25rem" }}>Contact</h2>
      <p style={{ opacity: 0.5, fontSize: "0.9rem", marginBottom: "2rem" }}>Email, LinkedIn, and section message</p>

      <div className="field">
        <label>Email Address</label>
        <input className="input" type="email" value={form.email} onChange={f("email")} placeholder="your@email.com" />
      </div>
      <div className="field">
        <label>LinkedIn URL</label>
        <input className="input" value={form.linkedin} onChange={f("linkedin")} placeholder="https://linkedin.com/in/..." />
      </div>
      <div className="field">
        <label>Section Intro Message</label>
        <textarea className="textarea" value={form.message} onChange={f("message")} style={{ minHeight: 100 }} placeholder="Let's create something extraordinary..." />
      </div>

      <button className="btn btn-accent" onClick={save} disabled={saving} style={{ marginBottom: "3rem" }}>
        {saving ? "Saving..." : "Save Contact"}
      </button>

      {/* SMTP */}
      <h3 style={{ fontFamily: "var(--header-font)", fontSize: "1.1rem", marginBottom: "0.25rem" }}>Email (SMTP)</h3>
      <p style={{ opacity: 0.5, fontSize: "0.85rem", marginBottom: "1.25rem" }}>
        Used to send contact form messages. For Gmail, use an <strong>App Password</strong> (Google Account → Security → App passwords).
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.75rem" }}>
        <div className="field">
          <label>SMTP Host</label>
          <input className="input" value={smtp.host} onChange={fs("host")} placeholder="smtp.gmail.com" />
        </div>
        <div className="field">
          <label>Port</label>
          <input className="input" value={smtp.port} onChange={fs("port")} placeholder="587" style={{ width: 90 }} />
        </div>
      </div>
      <div className="field">
        <label>Username (email)</label>
        <input className="input" value={smtp.user} onChange={fs("user")} placeholder="you@gmail.com" />
      </div>
      <div className="field">
        <label>Password / App Password</label>
        <input className="input" type="password" value={smtp.pass} onChange={fs("pass")} placeholder="Leave blank to keep existing" />
      </div>

      <button className="btn btn-accent" onClick={saveSmtp} disabled={smtpSaving}>
        {smtpSaving ? "Saving..." : "Save SMTP"}
      </button>
    </div>
  );
}
