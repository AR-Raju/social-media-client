import { Schema, model, models } from "mongoose"
import type { TComment } from "./comment.interface"

const commentSchema = new Schema<TComment>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    image: {
      type: String,
      trim: true,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    reactions: {
      like: { type: Number, default: 0 },
      love: { type: Number, default: 0 },
      haha: { type: Number, default: 0 },
      wow: { type: Number, default: 0 },
      sad: { type: Number, default: 0 },
      angry: { type: Number, default: 0 },
    },
    reactedUsers: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        reactionType: {
          type: String,
          enum: ["like", "love", "haha", "wow", "sad", "angry"],
        },
      },
    ],
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

// Virtual for replies count
commentSchema.virtual("repliesCount").get(function () {
  return this.replies ? this.replies.length : 0
})

// Virtual for total reactions count
commentSchema.virtual("totalReactions").get(function () {
  const reactions = this.reactions
  return reactions.like + reactions.love + reactions.haha + reactions.wow + reactions.sad + reactions.angry
})

// Index for better query performance
commentSchema.index({ post: 1, createdAt: -1 })
commentSchema.index({ author: 1 })
commentSchema.index({ parentComment: 1 })

// Pre-save middleware
commentSchema.pre("save", function (next) {
  if (this.isModified("content") && !this.isNew) {
    this.isEdited = true
    this.editedAt = new Date()
  }
  next()
})

// Static methods
commentSchema.statics.findByPost = function (postId: string) {
  return this.find({ post: postId, parentComment: null })
    .populate("author", "name avatar")
    .populate({
      path: "replies",
      populate: {
        path: "author",
        select: "name avatar",
      },
    })
    .sort({ createdAt: -1 })
}

commentSchema.statics.findReplies = function (commentId: string) {
  return this.find({ parentComment: commentId }).populate("author", "name avatar").sort({ createdAt: 1 })
}

// Use models check to prevent OverwriteModelError
const Comment = models.Comment || model<TComment>("Comment", commentSchema)

export default Comment
