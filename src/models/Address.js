import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  landmark: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, default: "India" },
  pincode: { type: String, required: true },

  coords: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  }
});

AddressSchema.index({ coords: "2dsphere" });

export default mongoose.models.Address || mongoose.model("Address", AddressSchema);
