// Local-la empty; Vite proxy handle pannum.
// Deploy pannum pothu VITE_API_URL=https://your-backend.com nu set pannunga.
const API_BASE = import.meta.env.VITE_API_URL || "";

export const imageUrl = (path) => (path ? `${API_BASE}${path}` : "");

// Common fetch helper
export async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, options);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.errors ? data.errors.join(", ") : data.message;
    throw new Error(message || "Something went wrong");
  }
  return data;
}