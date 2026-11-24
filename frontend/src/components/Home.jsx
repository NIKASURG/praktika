import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { API } from "../config";
import AdCard from "./AdCard";

function Home() {
  const [ads, setAds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
  const sessionId = localStorage.getItem("sessionId");

  useEffect(() => {
    loadAds("", "");
    loadCategories();
    loadFavorites();
  }, []);

  async function loadAds(category, text) {
    const res = await fetch(
      API + "/api/searchAds?category=" + category + "&q=" + encodeURIComponent(text),
    );
    const data = await res.json();
    if (data.success) {
      setAds(data.data);
    }
  }

  async function loadCategories() {
    const res = await fetch(API + "/api/getCategories");
    const data = await res.json();
    if (data.success) {
      setCategories(data.data);
    }
  }

  // Patikusių skelbimų id sąrašas (žvaigždutėms)
  async function loadFavorites() {
    if (!sessionId) {
      return;
    }
    const res = await fetch(API + "/api/getFavorites/" + sessionId);
    const data = await res.json();
    if (data.success) {
      setFavorites(data.data.map((ad) => ad._id));
    }
  }

  async function toggleFavorite(adId) {
    if (!sessionId) {
      navigate("/login");
      return;
    }
    await fetch(API + "/api/toggleFavorite/" + sessionId + "/" + adId, { method: "POST" });
    loadFavorites();
  }

  function handleSearch(e) {
    e.preventDefault();
    loadAds(e.target.category.value, e.target.search.value);
  }

  return (
    <>
      <form onSubmit={handleSearch} className="row g-2 mb-4">
        <div className="col-md-4">
          <select name="category" className="form-select">
            <option value="">Visos kategorijos</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col">
          <input name="search" className="form-control" placeholder="Ieškoti..." />
        </div>
        <div className="col-auto">
          <button className="btn btn-primary">Ieškoti</button>
        </div>
      </form>

      {ads.length === 0 && <p className="text-secondary">Skelbimų nerasta.</p>}

      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
        {ads.map((ad) => (
          <AdCard
            key={ad._id}
            ad={ad}
            favorite={favorites.includes(ad._id)}
            onStar={toggleFavorite}
          />
        ))}
      </div>
    </>
  );
}

export default Home;
