import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { API } from "../config";

function Login() {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function login(e) {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    const res = await fetch(API + "/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username, password: password }),
    });
    const data = await res.json();

    if (data.success) {
      localStorage.setItem("sessionId", data.sessionId);
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", username);
      navigate("/");
    } else {
      setError(data.reason);
    }
  }

  return (
    <form onSubmit={login} className="mx-auto" style={{ maxWidth: 400 }}>
      <h2 className="mb-3">Prisijungimas</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <input name="username" className="form-control mb-2" placeholder="Vartotojo vardas" required />
      <input
        name="password"
        type="password"
        className="form-control mb-3"
        placeholder="Slaptažodis"
        required
      />
      <button className="btn btn-primary">Prisijungti</button>
      <p className="mt-3">
        Neturi paskyros? <Link to="/register">Registruokis</Link>
      </p>
    </form>
  );
}

export default Login;
