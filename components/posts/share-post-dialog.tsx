"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { postsApi } from "@/services/api"
import { Loader2 } from "lucide-react"
import type { Post } from "@/types"

const shareSchema = z.object({
  content: z.string().max(500, "Share message is too long").optional(),
})

type ShareFormData = z.infer<typeof shareSchema>

interface SharePostDialogProps {
  post: Post
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SharePostDialog({ post, open, onOpenChange }: SharePostDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<ShareFormData>({
    resolver: zodResolver(shareSchema),
    defaultValues: { content: "" },
  })

  const sharePostMutation = useMutation({
    mutationFn: (content?: string) => postsApi.sharePost(post._id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      toast({
        title: "Post shared successfully!",
        description: "The post has been shared to your timeline.",
      })
      onOpenChange(false)
      form.reset()
    },
    onError: (error: any) => {
      toast({
        title: "Failed to share post",
        description: error.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: ShareFormData) => {
    sharePostMutation.mutate(data.content)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
          <DialogDescription>Add your thoughts about this post (optional)</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Say something about this post..."
                          className="min-h-[80px] resize-none"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Original Post Preview */}
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                    <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{post.author.name}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>
                {post.images && post.images.length > 0 && (
                  <div className="mt-2">
                    <img
                      src={post.images[0] || "/placeholder.svg"}
                      alt="Post preview"
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={sharePostMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={sharePostMutation.isPending}>
                {sharePostMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Share
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
