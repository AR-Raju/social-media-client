import { Schema, model, models } from "mongoose"
import type { TFriendRequest } from "./friend.interface"

const friendRequestSchema = new Schema<TFriendRequest>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v
        return ret
      },
    },
    toObject: {
      virtuals: true,
    },
  },
)

// Compound index to prevent duplicate requests
friendRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true })
friendRequestSchema.index({ receiver: 1, status: 1 })
friendRequestSchema.index({ sender: 1, status: 1 })

// Pre-save middleware
friendRequestSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status !== "pending") {
    this.respondedAt = new Date()
  }
  next()
})

// Static methods
friendRequestSchema.statics.findPendingRequests = function (userId: string) {
  return this.find({ receiver: userId, status: "pending" })
    .populate("sender", "name avatar email")
    .sort({ createdAt: -1 })
}

friendRequestSchema.statics.findSentRequests = function (userId: string) {
  return this.find({ sender: userId, status: "pending" })
    .populate("receiver", "name avatar email")
    .sort({ createdAt: -1 })
}

// Use models check to prevent OverwriteModelError
const FriendRequest = models.FriendRequest || model<TFriendRequest>("FriendRequest", friendRequestSchema)

export default FriendRequest
