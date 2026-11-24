import { useState, useEffect } from "react";
import { Navigate } from "react-router";
import { API } from "../config";
import AdCard from "./AdCard";

function Favorites() {
  const [ads, setAds] = useState([]);
  const sessionId = localStorage.getItem("sessionId");

  useEffect(() => {
    if (sessionId) {
      loadFavorites();
    }
  }, []);

  async function loadFavorites() {
    const res = await fetch(API + "/api/getFavorites/" + sessionId);
    const data = await res.json();
    if (data.success) {
      setAds(data.data);
    }
  }

  // Paspaudus žvaigždutę skelbimas dingsta iš sąrašo
  async function removeFavorite(adId) {
    await fetch(API + "/api/toggleFavorite/" + sessionId + "/" + adId, { method: "POST" });
    loadFavorites();
  }

  if (!sessionId) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <h2 className="mb-3">Patikę skelbimai</h2>
      {ads.length === 0 && <p className="text-secondary">Dar nieko nepažymėjai.</p>}

      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
        {ads.map((ad) => (
          <AdCard key={ad._id} ad={ad} favorite={true} onStar={removeFavorite} />
        ))}
      </div>
    </>
  );
}

export default Favorites;
