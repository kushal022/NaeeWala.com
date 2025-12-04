import mongoose from "mongoose";

const BarberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  shopName: String,
  description: String,
  location: {
    address: String,
    city: String,
    coords: { // for Google Maps / geospatial queries
      type: { type: String, default: "Point" },
      coordinates: [Number], // [lng, lat]
    },
  },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
  workingHours: { type: Object }, // { mon: [{from:'09:00',to:'18:00'}], ... }
  status: { type: String, enum: ["pending","approved","rejected"], default: "pending" },
  subscription: {
    plan: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
    expiresAt: Date
  },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

BarberSchema.index({ "location.coords": "2dsphere" });

export default mongoose.models.Barber || mongoose.model("Barber", BarberSchema);
