import { useEffect, useState } from "react";
import { deleteProject, listProjects } from "../lib/api";

export function ProjectList({ onCreate, onOpen, onEdit }) {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listProjects()
      .then((body) => {
        if (active) setProjects(body.data || []);
      })
      .catch((err) => {
        if (active) setError(err.message || "Could not load projects");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function remove(project) {
    const ok = window.confirm(`Delete ${project.name}? This also removes its enquiries.`);
    if (!ok) return;
    try {
      await deleteProject(project._id);
      setProjects((current) => current.filter((item) => item._id !== project._id));
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  }

  return (
    <section>
      <div className="page-head">
        <div>
          <p className="eyebrow">Projects</p>
          <h1>All projects</h1>
        </div>
        <button type="button" className="primary" onClick={onCreate}>
          New project
        </button>
      </div>

      {error ? <p className="banner error">{error}</p> : null}
      {loading ? <p className="muted">Loading projects…</p> : null}
      {!loading && !projects.length && !error ? <p className="muted">No projects yet.</p> : null}

      <div className="cards">
        {projects.map((project) => {
          const cover = project.media?.find((item) => item.kind === "view" && item.url)?.url;
          return (
            <article key={project._id} className="card">
              {cover ? <img src={cover} alt="" /> : <div className="card-empty">No photo</div>}
              <div className="card-body">
                <p className="eyebrow">{project.status || "No status"}</p>
                <h2>{project.name}</h2>
                <p className="muted">{project.location || project.slug}</p>
                <div className="row-actions">
                  <button type="button" onClick={() => onOpen(project._id)}>
                    View
                  </button>
                  <button type="button" onClick={() => onEdit(project._id)}>
                    Edit
                  </button>
                  <button type="button" className="danger" onClick={() => remove(project)}>
                    Delete
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
