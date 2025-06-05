import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
    chats: [{
      type: Schema.Types.ObjectId,
      ref: "Chat"
    }]
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
