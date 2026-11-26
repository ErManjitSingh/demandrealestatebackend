import { useState } from "react";
import { uploadImage } from "../lib/firebase";

export function ImageField({ label, url, folder, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const uploaded = await uploadImage(file, folder);
      onChange(uploaded);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="image-field">
      <span className="label">{label}</span>
      {url ? <img src={url} alt="" /> : <div className="image-empty">No image yet</div>}
      <div className="row-actions">
        <label className="file-button">
          {busy ? "Uploading…" : url ? "Replace" : "Upload"}
          <input type="file" accept="image/*" onChange={onFile} disabled={busy} />
        </label>
        {url ? (
          <button type="button" className="text-button" onClick={() => onChange("")}>
            Remove
          </button>
        ) : null}
      </div>
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}
