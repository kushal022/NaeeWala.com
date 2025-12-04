import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  barber: { type: mongoose.Schema.Types.ObjectId, ref: "Barber", required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
  startAt: { type: Date, required: true },
  endAt: { type: Date },
  status: { type: String, enum: ["pending","accepted","rejected","completed","cancelled"], default: "pending" },
  payment: {
    amount: Number,
    method: { type: String, enum: ["razorpay","wallet","none"], default: "none" },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    paid: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema);
