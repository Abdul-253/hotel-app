import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function HotelMap({ lat, lng, title }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Map create pannum
    const map = L.map(containerRef.current).setView([lat, lng], 15);

    // OpenStreetMap tiles (free, API key thevai illa)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // Pin icon (emoji) - Leaflet default icon Vite-la kaatadhu, so custom use pannrom
    const pin = L.divIcon({
      className: "map-pin",
      html: "📍",
      iconSize: [30, 30],
      iconAnchor: [15, 28],
    });

    L.marker([lat, lng], { icon: pin, title })
      .addTo(map)
      .bindPopup(title);

    // Page-la irundhu poi display aagum pothu map clean pannum
    return () => map.remove();
  }, [lat, lng, title]);

  return (
    <div
      ref={containerRef}
      className="map"
      role="region"
      aria-label={`${title} location map`}
    />
  );
}