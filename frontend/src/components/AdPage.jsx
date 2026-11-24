import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { API } from "../config";

function AdPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState(null);
  const [comments, setComments] = useState([]);
  const [favorite, setFavorite] = useState(false);

  const sessionId = localStorage.getItem("sessionId");
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  useEffect(() => {
    loadAd();
    loadComments();
    loadFavorite();
  }, []);

  async function loadAd() {
    const res = await fetch(API + "/api/getAd/" + id);
    const data = await res.json();
    if (data.success) {
      setAd(data.data);
    } else {
      navigate("/");
    }
  }

  async function loadComments() {
    const res = await fetch(API + "/api/getComments/" + id);
    const data = await res.json();
    if (data.success) {
      setComments(data.data);
    }
  }

  async function loadFavorite() {
    if (!sessionId) {
      return;
    }
    const res = await fetch(API + "/api/getFavorites/" + sessionId);
    const data = await res.json();
    if (data.success) {
      setFavorite(data.data.some((a) => a._id === id));
    }
  }

  async function toggleFavorite() {
    if (!sessionId) {
      navigate("/login");
      return;
    }
    const res = await fetch(API + "/api/toggleFavorite/" + sessionId + "/" + id, {
      method: "POST",
    });
    const data = await res.json();
    setFavorite(data.favorite);
  }

  async function addComment(e) {
    e.preventDefault();
    const form = e.target;

    await fetch(API + "/api/createComment/" + sessionId + "/" + id, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: form.comment.value }),
    });

    form.reset();
    loadComments();
  }

  async function deleteComment(commentId) {
    await fetch(API + "/api/deleteComment/" + sessionId + "/" + commentId, {
      method: "DELETE",
    });
    loadComments();
  }

  async function blockComment(commentId) {
    await fetch(API + "/api/admin/blockComment/" + sessionId + "/" + commentId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked: true }),
    });
    loadComments();
  }

  async function blockAd() {
    await fetch(API + "/api/admin/blockAd/" + sessionId + "/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked: true }),
    });
    navigate("/");
  }

  if (ad === null) {
    return <p>Kraunama...</p>;
  }

  const isOwner = ad.username === username;
  const isAdmin = role === "admin";

  return (
    <>
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <img src={API + "/uploads/" + ad.image} className="img-fluid rounded" alt={ad.title} />
        </div>
        <div className="col-md-6">
          <div className="d-flex justify-content-between">
            <h2>{ad.title}</h2>
            <button
              className="btn btn-link text-warning fs-3 p-0 text-decoration-none"
              onClick={toggleFavorite}
            >
              {favorite ? "★" : "☆"}
            </button>
          </div>
          <p className="fs-3 fw-bold">{ad.price} €</p>
          <p className="text-secondary">Pardavėjas: {ad.username}</p>
          <p>{ad.description}</p>

          {isOwner && (
            <Link className="btn btn-outline-primary me-2" to={"/edit-ad/" + ad._id}>
              Redaguoti
            </Link>
          )}
          {isAdmin && (
            <button className="btn btn-outline-danger" onClick={blockAd}>
              Blokuoti skelbimą
            </button>
          )}
        </div>
      </div>

      <h4>Komentarai</h4>
      <ul className="list-group mb-3">
        {comments.map((comment) => (
          <li key={comment._id} className="list-group-item d-flex justify-content-between gap-2">
            <span>
              <b>{comment.username}:</b> {comment.text}
            </span>
            <span className="text-nowrap">
              {(isOwner || isAdmin) && (
                <button
                  className="btn btn-sm btn-outline-danger me-1"
                  onClick={() => deleteComment(comment._id)}
                >
                  Ištrinti
                </button>
              )}
              {isAdmin && (
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => blockComment(comment._id)}
                >
                  Blokuoti
                </button>
              )}
            </span>
          </li>
        ))}
      </ul>

      {sessionId ? (
        <form onSubmit={addComment} className="d-flex gap-2">
          <input name="comment" className="form-control" placeholder="Parašyk komentarą..." required />
          <button className="btn btn-primary">Siųsti</button>
        </form>
      ) : (
        <p className="text-secondary">
          <Link to="/login">Prisijunk</Link>, kad galėtum komentuoti.
        </p>
      )}
    </>
  );
}

export default AdPage;
