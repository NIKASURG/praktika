import { Link, useNavigate, useLocation } from "react-router";

function Header() {
  const navigate = useNavigate();
  useLocation(); 

  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  function logout() {
    localStorage.clear();
    navigate("/");
  }

  return (
    <nav className="navbar bg-dark" data-bs-theme="dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Skelbimai
        </Link>
        <div className="d-flex flex-wrap gap-2">
          {username ? (
            <>
              <Link className="btn btn-sm btn-outline-light" to="/my-ads">
                Mano skelbimai
              </Link>
              <Link className="btn btn-sm btn-outline-light" to="/favorites">
                ★ Patikę
              </Link>
              {role === "admin" && (
                <Link className="btn btn-sm btn-outline-light" to="/admin">
                  Admin
                </Link>
              )}
              <button className="btn btn-sm btn-light" onClick={logout}>
                Atsijungti ({username})
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-sm btn-outline-light" to="/register">
                Registruotis
              </Link>
              <Link className="btn btn-sm btn-light" to="/login">
                Prisijungti
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;
