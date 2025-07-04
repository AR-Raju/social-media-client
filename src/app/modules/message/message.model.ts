import { Schema, model, models } from "mongoose"
import type { TMessage } from "./message.interface"

const messageSchema = new Schema<TMessage>(
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
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ["text", "image"],
      default: "text",
    },
    image: {
      type: String,
      trim: true,
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
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

// Indexes for better query performance
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 })
messageSchema.index({ receiver: 1, isRead: 1 })

// Pre-save middleware
messageSchema.pre("save", function (next) {
  if (this.isModified("isRead") && this.isRead && !this.readAt) {
    this.readAt = new Date()
  }
  if (this.isModified("content") && !this.isNew) {
    this.isEdited = true
    this.editedAt = new Date()
  }
  next()
})

// Static methods
messageSchema.statics.findConversation = function (user1Id: string, user2Id: string, limit = 50) {
  return this.find({
    $or: [
      { sender: user1Id, receiver: user2Id },
      { sender: user2Id, receiver: user1Id },
    ],
  })
    .populate("sender", "name avatar")
    .populate("receiver", "name avatar")
    .populate("replyTo")
    .sort({ createdAt: -1 })
    .limit(limit)
}

messageSchema.statics.markAsRead = function (senderId: string, receiverId: string) {
  return this.updateMany(
    { sender: senderId, receiver: receiverId, isRead: false },
    { isRead: true, readAt: new Date() },
  )
}

// Use models check to prevent OverwriteModelError
const Message = models.Message || model<TMessage>("Message", messageSchema)

export default Message
