// models/otpSession.model.js
import mongoose from "mongoose";

const otpSessionSchema = new mongoose.Schema({
  email:     { type: String, required: true, unique: true },
  otp:       { type: String, required: true },
  expiresAt: { type: Date,   required: true },
});

otpSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const OtpSession = mongoose.model("OtpSession", otpSessionSchema);