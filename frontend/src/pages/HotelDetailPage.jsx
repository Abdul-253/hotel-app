import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { fetchHotelById, clearCurrent } from "../store/hotelSlice";
import { imageUrl } from "../api/hotelApi";
import HotelMap from "../components/HotelMap";

// Rendu point mela distance (km) - Haversine formula
function distanceKm(a, b) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export default function HotelDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: hotel, status, error } = useSelector((state) => state.hotels);

  const [userPos, setUserPos] = useState(null);
  const [geoError, setGeoError] = useState("");

  // Hotel details load
  useEffect(() => {
    dispatch(fetchHotelById(id));
    return () => dispatch(clearCurrent());
  }, [dispatch, id]);

  // User location (browser permission)
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Ungaloda browser location support pannala.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setGeoError("Distance paakka location access allow pannunga.")
    );
  }, []);

  if (status === "failed") return <p className="container error">{error}</p>;
  if (!hotel) return <p className="container">Loading...</p>;

  const lat = Number(hotel.latitude);
  const lng = Number(hotel.longitude);

  return (
    <main className="container">
      <Helmet>
        <title>{hotel.title} | Hotel Finder</title>
        <meta name="description" content={hotel.description.slice(0, 150)} />
      </Helmet>

      <Link to="/" className="back">← Back to hotels</Link>

      <div className="detail-grid">
        <img src={imageUrl(hotel.image_path)} alt={`${hotel.title} hotel view`} />

        <div className="detail-info">
          <h1>{hotel.title}</h1>
          <p className="price">₹{Number(hotel.price).toLocaleString("en-IN")} / night</p>
          <p className="desc-full">{hotel.description}</p>
          <p className="muted">Coordinates: {lat}, {lng}</p>

          {userPos && (
            <p className="distance">
              📍 Ungaloda irundhu sumar <strong>{distanceKm(userPos, { lat, lng }).toFixed(1)} km</strong>
            </p>
          )}
          {geoError && <p className="muted">{geoError}</p>}
        </div>
      </div>

      <section className="map-section">
        <h2>Location</h2>
        <HotelMap lat={lat} lng={lng} title={hotel.title} />
        <p className="muted">
          <a href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noreferrer">
            Google Maps-la open pannu →
          </a>
        </p>
      </section>
    </main>
  );
}