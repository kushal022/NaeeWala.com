import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema({
  barber: { type: mongoose.Schema.Types.ObjectId, ref: "Barber" },
  title: String,
  price: Number,
  durationMinutes: Number,
  description: String,
});

export default mongoose.models.Service || mongoose.model("Service", ServiceSchema);
