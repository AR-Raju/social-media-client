"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { postsApi } from "@/services/api"
import { PostCard } from "./post-card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { useInView } from "react-intersection-observer"

export function PostFeed() {
  const { ref, inView } = useInView()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useInfiniteQuery({
    queryKey: ["posts", "feed"],
    queryFn: ({ pageParam = 1 }) => postsApi.getFeedPosts(10, pageParam),
    getNextPageParam: (lastPage, pages) => {
      const pagination = lastPage.data.pagination
      return pagination && pagination.page < pagination.pages ? pagination.page + 1 : undefined
    },
    initialPageParam: 1,
  })

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, fetchNextPage, hasNextPage])

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load posts. Please try again.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  const posts = data?.pages.flatMap((page) => page.data.data) || []

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No posts to show. Start following people to see their posts!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post: any) => (
        <PostCard key={post._id} post={post} />
      ))}

      <div ref={ref} className="flex justify-center py-4">
        {isFetchingNextPage && <Loader2 className="h-6 w-6 animate-spin" />}
      </div>

      {!hasNextPage && posts.length > 0 && (
        <div className="text-center py-4">
          <p className="text-muted-foreground">You've reached the end!</p>
        </div>
      )}
    </div>
  )
}
