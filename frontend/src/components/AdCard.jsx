import { Link } from "react-router";
import { API } from "../config";

function AdCard({ ad, favorite, onStar }) {
  return (
    <div className="col">
      <div className="card h-100">
        <img
          src={API + "/uploads/" + ad.image}
          className="card-img-top"
          style={{ height: 200, objectFit: "cover" }}
          alt={ad.title}
        />
        <div className="card-body">
          <div className="d-flex justify-content-between">
            <h5>
              <Link to={"/ads/" + ad._id}>{ad.title}</Link>
            </h5>
            <button
              className="btn btn-link text-warning fs-4 p-0 text-decoration-none"
              onClick={() => onStar(ad._id)}
            >
              {favorite ? "★" : "☆"}
            </button>
          </div>
          <p className="fw-bold mb-1">{ad.price} €</p>
          <small className="text-secondary">{ad.username}</small>
        </div>
      </div>
    </div>
  );
}

export default AdCard;
