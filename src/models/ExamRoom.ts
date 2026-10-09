import mongoose, { models, Schema } from "mongoose";

const ExamRoomSchema = new Schema(
  {
    room_code: { type: String, required: true, unique: true, uppercase: true },
    exam_id: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    teacher_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "on going", "finished"],
      default: "pending",
    },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
  },
  { timestamps: true }
);

export const ExamRoom = models.ExamRoom || mongoose.model("ExamRoom", ExamRoomSchema);