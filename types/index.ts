export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  work?: string;
  education?: string;
  coverPhoto?: string;
  isOnline?: boolean;
  lastSeen?: string;
  friendsCount?: number;
  postsCount?: number;
  privacy?: {
    profileVisibility: "public" | "friends" | "private";
    friendListVisibility: "public" | "friends" | "private";
    postVisibility: "public" | "friends" | "private";
  };
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  author: User;
  content: string;
  images?: string[];
  type: "text" | "image" | "shared";
  visibility: "public" | "friends" | "private";
  tags?: string[];
  location?: string;
  sharedPost?: Post;
  reactions: {
    like: string[];
    love: string[];
    haha: string[];
    wow: string[];
    sad: string[];
    angry: string[];
  };
  userReaction?: string;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  author: User;
  post: string;
  content: string;
  image?: string;
  parentComment?: string;
  replies?: Comment[];
  reactions: {
    like: number;
    love: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
  };
  userReaction?: string;
  repliesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FriendRequest {
  _id: string;
  sender: User;
  receiver: User;
  message?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  sender: User;
  receiver: User;
  content: string;
  type: "text" | "image";
  image?: string;
  replyTo?: Message;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  lastMessage: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface Group {
  _id: string;
  name: string;
  description: string;
  type: "group" | "page";
  category: string;
  privacy: "public" | "private";
  avatar?: string;
  coverPhoto?: string;
  admin: User;
  moderators: User[];
  members: User[];
  rules?: string[];
  tags?: string[];
  location?: string;
  website?: string;
  membersCount: number;
  postsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  recipient: User;
  sender: User;
  type:
    | "like"
    | "comment"
    | "friend_request"
    | "friend_accept"
    | "message"
    | "group_invite"
    | "post_share";
  message: string;
  relatedPost?: Post;
  relatedComment?: Comment;
  relatedGroup?: Group;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
