import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router";
import { API } from "../config";

function MyAds() {
  const [ads, setAds] = useState([]);
  const sessionId = localStorage.getItem("sessionId");

  useEffect(() => {
    if (sessionId) {
      loadAds();
    }
  }, []);

  async function loadAds() {
    const res = await fetch(API + "/api/getMyAds/" + sessionId);
    const data = await res.json();
    if (data.success) {
      setAds(data.data);
    }
  }

  async function deleteAd(adId) {
    if (!window.confirm("Ištrinti skelbimą?")) {
      return;
    }
    await fetch(API + "/api/deleteAd/" + sessionId + "/" + adId, { method: "DELETE" });
    loadAds();
  }

  // Neprisijungęs vartotojas nukreipiamas į prisijungimą
  if (!sessionId) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <h2>Mano skelbimai</h2>
      <Link className="btn btn-success mb-3" to="/new-ad">
        + Naujas skelbimas
      </Link>

      <ul className="list-group">
        {ads.map((ad) => (
          <li
            key={ad._id}
            className="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2"
          >
            <span>
              <Link to={"/ads/" + ad._id}>{ad.title}</Link> – {ad.price} €{" "}
              {ad.blocked && <span className="badge text-bg-danger">Užblokuotas</span>}
            </span>
            <span>
              <Link className="btn btn-sm btn-outline-primary me-1" to={"/edit-ad/" + ad._id}>
                Redaguoti
              </Link>
              <button className="btn btn-sm btn-outline-danger" onClick={() => deleteAd(ad._id)}>
                Ištrinti
              </button>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

export default MyAds;
