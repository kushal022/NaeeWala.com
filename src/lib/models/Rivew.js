import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  barber: { type: mongoose.Schema.Types.ObjectId, ref: "Barber" },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
