const API = import.meta.env.VITE_API_URL || "https://packagemakerbackend.demandsetutours.com/api/demandrealestate";

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) {
    throw new Error(body.message || `Request failed (${response.status})`);
  }
  return body;
}

export function listProjects() {
  return request("/all");
}

export function getProject(id) {
  return request(`/id/${id}`);
}

export function createProject(payload) {
  return request("/create", { method: "POST", body: JSON.stringify(payload) });
}

export function updateProject(id, payload) {
  return request(`/update/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteProject(id) {
  return request(`/delete/${id}`, { method: "DELETE" });
}
