import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Play, MapPin, Calendar, Tag, User } from "lucide-react";
import { useConfig } from "../ConfigContext";
import type { Project } from "../types";
import VideoPlayer from "../components/VideoPlayer";

export default function PortfolioSection() {
  const { config } = useConfig();
  const projects = config?.projects ?? [];
  const CATEGORIES = ["All", ...(config?.projectTypes ?? [])];
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState<Project | null>(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const filtered =
    filter === "All" ? projects : projects.filter((p) => p.category === filter);

  const openProject = (p: Project) => {
    setActive(p);
    setImgIdx(0);
    setShowVideo(false);
  };
  const closeProject = () => { setActive(null); setShowVideo(false); };

  const prev = () => setImgIdx((i) => (active ? (i - 1 + active.images.length) % active.images.length : 0));
  const next = () => setImgIdx((i) => (active ? (i + 1) % active.images.length : 0));

  // Parse description lines: bullet lines start with "- ", others are paragraphs
  const descLines = (active?.description ?? "").split(/\n/).filter(Boolean);
  const renderLine = (line: string, i: number) => {
    if (line.startsWith("- ")) {
      const content = line.slice(2);
      // Bold **key:** pattern
      const boldMatch = content.match(/^\*\*(.+?)\*\*:?\s*(.*)/);
      return (
        <div key={i} style={{ display: "flex", gap: "0.5rem", fontSize: "0.88rem", lineHeight: 1.75, opacity: 0.82 }}>
          <span style={{ color: "var(--accent)", flexShrink: 0, marginTop: "0.15rem" }}>—</span>
          <span>
            {boldMatch
              ? <><strong style={{ color: "var(--fg)" }}>{boldMatch[1]}:</strong>{" "}{boldMatch[2]}</>
              : content}
          </span>
        </div>
      );
    }
    return <p key={i} style={{ fontSize: "0.92rem", lineHeight: 1.85, opacity: 0.78 }}>{line}</p>;
  };

  return (
    <section id="portfolio" style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid var(--border)" }}>
      <div className="section">
        <p className="section-label">Portfolio</p>
        <h2 className="section-title">Selected Works</h2>
        <div className="gold-line" />
        <p className="section-subtitle">
          A curated selection of architectural projects spanning residential, commercial, and urban design.
        </p>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "3rem" }}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "100px",
                border: `1px solid ${filter === c ? "var(--accent)" : "var(--border)"}`,
                background: filter === c ? "rgba(201,168,76,0.15)" : "transparent",
                color: filter === c ? "var(--accent)" : "var(--fg)",
                fontSize: "0.8rem",
                letterSpacing: "0.08em",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", opacity: 0.4, padding: "4rem 0" }}>
            <p>No projects yet. Add some from the admin panel.</p>
          </div>
        ) : (
          <div className="grid-3">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="card"
                style={{ cursor: "pointer" }}
                onClick={() => openProject(p)}
              >
                <div style={{ aspectRatio: "4/3", background: "var(--surface)", position: "relative", overflow: "hidden" }}>
                  {p.cover ? (
                    <img
                      src={p.cover}
                      alt={p.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    />
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", opacity: 0.2, fontSize: "0.9rem" }}>
                      No image
                    </div>
                  )}
                  {(p.video || p.videoUrl) && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "0.75rem",
                        right: "0.75rem",
                        background: "var(--accent)",
                        borderRadius: "50%",
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#111",
                      }}
                    >
                      <Play size={14} fill="#111" />
                    </div>
                  )}
                </div>
                <div style={{ padding: "1.25rem" }}>
                  {p.name && (
                    <h3 style={{ fontSize: "1.05rem", fontFamily: "var(--header-font)", marginBottom: "0.3rem" }}>{p.title}</h3>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <p style={{ fontSize: p.name ? "0.8rem" : "1.0rem", fontFamily: p.name ? undefined : "var(--header-font)", fontWeight: p.name ? undefined : 600, opacity: p.name ? 0.6 : 1, margin: 0 }}>
                      {p.name || p.title}
                    </p>
                    <span className="tag">{p.category}</span>
                  </div>
                  {(p.year || p.location) && (
                    <p style={{ fontSize: "0.8rem", opacity: 0.5, marginBottom: "0.5rem" }}>
                      {[p.year, p.location].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p style={{ fontSize: "0.9rem", opacity: 0.7, lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {p.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {active && (
        <div className="overlay" onClick={closeProject}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              width: "min(1100px, 96vw)",
              height: "88vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* ── Top bar ── */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 1.5rem",
              borderBottom: "1px solid var(--border)",
              flexShrink: 0,
            }}>
              <span style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)" }}>
                Project Details
              </span>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                {(active.video || active.videoUrl) && (
                  <button
                    className="btn btn-outline"
                    style={{ padding: "0.4rem 0.9rem", fontSize: "0.75rem" }}
                    onClick={() => setShowVideo((v) => !v)}
                  >
                    <Play size={12} /> {showVideo ? "Photos" : "Video"}
                  </button>
                )}
                <button
                  onClick={closeProject}
                  style={{ background: "none", border: "none", color: "var(--fg)", cursor: "pointer", opacity: 0.5, display: "flex", alignItems: "center" }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* ── Two-column body ── */}
            <div className="project-detail-body" style={{
              display: "grid",
              gridTemplateColumns: "1fr 380px",
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
            }}>

              {/* Left: media */}
              <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)", overflow: "hidden" }}>
                {/* Main image / video */}
                <div style={{ flex: 1, position: "relative", background: "var(--surface)", minHeight: 0, overflow: "hidden" }}>
                  {showVideo && (active.video || active.videoUrl) ? (
                    <VideoPlayer
                      url={active.video || active.videoUrl || ""}
                      width="100%"
                      height="100%"
                      controls
                      style={{ width: "100%", height: "100%" }}
                    />
                  ) : active.images.length > 0 ? (
                    <>
                      <img
                        src={active.images[imgIdx]}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                      {active.images.length > 1 && (
                        <>
                          <button
                            onClick={prev}
                            style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.55)", border: "none", color: "white", borderRadius: "50%", width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <ChevronLeft size={20} />
                          </button>
                          <button
                            onClick={next}
                            style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.55)", border: "none", color: "white", borderRadius: "50%", width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <ChevronRight size={20} />
                          </button>
                          {/* Image counter */}
                          <div style={{ position: "absolute", bottom: "0.75rem", right: "0.75rem", background: "rgba(0,0,0,0.6)", color: "white", fontSize: "0.75rem", padding: "0.2rem 0.6rem", borderRadius: "100px" }}>
                            {imgIdx + 1} / {active.images.length}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 300, opacity: 0.2, fontSize: "0.85rem", letterSpacing: "0.1em" }}>
                      No media
                    </div>
                  )}
                </div>

                {/* Thumbnail strip */}
                {!showVideo && active.images.length > 1 && (
                  <div style={{
                    display: "flex",
                    gap: "0.4rem",
                    padding: "0.6rem",
                    background: "rgba(0,0,0,0.4)",
                    overflowX: "auto",
                    flexShrink: 0,
                  }}>
                    {active.images.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIdx(i)}
                        style={{
                          width: 56,
                          height: 40,
                          flexShrink: 0,
                          border: `2px solid ${i === imgIdx ? "var(--accent)" : "transparent"}`,
                          borderRadius: 4,
                          overflow: "hidden",
                          cursor: "pointer",
                          padding: 0,
                          opacity: i === imgIdx ? 1 : 0.5,
                          transition: "opacity 0.2s, border-color 0.2s",
                        }}
                      >
                        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: details */}
              <div className="project-detail-sidebar" style={{ overflowY: "auto", padding: "2rem 1.75rem", display: "flex", flexDirection: "column", gap: "1.75rem" }}>

                {/* Title */}
                <div>
                  <h2 style={{ fontFamily: "var(--header-font)", fontSize: "1.6rem", lineHeight: 1.25, marginBottom: "0.35rem" }}>
                    {active.title}
                  </h2>
                  {active.name && (
                    <p style={{ fontSize: "0.95rem", opacity: 0.65, marginBottom: "0.5rem" }}>{active.name}</p>
                  )}
                  <div style={{ width: 36, height: 2, background: "var(--accent)" }} />
                </div>

                {/* Meta pills */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {active.category && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <Tag size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />
                      <span style={{ fontSize: "0.82rem", opacity: 0.85 }}>{active.category}</span>
                    </div>
                  )}
                  {active.year && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <Calendar size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />
                      <span style={{ fontSize: "0.82rem", opacity: 0.85 }}>{active.year}</span>
                    </div>
                  )}
                  {active.client && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <User size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />
                      <span style={{ fontSize: "0.82rem", opacity: 0.85 }}>{active.client}</span>
                    </div>
                  )}
                  {active.location && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <MapPin size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />
                      <span style={{ fontSize: "0.82rem", opacity: 0.85 }}>{active.location}</span>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div style={{ borderTop: "1px solid var(--border)" }} />

                {/* Description */}
                {descLines.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <p style={{ fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--accent)", opacity: 0.8 }}>
                      About
                    </p>
                    {descLines.map((line, i) => renderLine(line, i))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
