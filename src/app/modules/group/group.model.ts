import { Schema, model, models } from "mongoose"
import type { TGroup } from "./group.interface"

const groupSchema = new Schema<TGroup>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ["group", "page"],
      default: "group",
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    privacy: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    avatar: {
      type: String,
      trim: true,
    },
    coverPhoto: {
      type: String,
      trim: true,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    moderators: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    members: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        role: {
          type: String,
          enum: ["member", "moderator", "admin"],
          default: "member",
        },
      },
    ],
    pendingRequests: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        requestedAt: {
          type: Date,
          default: Date.now,
        },
        message: {
          type: String,
          trim: true,
        },
      },
    ],
    rules: [
      {
        type: String,
        trim: true,
      },
    ],
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
    website: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
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

// Virtual for members count
groupSchema.virtual("membersCount").get(function () {
  return this.members ? this.members.length : 0
})

// Virtual for pending requests count
groupSchema.virtual("pendingRequestsCount").get(function () {
  return this.pendingRequests ? this.pendingRequests.length : 0
})

// Indexes
groupSchema.index({ name: "text", description: "text" })
groupSchema.index({ category: 1, privacy: 1 })
groupSchema.index({ admin: 1 })
groupSchema.index({ "members.user": 1 })
groupSchema.index({ tags: 1 })

// Instance methods
groupSchema.methods.isMember = function (userId: string): boolean {
  return this.members.some((member: any) => member.user.toString() === userId)
}

groupSchema.methods.isAdmin = function (userId: string): boolean {
  return this.admin.toString() === userId
}

groupSchema.methods.isModerator = function (userId: string): boolean {
  return this.moderators.some((modId: any) => modId.toString() === userId)
}

groupSchema.methods.canManage = function (userId: string): boolean {
  return this.isAdmin(userId) || this.isModerator(userId)
}

// Static methods
groupSchema.statics.findPublicGroups = function (category?: string) {
  const query: any = { privacy: "public", isActive: true }
  if (category) {
    query.category = category
  }
  return this.find(query).populate("admin", "name avatar").sort({ membersCount: -1, createdAt: -1 })
}

groupSchema.statics.searchGroups = function (searchTerm: string, limit = 10) {
  return this.find({
    $text: { $search: searchTerm },
    privacy: "public",
    isActive: true,
  })
    .populate("admin", "name avatar")
    .limit(limit)
}

// Use models check to prevent OverwriteModelError
const Group = models.Group || model<TGroup>("Group", groupSchema)

export default Group
