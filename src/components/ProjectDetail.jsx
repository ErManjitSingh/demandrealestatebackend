import { useEffect, useState } from "react";
import { deleteProject, getProject } from "../lib/api";

export function ProjectDetail({ id, onBack, onEdit, onDeleted }) {
  const [project, setProject] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getProject(id)
      .then((body) => {
        if (active) setProject(body.data);
      })
      .catch((err) => {
        if (active) setError(err.message || "Could not load this project");
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function remove() {
    if (!project) return;
    const ok = window.confirm(`Delete ${project.name}?`);
    if (!ok) return;
    try {
      await deleteProject(project._id);
      onDeleted();
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  }

  if (error && !project) {
    return (
      <section>
        <button type="button" className="text-button" onClick={onBack}>
          Back
        </button>
        <p className="banner error">{error}</p>
      </section>
    );
  }

  if (!project) return <p className="muted">Loading project…</p>;

  const views = (project.media || []).filter((item) => item.url);

  return (
    <section>
      <div className="page-head">
        <div>
          <button type="button" className="text-button" onClick={onBack}>
            All projects
          </button>
          <h1>{project.name}</h1>
          <p className="muted">{project.location}</p>
        </div>
        <div className="row-actions">
          <button type="button" onClick={() => onEdit(project._id)}>
            Edit
          </button>
          <button type="button" className="danger" onClick={remove}>
            Delete
          </button>
        </div>
      </div>
      {error ? <p className="banner error">{error}</p> : null}

      <dl className="facts">
        <div>
          <dt>Slug</dt>
          <dd>{project.slug}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{project.status || "—"}</dd>
        </div>
        <div>
          <dt>Homes</dt>
          <dd>{project.totalUnits ?? "—"}</dd>
        </div>
        <div>
          <dt>BHK</dt>
          <dd>{project.bhk ?? "—"}</dd>
        </div>
        <div>
          <dt>Ready in</dt>
          <dd>{project.readyInMonths != null ? `${project.readyInMonths} months` : "—"}</dd>
        </div>
        <div>
          <dt>Approval</dt>
          <dd>{project.approvalAuthority || "—"}</dd>
        </div>
      </dl>

      {project.tagline ? <p className="lead">{project.tagline}</p> : null}
      {project.summary ? <p>{project.summary}</p> : null}
      {(project.about || []).map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}

      <h2>Plans</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Unit</th>
              <th>Apartment</th>
              <th>Balcony</th>
              <th>Total</th>
              <th>Super</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {(project.units || []).map((unit) => (
              <tr key={`${unit.code}-${unit.name}`}>
                <td>
                  {unit.code} · {unit.name}
                </td>
                <td>{unit.apartmentSqft}</td>
                <td>{unit.balconySqft}</td>
                <td>{unit.totalSqft}</td>
                <td>{unit.superSqft}</td>
                <td>{unit.price == null ? "—" : unit.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Photos</h2>
      <div className="gallery">
        {views.map((item) => (
          <figure key={item.url}>
            <img src={item.url} alt={item.label || ""} />
            <figcaption>
              {item.label || "View"} · {item.kind}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="split">
        <div>
          <h2>Floor plan</h2>
          {project.floorPlanUrl ? <img className="sheet" src={project.floorPlanUrl} alt="Floor plan" /> : <p className="muted">None</p>}
        </div>
        <div>
          <h2>Approval drawing</h2>
          {project.approvalDrawingUrl ? (
            <img className="sheet" src={project.approvalDrawingUrl} alt="Approval drawing" />
          ) : (
            <p className="muted">None</p>
          )}
        </div>
      </div>

      <h2>Amenities</h2>
      {(project.amenityGroups || []).map((group) => (
        <article key={group.title} className="note">
          <h3>{group.title}</h3>
          <p>{group.text}</p>
        </article>
      ))}

      <h2>Nearby</h2>
      <ul className="nearby">
        {(project.nearby || []).map((place) => (
          <li key={place.name}>
            {place.name} — {place.distanceKm} km
          </li>
        ))}
      </ul>

      {project.ownershipNote ? <p className="note">{project.ownershipNote}</p> : null}
    </section>
  );
}
