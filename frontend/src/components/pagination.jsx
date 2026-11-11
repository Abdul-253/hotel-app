export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button disabled={page === 1} onClick={() => onChange(page - 1)}>«</button>

      {pages.map((p) => (
        <button
          key={p}
          className={p === page ? "active" : ""}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}

      <button disabled={page === totalPages} onClick={() => onChange(page + 1)}>»</button>
    </nav>
  );
}