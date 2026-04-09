import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

interface Props {
  onFile?: (file: File) => void;
  onFiles?: (files: File[]) => void;
  accept?: Record<string, string[]>;
  label?: string;
  multiple?: boolean;
}

export default function Dropzone({ onFile, onFiles, accept, label = "Drop file here or click to browse", multiple = false }: Props) {
  const onDrop = useCallback((files: File[]) => {
    if (onFiles) { onFiles(files); return; }
    if (files[0]) onFile?.(files[0]);
  }, [onFile, onFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept, multiple });

  return (
    <div {...getRootProps()} className={`dropzone ${isDragActive ? "active" : ""}`}>
      <input {...getInputProps()} />
      <Upload size={28} style={{ margin: "0 auto 0.5rem" }} />
      <p>{isDragActive ? "Drop it!" : label}</p>
    </div>
  );
}
