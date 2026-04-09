import { useState, useRef, useEffect } from "react";
import { Play } from "lucide-react";

interface Props {
  url: string;
  width?: string;
  height?: string;
  controls?: boolean;
  autoPlay?: boolean;
  /** Show thumbnail+play-button overlay first, click to play */
  light?: boolean;
  muted?: boolean;
  style?: React.CSSProperties;
  /** Fade audio out over this many seconds before the video ends (local files only) */
  fadeEnd?: number;
}

function isExternal(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1`;
  // Vimeo
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1`;
  return null;
}

export default function VideoPlayer({ url, width = "100%", height = "100%", controls = true, autoPlay = false, light = false, muted = false, style, fadeEnd }: Props) {
  const [playing, setPlaying] = useState(!light && autoPlay);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !fadeEnd) return;

    const handleTimeUpdate = () => {
      if (!video.duration || video.duration === Infinity) return;
      if (video.duration <= fadeEnd) return; // video shorter than fade window — skip
      const remaining = video.duration - video.currentTime;
      if (remaining <= fadeEnd) {
        video.volume = Math.max(0, remaining / fadeEnd);
      } else {
        video.volume = 1;
      }
    };

    // Reset volume when a new video loads
    const handleLoadedMetadata = () => { video.volume = 1; };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [fadeEnd, url]);

  const embedUrl = isExternal(url) ? getEmbedUrl(url) : null;

  const containerStyle: React.CSSProperties = {
    width,
    height,
    position: "relative",
    background: "#000",
    overflow: "hidden",
    ...style,
  };

  // External embeddable (YouTube/Vimeo)
  if (embedUrl) {
    if (light && !playing) {
      return (
        <div style={{ ...containerStyle, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={(e) => { e.stopPropagation(); setPlaying(true); }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
          <div style={{ position: "relative", zIndex: 1, background: "var(--accent)", borderRadius: "50%", width: 60, height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Play size={24} fill="#111" color="#111" />
          </div>
        </div>
      );
    }
    return (
      <div style={containerStyle}>
        <iframe
          src={playing ? embedUrl : embedUrl.replace("?autoplay=1", "")}
          style={{
            border: "none",
            position: "absolute",
            top: "50%",
            left: "50%",
            minWidth: "100%",
            minHeight: "100%",
            aspectRatio: "16/9",
            transform: "translate(-50%, -50%)",
          }}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="video"
        />
      </div>
    );
  }

  // External non-embeddable or direct file — light overlay
  if (light && !playing) {
    return (
      <div style={{ ...containerStyle, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: "#111" }} onClick={(e) => { e.stopPropagation(); setPlaying(true); }}>
        <div style={{ background: "var(--accent)", borderRadius: "50%", width: 60, height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Play size={24} fill="#111" color="#111" />
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <video
        ref={videoRef}
        src={url}
        style={{ width: "100%", height: "100%", objectFit: "fill" }}
        controls={controls}
        autoPlay={playing || autoPlay}
        muted={muted}
        preload="auto"
        loop={false}
        playsInline
      />
    </div>
  );
}
