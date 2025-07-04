import { Schema, model, models } from "mongoose"
import type { TPost } from "./post.interface"

const postSchema = new Schema<TPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    type: {
      type: String,
      enum: ["text", "image", "shared"],
      default: "text",
    },
    visibility: {
      type: String,
      enum: ["public", "friends", "private"],
      default: "public",
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    location: {
      type: String,
      trim: true,
    },
    sharedPost: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
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
    commentsCount: {
      type: Number,
      default: 0,
    },
    sharesCount: {
      type: Number,
      default: 0,
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

// Virtual for total reactions count
postSchema.virtual("totalReactions").get(function () {
  const reactions = this.reactions
  return reactions.like + reactions.love + reactions.haha + reactions.wow + reactions.sad + reactions.angry
})

// Indexes for better query performance
postSchema.index({ author: 1, createdAt: -1 })
postSchema.index({ visibility: 1, createdAt: -1 })
postSchema.index({ tags: 1 })
postSchema.index({ "reactedUsers.user": 1 })

// Pre-save middleware
postSchema.pre("save", function (next) {
  if (this.isModified("content") && !this.isNew) {
    this.isEdited = true
    this.editedAt = new Date()
  }
  next()
})

// Static methods
postSchema.statics.findPublicPosts = function () {
  return this.find({ visibility: "public" })
    .populate("author", "name avatar")
    .populate("sharedPost")
    .sort({ createdAt: -1 })
}

postSchema.statics.findUserPosts = function (userId: string) {
  return this.find({ author: userId }).populate("author", "name avatar").populate("sharedPost").sort({ createdAt: -1 })
}

// Use models check to prevent OverwriteModelError
const Post = models.Post || model<TPost>("Post", postSchema)

export default Post
