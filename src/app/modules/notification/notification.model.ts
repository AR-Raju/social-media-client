import { Schema, model, models } from "mongoose"
import type { TNotification } from "./notification.interface"

const notificationSchema = new Schema<TNotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "comment", "friend_request", "friend_accept", "message", "group_invite", "post_share"],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    relatedPost: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
    relatedComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    relatedGroup: {
      type: Schema.Types.ObjectId,
      ref: "Group",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
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

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 })
notificationSchema.index({ sender: 1 })
notificationSchema.index({ type: 1 })

// Pre-save middleware
notificationSchema.pre("save", function (next) {
  if (this.isModified("isRead") && this.isRead && !this.readAt) {
    this.readAt = new Date()
  }
  next()
})

// Static methods
notificationSchema.statics.findUnread = function (userId: string) {
  return this.find({ recipient: userId, isRead: false })
    .populate("sender", "name avatar")
    .populate("relatedPost", "content")
    .populate("relatedGroup", "name")
    .sort({ createdAt: -1 })
}

notificationSchema.statics.markAllAsRead = function (userId: string) {
  return this.updateMany({ recipient: userId, isRead: false }, { isRead: true, readAt: new Date() })
}

// Use models check to prevent OverwriteModelError
const Notification = models.Notification || model<TNotification>("Notification", notificationSchema)

export default Notification
