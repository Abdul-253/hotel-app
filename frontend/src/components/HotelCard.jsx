import { Link, useNavigate } from "react-router-dom";
import { imageUrl } from "../api/hotelApi";

export default function HotelCard({ hotel, onDelete }) {
  const navigate = useNavigate();
  const shortDesc =
    hotel.description.length > 90 ? hotel.description.slice(0, 90) + "..." : hotel.description;

  return (
    // Card click pannaa detail page-ku pogum
    <article className="hotel-card" onClick={() => navigate(`/hotels/${hotel.id}`)}>
      <img src={imageUrl(hotel.image_path)} alt={`${hotel.title} hotel`} />

      <div className="hotel-info">
        <h3>{hotel.title}</h3>
        <p className="price">₹{Number(hotel.price).toLocaleString("en-IN")} <span className="muted">/ night</span></p>
        <p className="desc">{shortDesc}</p>

        {/* Buttons click pannaa card click event stop aagum */}
        <div className="actions" onClick={(e) => e.stopPropagation()}>
          <Link to={`/edit/${hotel.id}`} className="btn">Edit</Link>
          <button className="btn btn-danger" onClick={() => onDelete(hotel.id)}>
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}