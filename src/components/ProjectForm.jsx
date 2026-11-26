import { useEffect, useState } from "react";
import { createProject, getProject, updateProject } from "../lib/api";
import { emptyProject, emptyUnit, formToPayload, projectToForm, slugify } from "../lib/projectForm";
import { ImageField } from "./ImageField";

export function ProjectForm({ id, onCancel, onSaved }) {
  const [form, setForm] = useState(emptyProject);
  const [slugEdited, setSlugEdited] = useState(Boolean(id));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    getProject(id)
      .then((body) => {
        if (!active) return;
        setForm(projectToForm(body.data));
        setSlugEdited(true);
      })
      .catch((err) => {
        if (active) setError(err.message || "Could not load this project");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  function setField(key, value) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "name" && !slugEdited) next.slug = slugify(value);
      return next;
    });
  }

  function updateList(key, index, patch) {
    setForm((current) => ({
      ...current,
      [key]: current[key].map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    if (!form.name.trim() || !form.slug.trim()) {
      setError("Name and slug are required.");
      return;
    }
    let payload;
    try {
      payload = formToPayload(form);
    } catch (err) {
      setError(err.message);
      return;
    }
    setSaving(true);
    try {
      const body = id ? await updateProject(id, payload) : await createProject(payload);
      onSaved(body.data._id);
    } catch (err) {
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const folder = form.slug || "draft";

  if (loading) return <p className="muted">Loading project…</p>;

  return (
    <form onSubmit={onSubmit}>
      <div className="page-head">
        <div>
          <button type="button" className="text-button" onClick={onCancel}>
            All projects
          </button>
          <h1>{id ? "Edit project" : "New project"}</h1>
        </div>
        <button type="submit" className="primary" disabled={saving}>
          {saving ? "Saving…" : "Save project"}
        </button>
      </div>
      {error ? <p className="banner error">{error}</p> : null}

      <fieldset>
        <legend>Basics</legend>
        <label>
          Name
          <input value={form.name} onChange={(event) => setField("name", event.target.value)} required />
        </label>
        <label>
          Slug
          <input
            value={form.slug}
            onChange={(event) => {
              setSlugEdited(true);
              setField("slug", slugify(event.target.value));
            }}
            required
          />
        </label>
        <label>
          Location
          <input value={form.location} onChange={(event) => setField("location", event.target.value)} />
        </label>
        <label>
          Tagline
          <input value={form.tagline} onChange={(event) => setField("tagline", event.target.value)} />
        </label>
        <label>
          Status
          <input value={form.status} onChange={(event) => setField("status", event.target.value)} placeholder="Foundation complete" />
        </label>
        <label>
          Approval authority
          <input value={form.approvalAuthority} onChange={(event) => setField("approvalAuthority", event.target.value)} />
        </label>
        <label>
          Total units
          <input type="number" min="0" value={form.totalUnits} onChange={(event) => setField("totalUnits", event.target.value)} />
        </label>
        <label>
          BHK
          <input type="number" min="0" value={form.bhk} onChange={(event) => setField("bhk", event.target.value)} />
        </label>
        <label>
          Ready in months
          <input type="number" min="0" value={form.readyInMonths} onChange={(event) => setField("readyInMonths", event.target.value)} />
        </label>
      </fieldset>

      <fieldset>
        <legend>Story</legend>
        <label className="wide">
          Summary
          <textarea rows={3} value={form.summary} onChange={(event) => setField("summary", event.target.value)} />
        </label>
        <div className="wide">
          <span className="label">About paragraphs</span>
          {form.about.map((paragraph, index) => (
            <div key={index} className="stack-row">
              <textarea
                rows={3}
                value={paragraph}
                onChange={(event) => {
                  const about = form.about.map((line, lineIndex) => (lineIndex === index ? event.target.value : line));
                  setField("about", about);
                }}
              />
              <button
                type="button"
                className="text-button"
                onClick={() => setField("about", form.about.filter((_, lineIndex) => lineIndex !== index))}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setField("about", [...form.about, ""])}>
            Add paragraph
          </button>
        </div>
        <label className="wide">
          Ownership note
          <textarea rows={2} value={form.ownershipNote} onChange={(event) => setField("ownershipNote", event.target.value)} />
        </label>
      </fieldset>

      <fieldset>
        <legend>Unit plans</legend>
        {form.units.map((unit, index) => (
          <div key={index} className="repeat">
            <label>
              Code
              <input value={unit.code} onChange={(event) => updateList("units", index, { code: event.target.value })} />
            </label>
            <label>
              Name
              <input value={unit.name} onChange={(event) => updateList("units", index, { name: event.target.value })} />
            </label>
            <label>
              BHK
              <input type="number" value={unit.bhk} onChange={(event) => updateList("units", index, { bhk: event.target.value })} />
            </label>
            <label>
              Apartment sq.ft.
              <input type="number" value={unit.apartmentSqft} onChange={(event) => updateList("units", index, { apartmentSqft: event.target.value })} />
            </label>
            <label>
              Balcony sq.ft.
              <input type="number" value={unit.balconySqft} onChange={(event) => updateList("units", index, { balconySqft: event.target.value })} />
            </label>
            <label>
              Total sq.ft.
              <input type="number" value={unit.totalSqft} onChange={(event) => updateList("units", index, { totalSqft: event.target.value })} />
            </label>
            <label>
              Super sq.ft.
              <input type="number" value={unit.superSqft} onChange={(event) => updateList("units", index, { superSqft: event.target.value })} />
            </label>
            <label>
              Price
              <input type="number" value={unit.price} onChange={(event) => updateList("units", index, { price: event.target.value })} placeholder="Leave empty if none" />
            </label>
            <button type="button" className="text-button" onClick={() => setField("units", form.units.filter((_, unitIndex) => unitIndex !== index))}>
              Remove unit
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setField("units", [...form.units, emptyUnit()])}>
          Add unit
        </button>
      </fieldset>

      <fieldset>
        <legend>Photos</legend>
        <p className="hint wide">The first view is the homepage hero. Images go to Firebase. Only the URL is saved on the project.</p>
        <div className="gallery-edit wide">
          {form.media.map((item, index) => (
            <div key={`${item.url}-${index}`} className="repeat">
              <ImageField
                label={item.label || `Photo ${index + 1}`}
                url={item.url}
                folder={folder}
                onChange={(url) => updateList("media", index, { url })}
              />
              <label>
                Label
                <input value={item.label} onChange={(event) => updateList("media", index, { label: event.target.value })} />
              </label>
              <label>
                Kind
                <select value={item.kind} onChange={(event) => updateList("media", index, { kind: event.target.value })}>
                  <option value="view">view</option>
                  <option value="floor-plan">floor-plan</option>
                  <option value="approval">approval</option>
                </select>
              </label>
              <button type="button" className="text-button" onClick={() => setField("media", form.media.filter((_, mediaIndex) => mediaIndex !== index))}>
                Remove photo
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setField("media", [...form.media, { url: "", label: "", kind: "view" }])}>
          Add photo
        </button>
        <div className="split wide">
          <ImageField label="Floor plan" url={form.floorPlanUrl} folder={folder} onChange={(url) => setField("floorPlanUrl", url)} />
          <ImageField label="Approval drawing" url={form.approvalDrawingUrl} folder={folder} onChange={(url) => setField("approvalDrawingUrl", url)} />
        </div>
      </fieldset>

      <fieldset>
        <legend>Amenities</legend>
        {form.amenityGroups.map((group, index) => (
          <div key={index} className="repeat">
            <label>
              Title
              <input value={group.title} onChange={(event) => updateList("amenityGroups", index, { title: event.target.value })} />
            </label>
            <label className="wide">
              Text
              <textarea rows={2} value={group.text} onChange={(event) => updateList("amenityGroups", index, { text: event.target.value })} />
            </label>
            <button
              type="button"
              className="text-button"
              onClick={() => setField("amenityGroups", form.amenityGroups.filter((_, groupIndex) => groupIndex !== index))}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setField("amenityGroups", [...form.amenityGroups, { title: "", text: "" }])}>
          Add amenity
        </button>
      </fieldset>

      <fieldset>
        <legend>Nearby</legend>
        {form.nearby.map((place, index) => (
          <div key={index} className="repeat inline">
            <label>
              Place
              <input value={place.name} onChange={(event) => updateList("nearby", index, { name: event.target.value })} />
            </label>
            <label>
              Distance (km)
              <input type="number" step="0.1" value={place.distanceKm} onChange={(event) => updateList("nearby", index, { distanceKm: event.target.value })} />
            </label>
            <button type="button" className="text-button" onClick={() => setField("nearby", form.nearby.filter((_, placeIndex) => placeIndex !== index))}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setField("nearby", [...form.nearby, { name: "", distanceKm: "" }])}>
          Add place
        </button>
      </fieldset>
    </form>
  );
}
