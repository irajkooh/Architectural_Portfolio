import { Linkedin, User } from "lucide-react";
import { useConfig } from "../ConfigContext";

export default function AboutSection() {
  const { config } = useConfig();
  const about = config?.about;

  return (
    <section id="about" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="section">
        <p className="section-label">About</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "start" }}>
          {/* Left: Photo + education */}
          <div>
            {/* Photo */}
            <div
              style={{
                width: "100%",
                aspectRatio: "3/4",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                marginBottom: "2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {about?.photo ? (
                <img
                  src={about.photo}
                  alt="Tella Irani Shemirani"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ textAlign: "center", opacity: 0.3 }}>
                  <User size={80} />
                  <p style={{ marginTop: "1rem", fontSize: "0.85rem" }}>Photo placeholder</p>
                </div>
              )}
            </div>

            {/* Education Timeline */}
            {about?.education && about.education.length > 0 && (
              <div>
                <h4 style={{ marginBottom: "1.25rem", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)" }}>
                  Education
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {about.education.map((e, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: "1rem",
                        paddingBottom: "1rem",
                        borderBottom: i < about.education.length - 1 ? "1px solid var(--border)" : "none",
                      }}
                    >
                      <span style={{ color: "var(--accent)", fontSize: "0.85rem", minWidth: 40, paddingTop: "0.1rem" }}>
                        {e.year}
                      </span>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: "0.95rem" }}>{e.degree}</p>
                        <p style={{ fontSize: "0.85rem", opacity: 0.6 }}>{e.institution}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Bio + skills + LinkedIn */}
          <div>
            <h2 className="section-title">
              {about?.bio?.split(".")[0] ? "About Me" : "About Me"}
            </h2>
            <div className="gold-line" />

            <p style={{ fontSize: "1.05rem", lineHeight: 1.8, marginBottom: "2rem", opacity: 0.85 }}>
              {about?.bio}
            </p>

            {about?.philosophy && (
              <blockquote
                style={{
                  borderLeft: "3px solid var(--accent)",
                  paddingLeft: "1.5rem",
                  marginBottom: "2rem",
                  fontFamily: "var(--header-font)",
                  fontSize: "1.1rem",
                  fontStyle: "italic",
                  opacity: 0.8,
                  lineHeight: 1.7,
                }}
              >
                {about.philosophy}
              </blockquote>
            )}

            {/* Skills */}
            {about?.skills && about.skills.length > 0 && (
              <div style={{ marginBottom: "2rem" }}>
                <h4 style={{ fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "1rem" }}>
                  Skills
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {about.skills.map((s, i) => (
                    <span key={i} className="chip">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Honors & Awards */}
            {about?.honors && about.honors.length > 0 && (
              <div style={{ marginBottom: "2rem" }}>
                <h4 style={{ fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "1rem" }}>
                  Honors &amp; Awards
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  {about.honors.map((h, i) => (
                    <div key={i} style={{ display: "flex", gap: "1rem" }}>
                      <span style={{ color: "var(--accent)", fontSize: "0.85rem", minWidth: 40, paddingTop: "0.15rem", flexShrink: 0 }}>{h.year}</span>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: "0.95rem", marginBottom: "0.2rem" }}>{h.title}</p>
                        {h.description && <p style={{ fontSize: "0.85rem", opacity: 0.6, lineHeight: 1.6, marginBottom: "0.4rem" }}>{h.description}</p>}
                        {h.url && (
                          <a href={h.url} target="_blank" rel="noreferrer" style={{ fontSize: "0.8rem", color: "var(--accent)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                          >
                            View Details →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Publications */}
            {about?.publications && about.publications.length > 0 && (
              <div style={{ marginBottom: "2rem" }}>
                <h4 style={{ fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "1rem" }}>
                  Publications
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  {about.publications.map((p, i) => (
                    <div key={i} style={{ display: "flex", gap: "1rem" }}>
                      <span style={{ color: "var(--accent)", fontSize: "0.85rem", minWidth: 40, paddingTop: "0.15rem", flexShrink: 0 }}>{p.year}</span>
                      <div>
                        <p style={{ fontWeight: 500, fontSize: "0.95rem", marginBottom: "0.2rem" }}>{p.title}</p>
                        {p.venue && <p style={{ fontSize: "0.85rem", opacity: 0.6, marginBottom: "0.4rem" }}>{p.venue}</p>}
                        {p.url && (
                          <a href={p.url} target="_blank" rel="noreferrer" style={{ fontSize: "0.8rem", color: "var(--accent)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                          >
                            View Details →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LinkedIn */}
            {about?.linkedin && (
              <a
                href={about.linkedin.startsWith("http") ? about.linkedin : `https://${about.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline"
                style={{ display: "inline-flex" }}
              >
                <Linkedin size={16} />
                LinkedIn Profile
              </a>
            )}
          </div>
        </div>

        {/* Mobile responsive fix */}
        <style>{`
          @media (max-width: 768px) {
            #about .section > div:not(.section-label) {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
