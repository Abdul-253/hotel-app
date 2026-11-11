import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { fetchHotels, deleteHotel } from "../store/hotelSlice";
import HotelCard from "../components/HotelCard";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/pagination";

const PAGE_SIZE = 6;
const EMPTY_FILTERS = { search: "", minPrice: "", maxPrice: "" };

export default function HotelListPage() {
  const dispatch = useDispatch();
  const { items, total, status, error } = useSelector((state) => state.hotels);

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Page or filter maarum pothu backend-la irundhu data eduthu varum
  useEffect(() => {
    dispatch(
      fetchHotels({
        ...filters,
        offset: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      })
    );
  }, [dispatch, page, filters]);

  // Last item delete aana previous page-ku pogum
  useEffect(() => {
    if (status === "succeeded" && items.length === 0 && page > 1) {
      setPage((p) => p - 1);
    }
  }, [items, status, page]);

  const handleApply = (newFilters) => {
    setPage(1);
    setFilters(newFilters);
  };

  const handleDelete = (id) => {
    if (window.confirm("Indha hotel-ah delete pannalaama?")) {
      dispatch(deleteHotel(id));
    }
  };

  return (
    <main className="container">
      <Helmet>
        <title>Hotels | Hotel Finder</title>
        <meta name="description" content="Browse hotels with prices, descriptions and locations." />
      </Helmet>

      <header className="page-header">
        <div>
          <h1>Hotels</h1>
          <p className="muted">{total} hotels found</p>
        </div>
        <Link to="/add" className="btn btn-primary">+ Add Hotel</Link>
      </header>

      <FilterBar initial={EMPTY_FILTERS} onApply={handleApply} />

      {status === "loading" && <p>Loading...</p>}
      {status === "failed" && <p className="error">{error}</p>}

      <section className="hotel-grid">
        {items.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} onDelete={handleDelete} />
        ))}
      </section>

      {status === "succeeded" && items.length === 0 && <p>No hotels found.</p>}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </main>
  );
}