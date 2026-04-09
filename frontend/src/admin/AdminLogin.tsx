import { useState } from "react";
import { Lock } from "lucide-react";
import { verifyAdmin } from "../api";
import toast from "react-hot-toast";

interface Props { onLogin: () => void; }

export default function AdminLogin({ onLogin }: Props) {
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyAdmin(pass);
      sessionStorage.setItem("adminPass", pass);
      toast.success("Welcome back!");
      onLogin();
    } catch {
      toast.error("Invalid password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "min(420px, 100%)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "3rem",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(201,168,76,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
            }}
          >
            <Lock size={24} style={{ color: "var(--accent)" }} />
          </div>
          <h1 style={{ fontFamily: "var(--header-font)", fontSize: "1.8rem", marginBottom: "0.5rem" }}>
            Admin Panel
          </h1>
          <p style={{ opacity: 0.5, fontSize: "0.9rem" }}>Portfolio management for Tella Irani Shemirani</p>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div className="field">
            <label>Password</label>
            <input
              className="input"
              type="password"
              required
              placeholder="Enter admin password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-accent" disabled={loading}>
            {loading ? "Verifying..." : "Enter Admin Panel"}
          </button>
          <a href="/" className="btn btn-outline" style={{ textAlign: "center", justifyContent: "center" }}>
            Back to Portfolio
          </a>
        </form>
      </div>
    </div>
  );
}
