import { Download, FileText } from "lucide-react";
import { useState } from "react";
import { useConfig } from "../ConfigContext";

export default function ResumeSection() {
  const { config } = useConfig();
  const resume = config?.resume;
  const [previewError, setPreviewError] = useState(false);
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const previewSrc = isLocal
    ? "/api/resume/preview"
    : `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(window.location.origin + resume?.file)}`;

  if (config && !config.resume?.visible) return null;
  if (!config || !resume) return null;

  return (
    <section id="resume" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="section">
        <p className="section-label">Resume</p>
        <h2 className="section-title">Curriculum Vitae</h2>
        <div className="gold-line" />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start" }}>
          {/* PDF Preview */}
          <div>
            {resume.file ? (
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                  aspectRatio: "3/4",
                }}
              >
                {previewError ? (
                  <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", opacity: 0.5 }}>
                    <FileText size={48} />
                    <p style={{ fontSize: "0.85rem" }}>Preview unavailable</p>
                    <p style={{ fontSize: "0.75rem" }}>Use the download button →</p>
                  </div>
                ) : (
                  <iframe
                    src={previewSrc}
                    style={{ width: "100%", height: "100%", border: "none" }}
                    title="Resume Preview"
                    onError={() => setPreviewError(true)}
                  />
                )}
              </div>
            ) : (
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  aspectRatio: "3/4",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.35,
                  gap: "1rem",
                }}
              >
                <FileText size={60} />
                <p style={{ fontSize: "0.9rem" }}>Resume not uploaded yet</p>
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p style={{ fontSize: "1.05rem", opacity: 0.7, lineHeight: 1.8, marginBottom: "2rem" }}>
              Download my full curriculum vitae to explore my academic background, professional
              experience, and design competencies in detail.
            </p>

            {resume.file && (
              <a href={resume.file} target="_blank" rel="noreferrer" download className="btn btn-accent" style={{ marginBottom: "2.5rem", display: "inline-flex" }}>
                <Download size={16} />
                Download Resume
              </a>
            )}

            {/* Highlights */}
            {resume.highlights && resume.highlights.length > 0 && (
              <div>
                <h4 style={{ fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "1.25rem" }}>
                  Key Competencies
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.75rem",
                  }}
                >
                  {resume.highlights.map((h, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "0.85rem 1rem",
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                        fontSize: "0.85rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span style={{ color: "var(--accent)", fontSize: "1rem" }}>—</span>
                      {h}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
