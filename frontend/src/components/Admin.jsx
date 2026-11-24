import { useState, useEffect } from "react";
import { Navigate } from "react-router";
import { API } from "../config";

function Admin() {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const sessionId = localStorage.getItem("sessionId");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role === "admin") {
      loadUsers();
      loadCategories();
    }
  }, []);

  async function loadUsers() {
    const res = await fetch(API + "/api/admin/getUsers/" + sessionId);
    const data = await res.json();
    if (data.success) {
      setUsers(data.data);
    }
  }

  async function loadCategories() {
    const res = await fetch(API + "/api/getCategories");
    const data = await res.json();
    if (data.success) {
      setCategories(data.data);
    }
  }

  async function addCategory(e) {
    e.preventDefault();
    const form = e.target;

    await fetch(API + "/api/createCategory/" + sessionId, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.category.value }),
    });

    form.reset();
    loadCategories();
  }

  async function toggleBlock(user) {
    await fetch(API + "/api/admin/blockUser/" + sessionId + "/" + user._id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked: !user.blocked }),
    });
    loadUsers();
  }

  if (role !== "admin") {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <h2>Administravimas</h2>
      <p className="text-secondary">Skelbimus ir komentarus blokuok skelbimo puslapyje.</p>

      <h4 className="mt-4">Kategorijos</h4>
      <form onSubmit={addCategory} className="d-flex gap-2 mb-2" style={{ maxWidth: 400 }}>
        <input name="category" className="form-control" placeholder="Nauja kategorija" required />
        <button className="btn btn-success">Pridėti</button>
      </form>
      <ul>
        {categories.map((c) => (
          <li key={c._id}>{c.name}</li>
        ))}
      </ul>

      <h4 className="mt-4">Vartotojai</h4>
      <ul className="list-group">
        {users.map((user) => (
          <li
            key={user._id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>
              {user.username} ({user.role}){" "}
              {user.blocked && <span className="badge text-bg-danger">Užblokuotas</span>}
            </span>
            {user.role !== "admin" && (
              <button className="btn btn-sm btn-outline-secondary" onClick={() => toggleBlock(user)}>
                {user.blocked ? "Atblokuoti" : "Blokuoti"}
              </button>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

export default Admin;
