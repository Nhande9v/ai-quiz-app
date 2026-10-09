import mongoose, { models, Schema } from "mongoose";

const UserSchema = new Schema(
    {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    avatar_url: { type: String, trim: true, default: "" },
    phone_number: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    },
    { timestamps: true },
)

export const User = models.User || mongoose.model("User", UserSchema);