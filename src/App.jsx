import { useState } from "react";
import { Login, isLoggedIn, logout } from "./components/Login";
import { ProjectDetail } from "./components/ProjectDetail";
import { ProjectForm } from "./components/ProjectForm";
import { ProjectList } from "./components/ProjectList";

export default function App() {
  const [screen, setScreen] = useState({ name: "list" });
  const [authed, setAuthed] = useState(isLoggedIn);

  function signOut() {
    logout();
    setAuthed(false);
    setScreen({ name: "list" });
  }

  return (
    <div className="shell">
      <header className="topbar">
        <button type="button" className="brand" onClick={() => authed && setScreen({ name: "list" })}>
          <span>DemandSetu</span>
          <small>Real Estate</small>
        </button>
        {authed ? (
          <button type="button" className="ghost" onClick={signOut}>
            Log out
          </button>
        ) : (
          <p>Project desk</p>
        )}
      </header>
      {!authed ? (
        <main>
          <Login onSuccess={() => setAuthed(true)} />
        </main>
      ) : null}
      {authed ? (
      <main>
        {screen.name === "list" ? (
          <ProjectList
            onCreate={() => setScreen({ name: "form" })}
            onOpen={(id) => setScreen({ name: "detail", id })}
            onEdit={(id) => setScreen({ name: "form", id })}
          />
        ) : null}
        {screen.name === "detail" ? (
          <ProjectDetail
            id={screen.id}
            onBack={() => setScreen({ name: "list" })}
            onEdit={(id) => setScreen({ name: "form", id })}
            onDeleted={() => setScreen({ name: "list" })}
          />
        ) : null}
        {screen.name === "form" ? (
          <ProjectForm
            id={screen.id}
            onCancel={() => setScreen({ name: "list" })}
            onSaved={(id) => setScreen({ name: "detail", id })}
          />
        ) : null}
      </main>
      ) : null}
    </div>
  );
}
