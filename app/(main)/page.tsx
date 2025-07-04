"use client"

import { CreatePost } from "@/components/posts/create-post"
import { PostFeed } from "@/components/posts/post-feed"

export default function HomePage() {
  return (
    <div className="space-y-6">
      <CreatePost />
      <PostFeed />
    </div>
  )
}
