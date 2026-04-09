import { useState, useEffect } from "react";
import { api } from "../../api";
import { useConfig } from "../../ConfigContext";
import Dropzone from "../../components/Dropzone";
import toast from "react-hot-toast";
import { Trash2, Plus, Link, Film, Image, Music, MonitorPlay, Pencil, Check, X } from "lucide-react";

function fmtBytes(b: number) {
  if (b >= 1024 * 1024 * 1024) return `${(b / (1024 ** 3)).toFixed(1)} GB`;
  if (b >= 1024 * 1024) return `${(b / (1024 ** 2)).toFixed(1)} MB`;
  if (b >= 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${b} B`;
}

export default function ShowcaseTab() {
  const { config, refresh } = useConfig();
  const showcase = config?.showcase;

  const [title, setTitle] = useState(showcase?.title ?? "Showcase");
  const [subtitle, setSubtitle] = useState(showcase?.subtitle ?? "");
  const [videoOpacity, setVideoOpacity] = useState(showcase?.videoOpacity ?? 1);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (showcase && !synced) {
      setTitle(showcase.title ?? "Showcase");
      setSubtitle(showcase.subtitle ?? "");
      setVideoOpacity(showcase.videoOpacity ?? 1);
      setSynced(true);
    }
  }, [showcase, synced]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlForm, setUrlForm] = useState({ url: "", title: "", description: "" });
  const [showUrlForm, setShowUrlForm] = useState(false);

  // Slideshow from images
  const [slideshowImages, setSlideshowImages] = useState<{ filename: string; url: string }[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [slideshowUrl, setSlideshowUrl] = useState<string | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [duration, setDuration] = useState(8);
  const [musicTracks, setMusicTracks] = useState<{ filename: string; url: string }[]>([]);
  const [selectedMusic, setSelectedMusic] = useState("");
  const [uploadingMusic, setUploadingMusic] = useState(false);
  const [videoSizes, setVideoSizes] = useState<Record<string, number | null>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "" });

  const loadSlideshowData = async () => {
    try {
      const [imgRes, musicRes] = await Promise.all([
        api.get("/api/admin/showcase/images"),
        api.get("/api/admin/showcase/music"),
      ]);
      setSlideshowImages(imgRes.data.images);
      setSlideshowUrl(imgRes.data.slideshow_url);
      if (imgRes.data.slideshow_url) setPreviewUrl(imgRes.data.slideshow_url);
      setMusicTracks(musicRes.data);
      setSelectedImages(new Set(imgRes.data.images.map((i: { filename: string }) => i.filename)));
      if (musicRes.data.length > 0) setSelectedMusic(musicRes.data[0].filename);
      else setSelectedMusic("");
    } catch { /* ignore */ }
  };

  useEffect(() => { loadSlideshowData(); }, []);

  useEffect(() => {
    if (!showcase?.videos?.length) return;
    api.get("/api/admin/showcase/videos/sizes").then(r => setVideoSizes(r.data)).catch(() => {});
  }, [showcase?.videos?.length]);

  const saveMeta = async () => {
    setSaving(true);
    try {
      await api.post("/api/admin/showcase", { title, subtitle, videoOpacity });
      await refresh();
      toast.success("Showcase settings saved!");
    } catch { toast.error("Save failed."); }
    setSaving(false);
  };

  const uploadVideo = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", file.name.replace(/\.[^.]+$/, ""));
    try {
      await api.post("/api/admin/showcase/videos", fd);
      await refresh();
      toast.success("Video uploaded!");
    } catch { toast.error("Upload failed."); }
    setUploading(false);
  };

  const addUrl = async () => {
    if (!urlForm.url) return;
    try {
      await api.post("/api/admin/showcase/videos/url", urlForm);
      await refresh();
      toast.success("Video link added!");
      setUrlForm({ url: "", title: "", description: "" });
      setShowUrlForm(false);
    } catch { toast.error("Failed to add link."); }
  };

  const featureVideo = async (id: string) => {
    try {
      await api.post(`/api/admin/showcase/videos/${id}/feature`);
      await refresh();
      toast.success("Set as featured!");
    } catch { toast.error("Failed to set as featured."); }
  };

  const deleteVideo = async (id: string) => {
    if (!confirm("Remove this video?")) return;
    await api.delete(`/api/admin/showcase/videos/${id}`);
    await refresh();
    toast.success("Video removed.");
  };

  const uploadSlideshowImages = async (files: File[]) => {
    setUploadingImg(true);
    let failed = 0;
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      try { await api.post("/api/admin/showcase/images", fd); }
      catch { failed++; }
    }
    await loadSlideshowData();
    if (failed) toast.error(`${failed} file(s) failed to upload.`);
    else toast.success(`${files.length} image(s) added!`);
    setUploadingImg(false);
  };

  const deleteSlideshowImage = async (filename: string) => {
    await api.delete(`/api/admin/showcase/images/${filename}`);
    await loadSlideshowData();
    toast.success("Image removed.");
  };

  const uploadMusicTrack = async (file: File) => {
    setUploadingMusic(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await api.post("/api/admin/showcase/music", fd);
      setSelectedMusic(res.data.filename);
      await loadSlideshowData();
      toast.success("Music uploaded!");
    } catch { toast.error("Upload failed."); }
    setUploadingMusic(false);
  };

  const deleteMusicTrack = async (filename: string) => {
    await api.delete(`/api/admin/showcase/music/${filename}`);
    if (selectedMusic === filename) setSelectedMusic("");
    await loadSlideshowData();
    toast.success("Track removed.");
  };

  const generateSlideshow = async () => {
    setGenerating(true);
    try {
      const params = new URLSearchParams({ duration: String(duration) });
      if (selectedMusic) params.set("music", selectedMusic);
      selectedImages.forEach((f) => params.append("files", f));
      const res = await api.post(`/api/admin/showcase/images/generate?${params}`);
      setSlideshowUrl(res.data.slideshow_url);
      setPreviewUrl(res.data.slideshow_url);
      toast.success("Slideshow video generated!");
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg || "Generation failed.");
    }
    setGenerating(false);
  };

  const useAsHeroBg = async () => {
    if (!slideshowUrl) return;
    const cleanUrl = slideshowUrl.split("?")[0];
    try {
      await api.post("/api/admin/hero", { backgroundVideo: cleanUrl, showVideo: true });
      await refresh();
      toast.success("Set as Hero background!");
    } catch { toast.error("Failed to set background."); }
  };

  const addSlideshowToShowcase = async () => {
    if (!slideshowUrl) return;
    try {
      await api.post("/api/admin/showcase/videos/url", {
        url: slideshowUrl,
        title: "Slideshow",
        description: "",
      });
      await refresh();
      toast.success("Slideshow added to showcase!");
    } catch { toast.error("Failed to add."); }
  };

  const showcaseVideos = showcase?.videos ?? [];

  return (
    <div>
      <h2 style={{ fontFamily: "var(--header-font)", fontSize: "1.5rem", marginBottom: "0.25rem" }}>Showcase</h2>
      <p style={{ opacity: 0.5, fontSize: "0.9rem", marginBottom: "2rem" }}>Feature video presentations of your work</p>

      {/* Meta */}
      <div className="field">
        <label>Section Title</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="field">
        <label>Section Subtitle</label>
        <textarea className="textarea" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} style={{ minHeight: 80 }} />
      </div>
      <div className="field">
        <label style={{ fontSize: "0.8rem", opacity: 0.6, display: "flex", justifyContent: "space-between" }}>
          <span>Video Opacity</span>
          <span>{Math.round(videoOpacity * 100)}%</span>
        </label>
        <input
          type="range" min={0.02} max={1} step={0.01}
          value={videoOpacity}
          onChange={(e) => setVideoOpacity(parseFloat(e.target.value))}
          style={{ width: "100%", accentColor: "var(--accent)" }}
        />
      </div>
      <button className="btn btn-outline" onClick={saveMeta} disabled={saving} style={{ marginBottom: "2rem" }}>
        {saving ? "Saving..." : "Save Section Info"}
      </button>

      <div className="separator" />

      {/* Upload / Link controls */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem" }}>
        <button className="btn btn-accent" onClick={() => setShowUrlForm(!showUrlForm)}>
          <Link size={16} /> Add Video URL
        </button>
        <span style={{ opacity: 0.4, alignSelf: "center", fontSize: "0.85rem" }}>or upload a file below</span>
      </div>

      {showUrlForm && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--accent)", borderRadius: "var(--radius-lg)", padding: "1.25rem", marginBottom: "1.25rem" }}>
          <div className="field">
            <label>Video URL (YouTube, Vimeo, or direct link)</label>
            <input className="input" value={urlForm.url} onChange={(e) => setUrlForm((p) => ({ ...p, url: e.target.value }))} placeholder="https://youtube.com/watch?v=..." />
          </div>
          <div className="field">
            <label>Title</label>
            <input className="input" value={urlForm.title} onChange={(e) => setUrlForm((p) => ({ ...p, title: e.target.value }))} placeholder="Video title" />
          </div>
          <div className="field">
            <label>Description (optional)</label>
            <textarea className="textarea" value={urlForm.description} onChange={(e) => setUrlForm((p) => ({ ...p, description: e.target.value }))} style={{ minHeight: 70 }} />
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button className="btn btn-accent" onClick={addUrl}><Plus size={14} /> Add</button>
            <button className="btn btn-outline" onClick={() => setShowUrlForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="field">
        <label>Upload Video File</label>
        <Dropzone
          onFile={uploadVideo}
          accept={{ "video/*": [".mp4", ".webm", ".mov"] }}
          label={uploading ? "Uploading..." : "Drop video file here (MP4, WebM, MOV)"}
        />
      </div>

      <div className="separator" />

      {/* Slideshow from images */}
      <p style={{ fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Film size={14} /> Slideshow from Images
      </p>

      <div className="field">
        <label>Upload Images (ordered by filename)</label>
        <Dropzone
          onFiles={uploadSlideshowImages}
          multiple
          accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp"] }}
          label={uploadingImg ? "Uploading..." : "Drop images here or click to select all (JPG, PNG, WEBP)"}
        />
      </div>

      {slideshowImages.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.4rem 1rem" }}>
            <input
              type="checkbox"
              checked={selectedImages.size === slideshowImages.length}
              onChange={() => {
                if (selectedImages.size === slideshowImages.length)
                  setSelectedImages(new Set());
                else
                  setSelectedImages(new Set(slideshowImages.map((i) => i.filename)));
              }}
            />
            <span style={{ fontSize: "0.78rem", opacity: 0.5 }}>
              Select all ({selectedImages.size}/{slideshowImages.length} selected)
            </span>
          </div>
          {slideshowImages.map((img) => {
            const checked = selectedImages.has(img.filename);
            return (
              <div key={img.filename} onClick={() => {
                const next = new Set(selectedImages);
                checked ? next.delete(img.filename) : next.add(img.filename);
                setSelectedImages(next);
              }} style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: checked ? "rgba(201,168,76,0.07)" : "var(--surface)", border: `1px solid ${checked ? "var(--accent)" : "var(--border)"}`, borderRadius: "var(--radius)", padding: "0.6rem 1rem", cursor: "pointer" }}>
                <input type="checkbox" checked={checked} onChange={() => {}} onClick={(e) => e.stopPropagation()} />
                <Image size={14} style={{ opacity: 0.5, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.filename}</span>
                <button className="btn btn-danger" onClick={(e) => { e.stopPropagation(); deleteSlideshowImage(img.filename); }} style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}>
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Music */}
      <p style={{ fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", margin: "1.25rem 0 0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Music size={14} /> Background Music
      </p>
      <div className="field">
        <label>Upload Music Track (MP3, WAV, M4A)</label>
        <Dropzone
          onFile={uploadMusicTrack}
          accept={{ "audio/mpeg": [".mp3"], "audio/wav": [".wav"], "audio/mp4": [".m4a"], "audio/ogg": [".ogg"], "audio/flac": [".flac"] }}
          label={uploadingMusic ? "Uploading..." : "Drop audio file here"}
        />
      </div>
      {musicTracks.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
          {musicTracks.map((t) => (
            <div key={t.filename} style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: selectedMusic === t.filename ? "rgba(201,168,76,0.1)" : "var(--surface)", border: `1px solid ${selectedMusic === t.filename ? "var(--accent)" : "var(--border)"}`, borderRadius: "var(--radius)", padding: "0.6rem 1rem", cursor: "pointer" }} onClick={() => setSelectedMusic(selectedMusic === t.filename ? "" : t.filename)}>
              <Music size={14} style={{ color: selectedMusic === t.filename ? "var(--accent)" : undefined, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.filename}</span>
              {selectedMusic === t.filename && <span style={{ fontSize: "0.7rem", color: "var(--accent)" }}>selected</span>}
              <button className="btn btn-danger" onClick={(e) => { e.stopPropagation(); deleteMusicTrack(t.filename); }} style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
        <div className="field" style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label style={{ margin: 0, whiteSpace: "nowrap" }}>Seconds per image</label>
          <input
            className="input"
            type="number"
            min={1}
            max={10}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            style={{ width: 70 }}
          />
        </div>
        <button
          className="btn btn-accent"
          onClick={generateSlideshow}
          disabled={generating || slideshowImages.length === 0}
        >
          <Film size={16} />
          {generating ? "Generating..." : "Generate Slideshow"}
        </button>
      </div>

      {previewUrl && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--accent)", borderRadius: "var(--radius-lg)", padding: "1.25rem", marginBottom: "1.5rem" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--accent)", marginBottom: "0.75rem" }}>
            {previewUrl === slideshowUrl ? "Slideshow ready" : "Preview"}
          </p>
          <video key={previewUrl} src={previewUrl} controls style={{ width: "100%", borderRadius: "var(--radius)", marginBottom: "0.75rem" }} />
          {slideshowUrl && previewUrl === slideshowUrl && (
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button className="btn btn-outline" onClick={addSlideshowToShowcase}>
                <Plus size={14} /> Add to Showcase
              </button>
              <button className="btn btn-outline" onClick={useAsHeroBg}>
                <MonitorPlay size={14} /> Use as Hero Background
              </button>
            </div>
          )}
        </div>
      )}

      <div className="separator" />

      {/* Video list */}
      <p style={{ fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", marginBottom: "1rem" }}>
        Showcase Videos ({showcase?.videos?.length ?? 0})
      </p>

      {showcaseVideos.length === 0 ? (
        <p style={{ opacity: 0.35, fontSize: "0.9rem" }}>No showcase videos yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {showcaseVideos.map((v) => {
            const isEditing = editingId === v.id;
            return (
              <div
                key={v.id}
                style={{ background: "var(--surface)", border: `1px solid ${isEditing ? "var(--accent)" : "var(--border)"}`, borderRadius: "var(--radius-lg)", padding: "1rem" }}
              >
                {isEditing ? (
                  <div onClick={(e) => e.stopPropagation()}>
                    <div className="field" style={{ marginBottom: "0.5rem" }}>
                      <label style={{ fontSize: "0.78rem" }}>Title</label>
                      <input
                        className="input"
                        value={editForm.title}
                        onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                        autoFocus
                      />
                    </div>
                    <div className="field" style={{ marginBottom: "0.75rem" }}>
                      <label style={{ fontSize: "0.78rem" }}>Description (overlay text)</label>
                      <textarea
                        className="textarea"
                        value={editForm.description}
                        onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                        style={{ minHeight: 60 }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button className="btn btn-accent" style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }} onClick={async () => {
                        try {
                          await api.patch(`/api/admin/showcase/videos/${v.id}`, editForm);
                          await refresh();
                          toast.success("Saved!");
                        } catch { toast.error("Save failed."); }
                        setEditingId(null);
                      }}>
                        <Check size={13} /> Save
                      </button>
                      <button className="btn btn-outline" style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }} onClick={() => setEditingId(null)}>
                        <X size={13} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center", cursor: "pointer" }} onClick={() => { setPreviewUrl(v.url); featureVideo(v.id); }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.title || "Untitled"}</p>
                      <p style={{ fontSize: "0.75rem", opacity: 0.45, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {v.url}{videoSizes[v.id] != null ? ` · ${fmtBytes(videoSizes[v.id]!)}` : ""}
                      </p>
                      {v.description && <p style={{ fontSize: "0.75rem", opacity: 0.55, marginTop: "0.2rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.description}</p>}
                    </div>
                    <button className="btn btn-outline" onClick={(e) => { e.stopPropagation(); setEditForm({ title: v.title ?? "", description: v.description ?? "" }); setEditingId(v.id); }} style={{ padding: "0.4rem 0.6rem", fontSize: "0.8rem" }}>
                      <Pencil size={13} />
                    </button>
                    <button className="btn btn-danger" onClick={(e) => { e.stopPropagation(); deleteVideo(v.id); }} style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
