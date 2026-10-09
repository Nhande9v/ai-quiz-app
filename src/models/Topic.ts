import mongoose, { models, Schema } from "mongoose";

const TopicSchema = new Schema(
  {
    subject_id: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    topic_name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

TopicSchema.index({ subject_id: 1, topic_name: 1 }, { unique: true });

export const Topic = models.Topic || mongoose.model("Topic", TopicSchema);
