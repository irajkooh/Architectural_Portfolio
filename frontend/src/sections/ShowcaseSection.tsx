import { useConfig } from "../ConfigContext";
import { Play } from "lucide-react";
import VideoPlayer from "../components/VideoPlayer";

export default function ShowcaseSection() {
  const { config } = useConfig();
  const showcase = config?.showcase;
  const videos = showcase?.videos ?? [];
  const featured = videos[0] ?? null;

  return (
    <section
      id="showcase"
      style={{
        borderTop: "1px solid var(--border)",
        background: "rgba(0,0,0,0.3)",
        position: "relative",
      }}
    >
      <div style={{ height: 3, background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }} />

      <div className="section" style={{ paddingBottom: "2rem" }}>
        <p className="section-label">Showcase</p>
        <h2 className="section-title">{showcase?.title ?? "Showcase"}</h2>
        <div className="gold-line" />
        <p className="section-subtitle">{showcase?.subtitle}</p>
      </div>

      {!featured ? (
        <div className="section" style={{ paddingTop: 0 }}>
          <div
            style={{
              border: "2px dashed var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "5rem 2rem",
              textAlign: "center",
              opacity: 0.35,
            }}
          >
            <Play size={48} style={{ margin: "0 auto 1rem" }} />
            <p>No showcase videos yet. Upload from the admin panel.</p>
          </div>
        </div>
      ) : (
        <div>
          <div
            style={{
              width: "100%",
              height: "85vh",
              overflow: "hidden",
              background: "#000",
              opacity: showcase?.videoOpacity ?? 1,
              position: "relative",
            }}
          >
            <VideoPlayer url={featured.url} width="100%" height="100%" controls fadeEnd={5} />

            {/* Text overlay */}
            {(featured.title || featured.description) && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "2rem 2.5rem",
                  background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)",
                  pointerEvents: "none",
                }}
              >
                {featured.title && (
                  <h2 style={{
                    fontFamily: "var(--header-font)",
                    fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
                    fontWeight: 700,
                    color: "#fff",
                    letterSpacing: "0.03em",
                    marginBottom: featured.description ? "0.4rem" : 0,
                    textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                  }}>
                    {featured.title}
                  </h2>
                )}
                {featured.description && (
                  <p style={{
                    fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.85)",
                    textShadow: "0 1px 4px rgba(0,0,0,0.9)",
                    maxWidth: 600,
                  }}>
                    {featured.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
