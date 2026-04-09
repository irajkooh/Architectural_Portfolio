import { useState, useEffect } from "react";
import { api } from "../../api";
import { useConfig } from "../../ConfigContext";
import Dropzone from "../../components/Dropzone";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

export default function HeroTab() {
  const { config, refresh } = useConfig();
  const hero = config?.hero;

  const [form, setForm] = useState({
    title: hero?.title ?? "",
    subtitle: hero?.subtitle ?? "",
    tagline: hero?.tagline ?? "",
    ctaPortfolio: hero?.ctaPortfolio ?? "View Portfolio",
    ctaResume: hero?.ctaResume ?? "Download Resume",
    showVideo: hero?.showVideo ?? false,
    backgroundImageOpacity: hero?.backgroundImageOpacity ?? 0.2,
    backgroundVideoOpacity: hero?.backgroundVideoOpacity ?? 0.25,
  });
  const [synced, setSynced] = useState(false);
  useEffect(() => {
    if (hero && !synced) {
      setForm({
        title: hero.title ?? "",
        subtitle: hero.subtitle ?? "",
        tagline: hero.tagline ?? "",
        ctaPortfolio: hero.ctaPortfolio ?? "View Portfolio",
        ctaResume: hero.ctaResume ?? "Download Resume",
        showVideo: hero.showVideo ?? false,
        backgroundImageOpacity: hero.backgroundImageOpacity ?? 0.2,
        backgroundVideoOpacity: hero.backgroundVideoOpacity ?? 0.25,
      });
      setSynced(true);
    }
  }, [hero, synced]);

  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.post("/api/admin/hero", form);
      await refresh();
      toast.success("Hero section saved!");
    } catch { toast.error("Save failed."); }
    setSaving(false);
  };

  const uploadVideo = async (file: File) => {
    setUploadingVideo(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post("/api/admin/hero/video", fd);
      await refresh();
      toast.success("Hero video uploaded!");
    } catch { toast.error("Upload failed."); }
    setUploadingVideo(false);
  };

  const removeVideo = async () => {
    await api.delete("/api/admin/hero/video");
    await refresh();
    toast.success("Video removed.");
  };

  const uploadImage = async (file: File) => {
    setUploadingImage(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post("/api/admin/hero/image", fd);
      await refresh();
      toast.success("Hero image uploaded!");
    } catch { toast.error("Upload failed."); }
    setUploadingImage(false);
  };

  const removeImage = async () => {
    await api.delete("/api/admin/hero/image");
    await refresh();
    toast.success("Image removed.");
  };

  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div>
      <h2 style={{ fontFamily: "var(--header-font)", fontSize: "1.5rem", marginBottom: "0.25rem" }}>Hero Section</h2>
      <p style={{ opacity: 0.5, fontSize: "0.9rem", marginBottom: "2rem" }}>Landing page content and background</p>

      <div className="field">
        <label>Name / Title</label>
        <input className="input" value={form.title} onChange={f("title")} placeholder="Tella Irani Shemirani" />
      </div>
      <div className="field">
        <label>Subtitle</label>
        <input className="input" value={form.subtitle} onChange={f("subtitle")} placeholder="Architect" />
      </div>
      <div className="field">
        <label>Tagline</label>
        <textarea className="textarea" value={form.tagline} onChange={f("tagline")} style={{ minHeight: 80 }} placeholder="Designing spaces that inspire..." />
      </div>
      <div className="grid-2">
        <div className="field">
          <label>Portfolio CTA Label</label>
          <input className="input" value={form.ctaPortfolio} onChange={f("ctaPortfolio")} />
        </div>
        <div className="field">
          <label>Resume CTA Label</label>
          <input className="input" value={form.ctaResume} onChange={f("ctaResume")} />
        </div>
      </div>

      <div className="separator" />

      {/* Hero background image */}
      <div className="field">
        <label>Background Image (optional)</label>
        {hero?.backgroundImage ? (
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1rem", marginBottom: "1rem" }}>
            <img
              src={hero.backgroundImage}
              alt="hero bg"
              style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: "var(--radius)", opacity: form.backgroundImageOpacity }}
            />
            <button
              className="btn btn-danger"
              onClick={removeImage}
              style={{ marginTop: "0.75rem", padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
            >
              <Trash2 size={14} /> Remove
            </button>
          </div>
        ) : (
          <Dropzone
            onFile={uploadImage}
            accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp"] }}
            label={uploadingImage ? "Uploading..." : "Drop image here (JPG, PNG, WebP) — shown as hero background when no video is active"}
          />
        )}
        <div style={{ marginTop: "1rem" }}>
          <label style={{ fontSize: "0.8rem", opacity: 0.6, display: "flex", justifyContent: "space-between" }}>
            <span>Image Opacity</span>
            <span>{Math.round(form.backgroundImageOpacity * 100)}%</span>
          </label>
          <input
            type="range" min={0.02} max={1} step={0.01}
            value={form.backgroundImageOpacity}
            onChange={(e) => setForm((p) => ({ ...p, backgroundImageOpacity: parseFloat(e.target.value) }))}
            style={{ width: "100%", accentColor: "var(--accent)" }}
          />
        </div>
      </div>

      <div className="separator" />

      {/* Hero video */}
      <div className="field">
        <label>Background Video (optional)</label>
        {hero?.backgroundVideo ? (
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "1rem", marginBottom: "1rem" }}>
            <video
              src={hero.backgroundVideo}
              style={{ width: "100%", borderRadius: "var(--radius)", maxHeight: 160, objectFit: "cover" }}
              muted
              loop
              playsInline
              autoPlay
            />
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.showVideo}
                  onChange={(e) => setForm((p) => ({ ...p, showVideo: e.target.checked }))}
                  style={{ accentColor: "var(--accent)" }}
                />
                Show video as hero background
              </label>
              <button className="btn btn-danger" onClick={removeVideo} style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}>
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>
        ) : (
          <Dropzone
            onFile={uploadVideo}
            accept={{ "video/*": [".mp4", ".webm", ".mov"] }}
            label={uploadingVideo ? "Uploading..." : "Drop video here (MP4, WebM, MOV) — plays as hero background"}
          />
        )}
        <div style={{ marginTop: "1rem" }}>
          <label style={{ fontSize: "0.8rem", opacity: 0.6, display: "flex", justifyContent: "space-between" }}>
            <span>Video Opacity</span>
            <span>{Math.round(form.backgroundVideoOpacity * 100)}%</span>
          </label>
          <input
            type="range" min={0.02} max={1} step={0.01}
            value={form.backgroundVideoOpacity}
            onChange={(e) => setForm((p) => ({ ...p, backgroundVideoOpacity: parseFloat(e.target.value) }))}
            style={{ width: "100%", accentColor: "var(--accent)" }}
          />
        </div>
      </div>

      <button className="btn btn-accent" onClick={save} disabled={saving}>
        {saving ? "Saving..." : "Save Hero"}
      </button>
    </div>
  );
}
