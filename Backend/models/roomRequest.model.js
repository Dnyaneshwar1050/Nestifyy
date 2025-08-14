import mongoose, { Schema } from "mongoose";

const roomRequestSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    budget: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const RoomRequest = mongoose.model("RoomRequest", roomRequestSchema);