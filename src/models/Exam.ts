import mongoose, { models, Schema } from "mongoose";
import { Question } from "./Question";

type QuestionOptionSource = {
  _id: mongoose.Types.ObjectId;
  option_label: string;
  content: string;
  is_correct: boolean;
};

const ExamOptionSnapshotSchema = new Schema(
  {
    option_id: { type: Schema.Types.ObjectId, required: true },
    option_label: { type: String, required: true },
    content: { type: String, required: true },
    is_correct: { type: Boolean, required: true },
  },
  { _id: false }
);

const ExamQuestionSnapshotSchema = new Schema(
  {
    content: { type: String, required: true },
    difficulty_level: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    explanation: { type: String, default: "" },
    options: { type: [ExamOptionSnapshotSchema], required: true },
  },
  { _id: false }
);

const ExamQuestionSchema = new Schema({
  question_id: { type: Schema.Types.ObjectId, ref: "Question", required: true },
  question_score: { type: Number, min: 0, default: 1 },
  question_order: { type: Number, min: 1, required: true },
  question_snapshot: {
    type: ExamQuestionSnapshotSchema,
    required: true,
  },
});

const ExamSchema = new Schema(
  {
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    duration_minutes: { type: Number, required: true },
    total_questions: { type: Number, min: 0, default: 0 },
    max_score: { type: Number, min: 0, default: 0 },
    shuffle_questions: { type: Boolean, default: false },
    shuffle_options: { type: Boolean, default: false },
    allow_view_result_immediately: { type: Boolean, default: true },
    questions: { type: [ExamQuestionSchema], default: [] },
  },
  { timestamps: true }
);

ExamSchema.pre("validate", async function () {
  this.total_questions = this.questions.length;
  this.max_score = this.questions.reduce(
    (total, question) => total + question.question_score,
    0
  );

  const questionsToSnapshot = this.isNew
    ? this.questions
    : this.questions.filter((question) => !question.question_snapshot);
  if (questionsToSnapshot.length === 0) {
    return;
  }

  const sourceQuestions = await Question.find({
    _id: { $in: questionsToSnapshot.map((question) => question.question_id) },
  }).select("content difficulty_level explanation options");
  const sourceQuestionsById = new Map(
    sourceQuestions.map((question) => [question._id.toString(), question])
  );

  for (const examQuestion of questionsToSnapshot) {
    const sourceQuestion = sourceQuestionsById.get(
      examQuestion.question_id.toString()
    );
    if (!sourceQuestion) {
      this.invalidate(
        "questions",
        `Question ${examQuestion.question_id} does not exist`
      );
      continue;
    }

    examQuestion.question_snapshot = {
      content: sourceQuestion.content,
      difficulty_level: sourceQuestion.difficulty_level,
      explanation: sourceQuestion.explanation,
      options: sourceQuestion.options.map((option: QuestionOptionSource) => ({
        option_id: option._id,
        option_label: option.option_label,
        content: option.content,
        is_correct: option.is_correct,
      })),
    };
  }
});

export const Exam = models.Exam || mongoose.model("Exam", ExamSchema);