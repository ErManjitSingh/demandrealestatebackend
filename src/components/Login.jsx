import { useState } from "react";

const ID = "9816661968";
const PASSWORD = "9816";
const SESSION_KEY = "demandsetu-desk";

export function isLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function Login({ onSuccess }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function onSubmit(event) {
    event.preventDefault();
    if (userId.trim() === ID && password === PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      onSuccess();
      return;
    }
    setError("That ID or password is wrong.");
  }

  return (
    <form className="login" onSubmit={onSubmit}>
      <p className="eyebrow">Project desk</p>
      <h1>Sign in</h1>
      <p className="muted">Use the office ID and password.</p>
      {error ? <p className="banner error">{error}</p> : null}
      <label>
        ID
        <input
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          inputMode="numeric"
          autoComplete="username"
          required
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </label>
      <button type="submit" className="primary">
        Sign in
      </button>
    </form>
  );
}
