import mongoose, { models, Schema } from "mongoose";

const StudentAnswerSchema = new Schema({
  question_id: { type: Schema.Types.ObjectId, ref: "Question", required: true },
  topic_id: { type: Schema.Types.ObjectId, ref: "Topic", required: true },
  question_order: { type: Number, min: 1, required: true },
  selected_option_id: { type: Schema.Types.ObjectId },
  is_correct: { type: Boolean },
  answered_at: { type: Date },
});

const ViolationLogSchema = new Schema({
  violation_type: {
    type: String,
    enum: ["tab_switch", "multiple_faces", "no_face", "looking_away"],
    required: true,
  },
  violation_time: { type: Date, default: Date.now },
  snapshot_url: { type: String, default: "" },
});

const AiRecommendationSchema = new Schema({
  weak_topics: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
  advice_content: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

const ExamAttemptSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    attempt_type: {
      type: String,
      enum: ["practice", "official"],
      required: true,
    },
    exam_id: { type: Schema.Types.ObjectId, ref: "Exam" },
    room_id: { type: Schema.Types.ObjectId, ref: "ExamRoom" },
    start_time: { type: Date, default: Date.now },
    submit_time: { type: Date },
    total_score: { type: Number, default: 0 },
    total_correct: { type: Number, default: 0 },
    total_wrong: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["in_progress", "submitted", "timed_out"],
      default: "in_progress",
    },

    answers: [StudentAnswerSchema],
    violations: [ViolationLogSchema],
    ai_recommendation: AiRecommendationSchema,
  },
  { timestamps: true }
);

export const ExamAttempt =
  models.ExamAttempt || mongoose.model("ExamAttempt", ExamAttemptSchema);