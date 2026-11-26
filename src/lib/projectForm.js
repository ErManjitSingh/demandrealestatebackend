export function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function emptyUnit() {
  return {
    code: "",
    name: "",
    bhk: "",
    apartmentSqft: "",
    balconySqft: "",
    totalSqft: "",
    superSqft: "",
    price: "",
  };
}

export function emptyProject() {
  return {
    name: "",
    slug: "",
    location: "",
    tagline: "",
    summary: "",
    about: [""],
    status: "",
    readyInMonths: "",
    approvalAuthority: "",
    totalUnits: "",
    bhk: "",
    ownershipNote: "",
    floorPlanUrl: "",
    approvalDrawingUrl: "",
    units: [emptyUnit()],
    media: [],
    amenityGroups: [{ title: "", text: "" }],
    nearby: [{ name: "", distanceKm: "" }],
  };
}

function num(value, fallback = 0) {
  if (value === "" || value == null) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function numOrNull(value) {
  if (value === "" || value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function projectToForm(project) {
  return {
    name: project.name || "",
    slug: project.slug || "",
    location: project.location || "",
    tagline: project.tagline || "",
    summary: project.summary || "",
    about: project.about?.length ? [...project.about] : [""],
    status: project.status || "",
    readyInMonths: project.readyInMonths ?? "",
    approvalAuthority: project.approvalAuthority || "",
    totalUnits: project.totalUnits ?? "",
    bhk: project.bhk ?? "",
    ownershipNote: project.ownershipNote || "",
    floorPlanUrl: project.floorPlanUrl || "",
    approvalDrawingUrl: project.approvalDrawingUrl || "",
    units: project.units?.length
      ? project.units.map((unit) => ({
          code: unit.code || "",
          name: unit.name || "",
          bhk: unit.bhk ?? "",
          apartmentSqft: unit.apartmentSqft ?? "",
          balconySqft: unit.balconySqft ?? "",
          totalSqft: unit.totalSqft ?? "",
          superSqft: unit.superSqft ?? "",
          price: unit.price ?? "",
        }))
      : [emptyUnit()],
    media: (project.media || []).map((item) => ({
      url: item.url || "",
      label: item.label || "",
      kind: item.kind || "view",
    })),
    amenityGroups: project.amenityGroups?.length
      ? project.amenityGroups.map((group) => ({ title: group.title || "", text: group.text || "" }))
      : [{ title: "", text: "" }],
    nearby: project.nearby?.length
      ? project.nearby.map((place) => ({ name: place.name || "", distanceKm: place.distanceKm ?? "" }))
      : [{ name: "", distanceKm: "" }],
  };
}

export function formToPayload(form) {
  const units = form.units
    .map((unit) => ({
      code: unit.code.trim(),
      name: unit.name.trim(),
      bhk: numOrNull(unit.bhk),
      apartmentSqft: num(unit.apartmentSqft),
      balconySqft: num(unit.balconySqft),
      totalSqft: num(unit.totalSqft),
      superSqft: num(unit.superSqft),
      price: numOrNull(unit.price),
    }))
    .filter((unit) => unit.code || unit.name);

  if (units.some((unit) => !unit.code || !unit.name)) {
    throw new Error("Each unit needs a code and a name.");
  }

  const nearby = form.nearby
    .map((place) => ({ name: place.name.trim(), distanceKm: place.distanceKm }))
    .filter((place) => place.name || place.distanceKm !== "");

  if (nearby.some((place) => !place.name || place.distanceKm === "")) {
    throw new Error("Each nearby place needs a name and a distance in km.");
  }

  return {
    name: form.name.trim(),
    slug: form.slug.trim(),
    location: form.location.trim(),
    tagline: form.tagline.trim(),
    summary: form.summary.trim(),
    about: form.about.map((line) => line.trim()).filter(Boolean),
    status: form.status.trim(),
    readyInMonths: numOrNull(form.readyInMonths),
    approvalAuthority: form.approvalAuthority.trim(),
    totalUnits: num(form.totalUnits),
    bhk: numOrNull(form.bhk),
    ownershipNote: form.ownershipNote.trim(),
    floorPlanUrl: form.floorPlanUrl.trim(),
    approvalDrawingUrl: form.approvalDrawingUrl.trim(),
    units,
    media: form.media
      .filter((item) => item.url)
      .map((item) => ({
        url: item.url,
        label: item.label.trim(),
        kind: item.kind || "view",
      })),
    amenityGroups: form.amenityGroups
      .map((group) => ({ title: group.title.trim(), text: group.text.trim() }))
      .filter((group) => group.title),
    nearby: nearby.map((place) => ({
      name: place.name,
      distanceKm: num(place.distanceKm),
    })),
  };
}
