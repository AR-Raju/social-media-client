import { Schema, model, models } from "mongoose"
import type { TUser } from "./user.interface"
import bcrypt from "bcryptjs"

const userSchema = new Schema<TUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId && !this.facebookId
      },
      minlength: 6,
    },
    avatar: {
      type: String,
      trim: true,
    },
    coverPhoto: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    location: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    work: {
      type: String,
      trim: true,
    },
    education: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    blockedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    privacy: {
      profileVisibility: {
        type: String,
        enum: ["public", "friends", "private"],
        default: "public",
      },
      friendListVisibility: {
        type: String,
        enum: ["public", "friends", "private"],
        default: "friends",
      },
      postVisibility: {
        type: String,
        enum: ["public", "friends", "private"],
        default: "friends",
      },
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    facebookId: {
      type: String,
      sparse: true,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password
        delete ret.refreshToken
        delete ret.__v
        return ret
      },
    },
    toObject: {
      virtuals: true,
    },
  },
)

// Virtual for friends count
userSchema.virtual("friendsCount").get(function () {
  return this.friends ? this.friends.length : 0
})

// Virtual for full name (if you want to split name later)
userSchema.virtual("displayName").get(function () {
  return this.name
})

// Indexes
userSchema.index({ email: 1 })
userSchema.index({ name: "text", bio: "text" })
userSchema.index({ isOnline: 1 })
userSchema.index({ friends: 1 })

// Pre-save middleware for password hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  if (this.password) {
    this.password = await bcrypt.hash(this.password, 12)
  }
  next()
})

// Instance methods
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.isFriend = function (userId: string): boolean {
  return this.friends.includes(userId)
}

userSchema.methods.isBlocked = function (userId: string): boolean {
  return this.blockedUsers.includes(userId)
}

// Static methods
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() })
}

userSchema.statics.searchUsers = function (searchTerm: string, limit = 10) {
  return this.find({
    $text: { $search: searchTerm },
    isActive: true,
  })
    .select("name email avatar bio location")
    .limit(limit)
}

// Use models check to prevent OverwriteModelError
const User = models.User || model<TUser>("User", userSchema)

export default User
