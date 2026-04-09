import { useConfig } from "../ConfigContext";

export default function GlobalBackground() {
  const { config } = useConfig();
  const img = config?.theme?.backgroundImage;
  const opacity = config?.theme?.backgroundImageOpacity ?? 0.15;

  if (!img) return null;

  return (
    <div
      className="global-bg"
      style={{
        backgroundImage: `url(${img})`,
        opacity,
      }}
    />
  );
}
