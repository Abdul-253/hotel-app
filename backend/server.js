require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

// Images store aagura folder
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(UPLOAD_DIR)); // images browser-la paarka

// ---------- Multer (image upload settings) ----------
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `hotel-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// ---------- Helpers ----------
const isBlank = (v) => v === undefined || v === null || v === "";

function validateHotel(body) {
  const errors = [];
  const title = (body.title || "").trim();
  const description = (body.description || "").trim();
  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);
  const price = Number(body.price);

  if (title.length < 3 || title.length > 150)
    errors.push("Title must be 3-150 characters");
  if (description.length < 10)
    errors.push("Description must be at least 10 characters");
  if (isBlank(body.latitude) || isNaN(latitude) || latitude < -90 || latitude > 90)
    errors.push("Latitude must be between -90 and 90");
  if (isBlank(body.longitude) || isNaN(longitude) || longitude < -180 || longitude > 180)
    errors.push("Longitude must be between -180 and 180");
  if (isBlank(body.price) || isNaN(price) || price < 0)
    errors.push("Price must be a number 0 or more");

  return { errors, values: { title, description, latitude, longitude, price } };
}

function removeFile(filename) {
  if (!filename) return;
  fs.unlink(path.join(UPLOAD_DIR, filename), () => {});
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// ---------- 1. POST /api/hotels (create) ----------
app.post("/api/hotels", upload.single("image"), async (req, res) => {
  const { errors, values } = validateHotel(req.body);
  if (!req.file) errors.unshift("Image is required");

  if (errors.length) {
    removeFile(req.file?.filename);
    return res.status(400).json({ message: "Validation failed", errors });
  }

  try {
    const imagePath = `/uploads/${req.file.filename}`;
    const result = await pool.query(
      `INSERT INTO hotels (title, description, latitude, longitude, price, image_path)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [values.title, values.description, values.latitude, values.longitude, values.price, imagePath]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    removeFile(req.file.filename);
    res.status(500).json({ message: "Database error" });
  }
});

// ---------- 2. PUT /api/hotels/:id (edit) ----------
app.put("/api/hotels/:id", upload.single("image"), async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid hotel id" });

  const { errors, values } = validateHotel(req.body);
  if (errors.length) {
    removeFile(req.file?.filename);
    return res.status(400).json({ message: "Validation failed", errors });
  }

  try {
    const existing = await pool.query("SELECT image_path FROM hotels WHERE id = $1", [id]);
    if (!existing.rowCount) {
      removeFile(req.file?.filename);
      return res.status(404).json({ message: "Hotel not found" });
    }

    // Naya image vandha mattum replace pannu, illana old image-ye vachukko
    const oldImage = existing.rows[0].image_path;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : oldImage;

    const result = await pool.query(
      `UPDATE hotels
       SET title = $1, description = $2, latitude = $3, longitude = $4,
           price = $5, image_path = $6
       WHERE id = $7
       RETURNING *`,
      [values.title, values.description, values.latitude, values.longitude, values.price, imagePath, id]
    );

    if (req.file) removeFile(path.basename(oldImage));
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    removeFile(req.file?.filename);
    res.status(500).json({ message: "Database error" });
  }
});

// ---------- 3. DELETE /api/hotels/:id ----------
// ?deleteImage=false pannaa image file-ah delete aagaathu
app.delete("/api/hotels/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid hotel id" });

  try {
    const result = await pool.query(
      "DELETE FROM hotels WHERE id = $1 RETURNING image_path",
      [id]
    );
    if (!result.rowCount) return res.status(404).json({ message: "Hotel not found" });

    if (req.query.deleteImage !== "false") {
      removeFile(path.basename(result.rows[0].image_path));
    }
    res.json({ message: "Hotel deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

// ---------- 4. GET /api/hotels (list + filters + pagination) ----------
app.get("/api/hotels", async (req, res) => {
  const { search, minPrice, maxPrice } = req.query;
  const offset = Math.max(parseInt(req.query.offset) || 0, 0);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 6, 1), 50);

  const conditions = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`title ILIKE $${params.length}`);
  }
  if (minPrice && !isNaN(minPrice)) {
    params.push(Number(minPrice));
    conditions.push(`price >= $${params.length}`);
  }
  if (maxPrice && !isNaN(maxPrice)) {
    params.push(Number(maxPrice));
    conditions.push(`price <= $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const countResult = await pool.query(`SELECT COUNT(*) FROM hotels ${where}`, params);

    const dataResult = await pool.query(
      `SELECT * FROM hotels ${where}
       ORDER BY id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    res.json({
      data: dataResult.rows,
      total: Number(countResult.rows[0].count),
      offset,
      limit,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

// ---------- GET one hotel (detail page-ku) ----------
app.get("/api/hotels/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid hotel id" });

  try {
    const result = await pool.query("SELECT * FROM hotels WHERE id = $1", [id]);
    if (!result.rowCount) return res.status(404).json({ message: "Hotel not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

// ---------- Multer / upload errors handle ----------
app.use((err, req, res, next) => {
  res.status(400).json({ message: err.message });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});