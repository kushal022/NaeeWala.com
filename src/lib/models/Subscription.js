import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
  name: String,
  pricePerMonth: Number,
  features: [String],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema);
