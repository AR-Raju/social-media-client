import { Schema, model, models, Types } from "mongoose"
import type { TReaction } from "./reaction.interface"

const reactionSchema = new Schema<TReaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      enum: ["post", "comment"],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "targetType",
    },
    type: {
      type: String,
      enum: ["like", "love", "haha", "wow", "sad", "angry"],
      required: true,
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

// Compound index to ensure one reaction per user per target
reactionSchema.index({ user: 1, targetId: 1, targetType: 1 }, { unique: true })
reactionSchema.index({ targetId: 1, targetType: 1, type: 1 })

// Static methods
reactionSchema.statics.getReactionSummary = function (targetId: string, targetType: string) {
  return this.aggregate([
    { $match: { targetId: new Types.ObjectId(targetId), targetType } },
    { $group: { _id: "$type", count: { $sum: 1 } } },
    {
      $group: {
        _id: null,
        reactions: {
          $push: {
            type: "$_id",
            count: "$count",
          },
        },
        total: { $sum: "$count" },
      },
    },
  ])
}

reactionSchema.statics.getUserReaction = function (userId: string, targetId: string, targetType: string) {
  return this.findOne({ user: userId, targetId, targetType })
}

// Use models check to prevent OverwriteModelError
const Reaction = models.Reaction || model<TReaction>("Reaction", reactionSchema)

export default Reaction
