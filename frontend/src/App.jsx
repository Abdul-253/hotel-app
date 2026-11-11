import { useEffect } from "react";
import { Routes, Route, Link, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import HotelListPage from "./pages/HotelListPage";
import HotelDetailPage from "./pages/HotelDetailPage";
import HotelFormPage from "./pages/HotelFormPage";
import { clearMessage } from "./store/hotelSlice";

export default function App() {
  const dispatch = useDispatch();
  const successMessage = useSelector((state) => state.hotels.successMessage);

  // Success popup 3 seconds-la automatically marayum
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => dispatch(clearMessage()), 3000);
    return () => clearTimeout(timer);
  }, [successMessage, dispatch]);

  return (
    <>
      {/* Navbar */}
      <header className="navbar">
        <Link to="/" className="logo">HotelFinder</Link>
        <nav>
          <NavLink to="/" end>Hotels</NavLink>
          <NavLink to="/add">Add Hotel</NavLink>
        </nav>
      </header>

      {/* Pages (SPA routes) */}
      <Routes>
        <Route path="/" element={<HotelListPage />} />
        <Route path="/hotels/:id" element={<HotelDetailPage />} />
        <Route path="/add" element={<HotelFormPage />} />
        <Route path="/edit/:id" element={<HotelFormPage />} />
        <Route path="*" element={<p className="container">Page not found</p>} />
      </Routes>

      {/* Success popup (add / edit / delete) */}
      {successMessage && (
        <div className="toast" role="status">✅ {successMessage}</div>
      )}
    </>
  );
}