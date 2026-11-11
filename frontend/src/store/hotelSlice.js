import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { request } from "../api/hotelApi";

// ---------- Async actions (API calls) ----------
export const fetchHotels = createAsyncThunk(
  "hotels/fetchAll",
  ({ search, minPrice, maxPrice, offset, limit }) => {
    const params = new URLSearchParams({ offset, limit });
    if (search) params.append("search", search);
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);
    return request(`/api/hotels?${params.toString()}`);
  }
);

export const fetchHotelById = createAsyncThunk("hotels/fetchOne", (id) =>
  request(`/api/hotels/${id}`)
);

export const createHotel = createAsyncThunk("hotels/create", (formData) =>
  request("/api/hotels", { method: "POST", body: formData })
);

export const updateHotel = createAsyncThunk("hotels/update", ({ id, formData }) =>
  request(`/api/hotels/${id}`, { method: "PUT", body: formData })
);

export const deleteHotel = createAsyncThunk("hotels/delete", async (id) => {
  await request(`/api/hotels/${id}?deleteImage=true`, { method: "DELETE" });
  return id;
});

// ---------- Slice (state + reducers) ----------
const hotelSlice = createSlice({
  name: "hotels",
  initialState: {
    items: [],          // list page hotels
    total: 0,           // total hotels (pagination-ku)
    current: null,      // detail / edit page hotel
    status: "idle",     // idle | loading | succeeded | failed
    error: null,
    successMessage: "", // success popup text
  },
  reducers: {
    clearMessage(state) {
      state.successMessage = "";
      state.error = null;
    },
    clearCurrent(state) {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // List
      .addCase(fetchHotels.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Single hotel
      .addCase(fetchHotelById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchHotelById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchHotelById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // Create / Update / Delete
      .addCase(createHotel.fulfilled, (state) => {
        state.successMessage = "Hotel added successfully!";
      })
      .addCase(updateHotel.fulfilled, (state) => {
        state.successMessage = "Hotel updated successfully!";
      })
      .addCase(deleteHotel.fulfilled, (state, action) => {
        state.items = state.items.filter((hotel) => hotel.id !== action.payload);
        state.total -= 1;
        state.successMessage = "Hotel deleted successfully!";
      })
      .addCase(deleteHotel.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export const { clearMessage, clearCurrent } = hotelSlice.actions;
export default hotelSlice.reducer;