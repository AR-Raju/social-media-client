"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { postsApi } from "@/services/api";
import type { Post } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  Angry,
  Edit,
  Flag,
  Frown,
  Heart,
  Laugh,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Share2,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { PostComments } from "./post-comments";
import { SharePostDialog } from "./share-post-dialog";

interface PostCardProps {
  post: Post;
}

const reactionIcons = {
  like: ThumbsUp,
  love: Heart,
  haha: Laugh,
  wow: "😮",
  sad: Frown,
  angry: Angry,
};

const reactionColors = {
  like: "text-blue-500",
  love: "text-red-500",
  haha: "text-yellow-500",
  wow: "text-orange-500",
  sad: "text-gray-500",
  angry: "text-red-600",
};

export function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const reactMutation = useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: string }) =>
      postsApi.reactToPost(postId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: postsApi.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully.",
      });
    },
  });

  const handleReaction = (type: string) => {
    if (post.userReaction === type) {
      // Remove reaction if same type clicked
      reactMutation.mutate({ postId: post._id, type: "none" });
    } else {
      reactMutation.mutate({ postId: post._id, type });
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate(post._id);
    }
  };

  const isOwner = user?._id === post.author._id;
  const totalReactions = Object.values(post.reactions).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <Card className="fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={post.author.avatar || "/placeholder.svg"}
                alt={post.author.name}
              />
              <AvatarFallback>
                {post.author.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{post.author.name}</p>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                {post.location && (
                  <>
                    <span>•</span>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {post.location}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner ? (
                <>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit post
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete post
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem>
                  <Flag className="mr-2 h-4 w-4" />
                  Report post
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Post Content */}
        <div className="space-y-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div
            className={`grid gap-2 ${
              post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
            }`}
          >
            {post.images.map((image, index) => (
              <img
                key={index}
                src={image || "/placeholder.svg"}
                alt={`Post image ${index + 1}`}
                className="w-full rounded-lg object-cover max-h-96"
              />
            ))}
          </div>
        )}

        {/* Shared Post */}
        {post.sharedPost && (
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={post.sharedPost.author.avatar || "/placeholder.svg"}
                    alt={post.sharedPost.author?.name}
                  />
                  <AvatarFallback>
                    {post.sharedPost.author?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {post.sharedPost.author?.name}
                </span>
              </div>
              <p className="text-sm">{post.sharedPost.content}</p>
            </CardContent>
          </Card>
        )}

        {/* Reaction Summary */}
        {totalReactions > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground border-b pb-2">
            <div className="flex items-center space-x-1">
              <div className="flex -space-x-1">
                {Object.entries(post.reactions)
                  .filter(([_, count]) => count > 0)
                  .slice(0, 3)
                  .map(([type]) => {
                    const Icon =
                      reactionIcons[type as keyof typeof reactionIcons];
                    return (
                      <div
                        key={type}
                        className={`w-5 h-5 rounded-full bg-background border flex items-center justify-center ${
                          reactionColors[type as keyof typeof reactionColors]
                        }`}
                      >
                        {typeof Icon === "string" ? (
                          <span className="text-xs">{Icon}</span>
                        ) : (
                          <Icon className="h-3 w-3" />
                        )}
                      </div>
                    );
                  })}
              </div>
              <span>{totalReactions}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>{post.commentsCount} comments</span>
              <span>{post.sharesCount} shares</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-1">
            {Object.entries(reactionIcons).map(([type, Icon]) => (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                className={`${
                  post.userReaction === type
                    ? reactionColors[type as keyof typeof reactionColors]
                    : "text-muted-foreground"
                }`}
                onClick={() => handleReaction(type)}
              >
                {typeof Icon === "string" ? (
                  <span className="mr-1">{Icon}</span>
                ) : (
                  <Icon className="mr-1 h-4 w-4" />
                )}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Comment
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShareDialog(true)}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Comments */}
        {showComments && <PostComments postId={post._id} />}
      </CardContent>

      <SharePostDialog
        post={post}
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
      />
    </Card>
  );
}
