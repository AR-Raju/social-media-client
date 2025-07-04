"use client"

import { PostCard } from "@/components/posts/post-card"
import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"
import type { Post } from "@/types"

interface ProfilePostsProps {
  userId: string
  posts: Post[]
}

export function ProfilePosts({ userId, posts }: ProfilePostsProps) {
  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
          <p className="text-muted-foreground text-center">This user hasn't shared any posts yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  )
}
