import { useEffect, useRef } from "react";
import { useConfig } from "../ConfigContext";
import { ArrowDown } from "lucide-react";

export default function HeroSection() {
  const { config } = useConfig();
  const hero = config?.hero;
  const resume = config?.resume;
  const portfolio = config?.portfolio;

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hero?.backgroundVideo) return;

    // Force the HTML attributes iOS Safari actually checks (not just JSX props)
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    const tryPlay = () => { video.play().catch(() => {}); };

    // Retry on data ready and on any user gesture (iOS always allows play in gesture handler)
    video.addEventListener("loadeddata", tryPlay);
    const onGesture = () => tryPlay();
    window.addEventListener("touchstart", onGesture, { passive: true });
    document.addEventListener("visibilitychange", () => { if (!document.hidden) tryPlay(); });

    tryPlay();

    return () => {
      video.removeEventListener("loadeddata", tryPlay);
      window.removeEventListener("touchstart", onGesture);
    };
  }, [hero?.backgroundVideo]);

  return (
    <section
      id="hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        overflow: "hidden",
        padding: "2rem",
      }}
    >
      {/* Background image — fallback when no video */}
      {hero?.backgroundImage && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${hero.backgroundImage})`,
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
            opacity: hero.backgroundImageOpacity ?? 0.2,
            zIndex: 0,
          }}
        />
      )}

      {/* Background video — visible always so first frame shows even if autoplay blocked.
          The sibling div sits on top to block iOS from rendering its native play overlay. */}
      {hero?.showVideo && hero?.backgroundVideo && (
        <>
          <video
            ref={videoRef}
            className="hero-bg-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "fill",
              opacity: hero.backgroundVideoOpacity ?? 0.25,
              pointerEvents: "none",
              zIndex: 0,
            }}
            src={hero.backgroundVideo}
          />
          {/* Transparent overlay — prevents iOS tap-to-show-controls behavior */}
          <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }} />
        </>
      )}

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, transparent 40%, var(--bg) 100%)",
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: 800 }}>
        <p className="section-label fade-up">Architectural Portfolio</p>

        <h1
          className="fade-up fade-up-delay-1"
          style={{ fontSize: "clamp(3rem, 8vw, 6rem)", lineHeight: 1.05, marginBottom: "1rem" }}
        >
          <span style={{ display: "block" }}>
            {hero?.title?.split(" ")[0] ?? "Tella"}
          </span>
          <span style={{ display: "block" }}>
            {hero?.title?.split(" ").slice(1).join(" ") ?? "Irani Shemirani"}
          </span>
        </h1>

        {/* Gold divider */}
        <div
          className="fade-up fade-up-delay-2"
          style={{
            width: 80,
            height: 2,
            background: "var(--accent)",
            margin: "1.5rem auto",
          }}
        />

        <p
          className="fade-up fade-up-delay-2"
          style={{ fontSize: "1.1rem", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "0.75rem", opacity: 0.7 }}
        >
          {hero?.subtitle ?? "Architect"}
        </p>

        <p
          className="fade-up fade-up-delay-3"
          style={{ fontSize: "1.2rem", opacity: 0.6, maxWidth: 500, margin: "0 auto 2.5rem" }}
        >
          {hero?.tagline}
        </p>

        <div
          className="fade-up fade-up-delay-3"
          style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}
        >
          <a href="#portfolio" className="btn btn-accent">
            {hero?.ctaPortfolio ?? "View Portfolio"}
          </a>
          {resume?.file && (
            <a href={resume.file} target="_blank" rel="noreferrer" className="btn btn-outline">
              {hero?.ctaResume ?? "Download Resume"}
            </a>
          )}
          {portfolio?.file && (
            <a href={portfolio.file} target="_blank" rel="noreferrer" download className="btn btn-outline">
              Download Portfolio
            </a>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#about"
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: 0.4,
          zIndex: 2,
          animation: "fadeUp 1s ease 1s both",
        }}
      >
        <ArrowDown size={24} />
      </a>
    </section>
  );
}
