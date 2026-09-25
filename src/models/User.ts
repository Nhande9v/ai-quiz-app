import mongoose, { models, Schema } from "mongoose";

const UserSchema = new Schema(
    {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["student", "instructor"], default: "student" },
    },
    { timestamps: true },
)

export const User = models.User || mongoose.model("User", UserSchema);