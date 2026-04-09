import { useState } from "react";
import { api } from "../../api";
import { useConfig } from "../../ConfigContext";
import Dropzone from "../../components/Dropzone";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

export default function PortfolioTab() {
  const { config, refresh } = useConfig();
  const portfolio = config?.portfolio;

  const [uploading, setUploading] = useState(false);
  const [ingesting, setIngesting] = useState(false);

  const uploadPortfolio = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post("/api/admin/portfolio/file", fd);
      await refresh();
      toast.success("Portfolio uploaded!");
    } catch { toast.error("Upload failed."); }
    setUploading(false);
  };

  const deletePortfolio = async () => {
    await api.delete("/api/admin/portfolio/file");
    await refresh();
    toast.success("Portfolio removed.");
  };

  const ingestPortfolio = async () => {
    setIngesting(true);
    try {
      const r = await api.post("/api/admin/chat/ingest", {});
      toast.success(`Ingested ${r.data.chunks} chunks into chatbot.`);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Ingest failed.");
    }
    setIngesting(false);
  };

  return (
    <div>
      <h2 style={{ fontFamily: "var(--header-font)", fontSize: "1.5rem", marginBottom: "0.25rem" }}>Portfolio</h2>
      <p style={{ opacity: 0.5, fontSize: "0.9rem", marginBottom: "2rem" }}>
        Upload your portfolio PDF — it will appear as a "Download Portfolio" button in the hero section and will be ingested into the chatbot.
      </p>

      <div className="field">
        <label>Portfolio PDF</label>
        {portfolio?.file ? (
          <div>
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden", aspectRatio: "3/2", marginBottom: "0.75rem" }}>
              <iframe src="/api/portfolio/preview" style={{ width: "100%", height: "100%", border: "none" }} title="Portfolio" />
            </div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <a href={portfolio.file} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}>
                Open PDF
              </a>
              <a href={portfolio.file} download className="btn btn-accent" style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}>
                Download PDF
              </a>
              <button className="btn btn-outline" onClick={ingestPortfolio} disabled={ingesting} style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}>
                {ingesting ? "Ingesting..." : "Re-ingest into Chatbot"}
              </button>
              <button className="btn btn-danger" onClick={deletePortfolio} style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}>
                <Trash2 size={14} /> Remove
              </button>
            </div>
            <div style={{ marginTop: "1rem" }}>
              <Dropzone onFile={uploadPortfolio} accept={{ "application/pdf": [".pdf"] }} label="Drop new PDF to replace" />
            </div>
          </div>
        ) : (
          <Dropzone
            onFile={uploadPortfolio}
            accept={{ "application/pdf": [".pdf"] }}
            label={uploading ? "Uploading..." : "Drop portfolio PDF here"}
          />
        )}
      </div>
    </div>
  );
}
