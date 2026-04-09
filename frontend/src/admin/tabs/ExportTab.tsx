import { useState } from "react";
import { api } from "../../api";
import toast from "react-hot-toast";
import { Download, FileText, File } from "lucide-react";

export default function ExportTab() {
  const [generating, setGenerating] = useState<"" | "pdf" | "docx">("");

  const downloadPortfolio = async (fmt: "pdf" | "docx") => {
    setGenerating(fmt);
    try {
      const resp = await api.get(`/api/portfolio/download?fmt=${fmt}`, { responseType: "blob" });
      const url = URL.createObjectURL(resp.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `electronic_portfolio.${fmt}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(`electronic_portfolio.${fmt} downloaded!`);
    } catch {
      toast.error("Generation failed.");
    }
    setGenerating("");
  };

  return (
    <div>
      <h2 style={{ fontFamily: "var(--header-font)", fontSize: "1.5rem", marginBottom: "0.25rem" }}>
        Download Electronic Portfolio
      </h2>
      <p style={{ opacity: 0.5, fontSize: "0.9rem", marginBottom: "2.5rem" }}>
        Generate and download the electronic portfolio from the current site content.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 420 }}>
        <button
          className="btn btn-accent"
          onClick={() => downloadPortfolio("pdf")}
          disabled={generating !== ""}
          style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.5rem", fontSize: "1rem" }}
        >
          <FileText size={20} />
          <span>
            {generating === "pdf" ? "Generating PDF…" : "Download electronic_portfolio.pdf"}
          </span>
          {generating !== "pdf" && <Download size={16} style={{ marginLeft: "auto" }} />}
        </button>

        <button
          className="btn btn-outline"
          onClick={() => downloadPortfolio("docx")}
          disabled={generating !== ""}
          style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.5rem", fontSize: "1rem" }}
        >
          <File size={20} />
          <span>
            {generating === "docx" ? "Generating DOCX…" : "Download electronic_portfolio.docx"}
          </span>
          {generating !== "docx" && <Download size={16} style={{ marginLeft: "auto" }} />}
        </button>
      </div>

      <p style={{ opacity: 0.4, fontSize: "0.8rem", marginTop: "1.5rem" }}>
        Both files are generated fresh from the current portfolio content (projects, resume, about, etc.).
      </p>
    </div>
  );
}
