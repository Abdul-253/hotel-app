import { useEffect, useState } from "react";
import { imageUrl } from "../api/hotelApi";

const EMPTY_VALUES = { title: "", description: "", latitude: "", longitude: "", price: "" };

// Validation: empty / wrong values-ku error message
function validate(values, hasImage) {
  const errors = {};
  const title = values.title.trim();
  const description = values.description.trim();
  const lat = Number(values.latitude);
  const lng = Number(values.longitude);
  const price = Number(values.price);

  if (!hasImage) errors.image = "Please upload an image";

  if (!title) errors.title = "Title is required";
  else if (title.length < 3) errors.title = "Title must be at least 3 characters";

  if (!description) errors.description = "Description is required";
  else if (description.length < 10) errors.description = "Description must be at least 10 characters";

  if (values.latitude === "" || isNaN(lat) || lat < -90 || lat > 90)
    errors.latitude = "Latitude must be between -90 and 90";

  if (values.longitude === "" || isNaN(lng) || lng < -180 || lng > 180)
    errors.longitude = "Longitude must be between -180 and 180";

  if (values.price === "" || isNaN(price) || price < 0)
    errors.price = "Enter a valid price (0 or more)";

  return errors;
}

export default function HotelForm({ initialData, onSubmit, isSubmitting, submitLabel }) {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});

  // Edit mode: existing data form-la fill pannu
  useEffect(() => {
    if (!initialData) return;
    setValues({
      title: initialData.title,
      description: initialData.description,
      latitude: initialData.latitude,
      longitude: initialData.longitude,
      price: initialData.price,
    });
    setPreview(imageUrl(initialData.image_path));
  }, [initialData]);

  // Naya image select pannaa preview kaatu
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Only image files are allowed" }));
      return;
    }
    setErrors((prev) => ({ ...prev, image: undefined }));
    setFile(selected);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const hasImage = Boolean(file || initialData?.image_path);
    const found = validate(values, hasImage);
    setErrors(found);
    if (Object.keys(found).length) return;

    const formData = new FormData();
    if (file) formData.append("image", file);
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, String(value).trim());
    });
    onSubmit(formData);
  };

  return (
    <form className="hotel-form" onSubmit={handleSubmit} noValidate>
      <label>
        Hotel Image
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {errors.image && <span className="field-error">{errors.image}</span>}
      </label>

      {preview && <img className="preview" src={preview} alt="Selected hotel preview" />}

      <label>
        Title
        <input name="title" value={values.title} onChange={handleChange} placeholder="e.g. Sea View Resort" />
        {errors.title && <span className="field-error">{errors.title}</span>}
      </label>

      <label>
        Description
        <textarea name="description" rows="4" value={values.description} onChange={handleChange} />
        {errors.description && <span className="field-error">{errors.description}</span>}
      </label>

      <div className="two-col">
        <label>
          Latitude
          <input name="latitude" type="number" step="any" value={values.latitude} onChange={handleChange} />
          {errors.latitude && <span className="field-error">{errors.latitude}</span>}
        </label>
        <label>
          Longitude
          <input name="longitude" type="number" step="any" value={values.longitude} onChange={handleChange} />
          {errors.longitude && <span className="field-error">{errors.longitude}</span>}
        </label>
      </div>

      <label>
        Price (₹ per night)
        <input name="price" type="number" min="0" step="0.01" value={values.price} onChange={handleChange} />
        {errors.price && <span className="field-error">{errors.price}</span>}
      </label>

      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}