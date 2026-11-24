import { useState, useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { API } from "../config";

function AdForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [ad, setAd] = useState(null);
  const [error, setError] = useState("");
  const sessionId = localStorage.getItem("sessionId");

  useEffect(() => {
    if (sessionId) {
      load();
    }
  }, []);

  async function load() {
    const res = await fetch(API + "/api/getCategories");
    const data = await res.json();
    setCategories(data.data);

    if (id) {
      const res2 = await fetch(API + "/api/getMyAds/" + sessionId);
      const data2 = await res2.json();
      setAd(data2.data.find((a) => a._id === id));
    } else {
      setAd({});
    }
  }

  async function save(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    let url = API + "/api/createAd/" + sessionId;
    let method = "POST";
    if (id) {
      url = API + "/api/updateAd/" + sessionId + "/" + id;
      method = "PUT";
    }

    const res = await fetch(url, { method: method, body: formData });
    const data = await res.json();

    if (data.success) {
      navigate("/my-ads");
    } else {
      setError(data.reason);
    }
  }

  if (!sessionId) {
    return <Navigate to="/login" />;
  }
  if (ad === null) {
    return <p>Kraunama...</p>;
  }

  return (
    <form onSubmit={save} className="mx-auto" style={{ maxWidth: 500 }}>
      <h2 className="mb-3">{id ? "Redaguoti skelbimą" : "Naujas skelbimas"}</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <input
        name="title"
        className="form-control mb-2"
        placeholder="Pavadinimas"
        defaultValue={ad.title}
        required
      />
      <select name="categoryId" className="form-select mb-2" defaultValue={ad.categoryId} required>
        <option value="">Kategorija</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>
      <textarea
        name="description"
        className="form-control mb-2"
        rows={4}
        placeholder="Aprašymas"
        defaultValue={ad.description}
        required
      />
      <input
        name="price"
        type="number"
        min="0"
        step="0.01"
        className="form-control mb-2"
        placeholder="Kaina (€)"
        defaultValue={ad.price}
        required
      />
      {id && <small className="text-secondary">Nuotrauką rinkis tik jei nori pakeisti</small>}
      <input name="image" type="file" accept="image/*" className="form-control mb-3" required={!id} />

      <button className="btn btn-primary">Išsaugoti</button>
    </form>
  );
}

export default AdForm;
