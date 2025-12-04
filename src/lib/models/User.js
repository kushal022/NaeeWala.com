import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, required: true },
  password: { type: String }, // hashed
  phone: { type: String },
  role: { type: String, enum: ["customer","barber","admin"], default: "customer" },
  avatar: String,
  createdAt: { type: Date, default: Date.now },
  wallet: { type: Number, default: 0 } // for payments/refunds
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
