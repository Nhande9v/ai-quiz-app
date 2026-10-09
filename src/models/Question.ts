import mongoose, { models, Schema } from "mongoose";

const OptionSchema = new Schema({
  option_label: { type: String, required: true },
  content: { type: String, required: true },
  is_correct: { type: Boolean, required: true, default: false },
});

const QuestionSchema = new Schema(
  {
    topic_id: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    difficulty_level: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    explanation: { type: String, default: "" },
    is_ai_generated: { type: Boolean, default: false },
    options: [OptionSchema],
  },
  { timestamps: true }
);

export const Question = models.Question || mongoose.model("Question", QuestionSchema);