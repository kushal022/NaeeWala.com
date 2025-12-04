import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema({
  phoneOrEmail: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
});

export default mongoose.models.OTP || mongoose.model("OTP", OTPSchema);
