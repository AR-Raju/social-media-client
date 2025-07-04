"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { commentsApi } from "@/services/api"
import { formatDistanceToNow } from "date-fns"
import { Heart, Send, Loader2 } from "lucide-react"
import type { Comment } from "@/types"

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment is too long"),
})

type CommentFormData = z.infer<typeof commentSchema>

interface PostCommentsProps {
  postId: string
}

export function PostComments({ postId }: PostCommentsProps) {
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({})
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "" },
  })

  const { data: commentsData, isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => commentsApi.getPostComments(postId, 20, 1),
  })

  const addCommentMutation = useMutation({
    mutationFn: (data: { content: string; parentComment?: string }) => commentsApi.addComment(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] })
      form.reset()
      setReplyingTo(null)
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add comment",
        description: error.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      })
    },
  })

  const reactToCommentMutation = useMutation({
    mutationFn: ({ commentId, type }: { commentId: string; type: string }) =>
      commentsApi.reactToComment(commentId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] })
    },
  })

  const onSubmit = (data: CommentFormData) => {
    addCommentMutation.mutate({
      content: data.content,
      parentComment: replyingTo || undefined,
    })
  }

  const handleReaction = (commentId: string, currentReaction?: string) => {
    const type = currentReaction === "like" ? "none" : "like"
    reactToCommentMutation.mutate({ commentId, type })
  }

  const toggleReplies = (commentId: string) => {
    setShowReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  const comments = commentsData?.data?.data || []

  return (
    <div className="space-y-4 border-t pt-4">
      {/* Add Comment Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
            <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 flex space-x-2">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Textarea
                      placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
                      className="min-h-[40px] resize-none"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" size="sm" disabled={addCommentMutation.isPending || !form.watch("content").trim()}>
              {addCommentMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </Form>

      {replyingTo && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Replying to comment</span>
          <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
            Cancel
          </Button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment: Comment) => (
          <div key={comment._id} className="space-y-2">
            <div className="flex space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.name} />
                <AvatarFallback>{comment.author.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-sm">{comment.author.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt))} ago
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-auto p-0 ${comment.userReaction === "like" ? "text-blue-500" : ""}`}
                    onClick={() => handleReaction(comment._id, comment.userReaction)}
                  >
                    <Heart className="h-3 w-3 mr-1" />
                    {comment.reactions.like > 0 && comment.reactions.like}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-auto p-0" onClick={() => setReplyingTo(comment._id)}>
                    Reply
                  </Button>
                  {comment.repliesCount > 0 && (
                    <Button variant="ghost" size="sm" className="h-auto p-0" onClick={() => toggleReplies(comment._id)}>
                      {showReplies[comment._id] ? "Hide" : "View"} {comment.repliesCount} replies
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Replies */}
            {showReplies[comment._id] && comment.replies && (
              <div className="ml-11 space-y-2">
                {comment.replies.map((reply: Comment) => (
                  <div key={reply._id} className="flex space-x-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={reply.author.avatar || "/placeholder.svg"} alt={reply.author.name} />
                      <AvatarFallback>{reply.author.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-2">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-xs">{reply.author.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(reply.createdAt))} ago
                          </span>
                        </div>
                        <p className="text-xs">{reply.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
