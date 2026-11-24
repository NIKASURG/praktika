import { BrowserRouter, Routes, Route } from "react-router";
import Header from "./components/Header";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import AdPage from "./components/AdPage";
import MyAds from "./components/MyAds";
import AdForm from "./components/AdForm";
import Favorites from "./components/Favorites";
import Admin from "./components/Admin";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <div className="container py-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/ads/:id" element={<AdPage />} />
          <Route path="/my-ads" element={<MyAds />} />
          <Route path="/new-ad" element={<AdForm key="new" />} />
          <Route path="/edit-ad/:id" element={<AdForm key="edit" />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
