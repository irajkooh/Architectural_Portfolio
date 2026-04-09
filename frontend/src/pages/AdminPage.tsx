import { useState, useEffect } from "react";
import AdminLogin from "../admin/AdminLogin";
import AdminPanel from "../admin/AdminPanel";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("adminPass");
    if (stored) setAuthed(true);
  }, []);

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;
  return <AdminPanel onLogout={() => setAuthed(false)} />;
}
