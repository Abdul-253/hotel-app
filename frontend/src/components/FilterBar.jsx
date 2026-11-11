import { useState } from "react";

const MIN_LIMIT = 0;      // slider minimum (₹)
const MAX_LIMIT = 10000;  // slider maximum (₹)
const STEP = 100;         // slider step (₹)

export default function FilterBar({ onApply }) {
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState(MIN_LIMIT);
  const [maxPrice, setMaxPrice] = useState(MAX_LIMIT);

  // Track-la colour fill evlo irukkanu calculate pannum (percentage)
  const range = MAX_LIMIT - MIN_LIMIT;
  const leftPct = ((minPrice - MIN_LIMIT) / range) * 100;
  const rightPct = ((maxPrice - MIN_LIMIT) / range) * 100;

  // Min slider max-ah cross panna koodadhu, max slider min-ah cross panna koodadhu
  const handleMin = (e) => setMinPrice(Math.min(Number(e.target.value), maxPrice));
  const handleMax = (e) => setMaxPrice(Math.max(Number(e.target.value), minPrice));

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply({
      search: search.trim(),
      // Default range-la irundha filter anuppa vendaam
      minPrice: minPrice > MIN_LIMIT ? String(minPrice) : "",
      maxPrice: maxPrice < MAX_LIMIT ? String(maxPrice) : "",
    });
  };

  const handleClear = () => {
    setSearch("");
    setMinPrice(MIN_LIMIT);
    setMaxPrice(MAX_LIMIT);
    onApply({ search: "", minPrice: "", maxPrice: "" });
  };

  return (
    <form className="filter-bar" onSubmit={handleSubmit}>
      <div className="filter-field">
        <label className="filter-label">Search</label>
        <input
          className="filter-input"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="filter-field price-field">
        <label className="filter-label">
          Price: ₹{minPrice.toLocaleString("en-IN")} – ₹{maxPrice.toLocaleString("en-IN")}
        </label>

        <div className="range-wrap">
          <div className="range-track" />
          <div
            className="range-fill"
            style={{ left: `${leftPct}%`, width: `${rightPct - leftPct}%` }}
          />

          <input
            type="range"
            className="range-input"
            min={MIN_LIMIT}
            max={MAX_LIMIT}
            step={STEP}
            value={minPrice}
            onChange={handleMin}
            // Both thumbs ore idathula irundha, min thumb mela irukum (drag panna mudiyum)
            style={{ zIndex: minPrice > MAX_LIMIT - STEP * 2 ? 4 : 3 }}
            aria-label="Minimum price"
          />
          <input
            type="range"
            className="range-input"
            min={MIN_LIMIT}
            max={MAX_LIMIT}
            step={STEP}
            value={maxPrice}
            onChange={handleMax}
            style={{ zIndex: 3 }}
            aria-label="Maximum price"
          />
        </div>
      </div>

      <div className="filter-actions">
        <button type="submit" className="btn btn-primary">Apply</button>
        <button type="button" className="btn" onClick={handleClear}>Clear</button>
      </div>
    </form>
  );
}