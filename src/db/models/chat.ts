import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ["user", "assistant", "system"],
    },
    content: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const ChatSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    model: {
      type: String,
      default: "openrouter/auto",
    },
    messages: [MessageSchema],
  },
  {
    timestamps: true,
  }
);

export const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
