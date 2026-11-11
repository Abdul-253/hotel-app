import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import HotelForm from "../components/HotelForm";
import {
  fetchHotelById,
  createHotel,
  updateHotel,
  clearCurrent,
} from "../store/hotelSlice";

export default function HotelFormPage() {
  const { id } = useParams();           // /edit/:id na id irukum, /add na undefined
  const isEdit = Boolean(id);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current, status, error } = useSelector((state) => state.hotels);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Edit mode-na hotel data eduthu varum
  useEffect(() => {
    if (isEdit) dispatch(fetchHotelById(id));
    return () => dispatch(clearCurrent());
  }, [dispatch, id, isEdit]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setFormError("");

    const action = isEdit
      ? updateHotel({ id, formData })
      : createHotel(formData);

    const result = await dispatch(action);
    setIsSubmitting(false);

    if (result.error) {
      setFormError(result.error.message);
    } else {
      navigate("/");   // success aana list page-ku pogum
    }
  };

  if (isEdit && status === "failed") {
    return <p className="container error">{error}</p>;
  }
  if (isEdit && !current) {
    return <p className="container">Loading...</p>;
  }

  return (
    <main className="container">
      <Helmet>
        <title>{isEdit ? "Edit Hotel" : "Add Hotel"} | Hotel Finder</title>
        <meta name="description" content="Add or edit hotel details." />
      </Helmet>

      <h1 style={{ textAlign: "center" }}>{isEdit ? "Edit Hotel" : "Add New Hotel"}</h1>

      {formError && <p className="error" style={{ textAlign: "center" }}>{formError}</p>}

      <HotelForm
        initialData={isEdit ? current : undefined}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel={isEdit ? "Update Hotel" : "Add Hotel"}
      />
    </main>
  );
}