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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
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

const reactionConfig = {
  like: {
    icon: ThumbsUp,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    label: "Like",
  },
  love: {
    icon: Heart,
    color: "text-red-500",
    bgColor: "bg-red-50",
    label: "Love",
  },
  haha: {
    icon: Laugh,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
    label: "Haha",
  },
  wow: {
    icon: "😮",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    label: "Wow",
  },
  sad: {
    icon: Frown,
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    label: "Sad",
  },
  angry: {
    icon: Angry,
    color: "text-red-600",
    bgColor: "bg-red-50",
    label: "Angry",
  },
};

export function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  console.log("Post Card Rendered:", post);
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
    (sum, reactionArray) => sum + reactionArray.length,
    0
  );

  const userReactionConfig = post.userReaction
    ? reactionConfig[post.userReaction as keyof typeof reactionConfig]
    : null;

  console.log("userReactionConfig:", userReactionConfig);

  return (
    <Card className="fade-in w-full max-w-2xl mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage
                src={post.author.avatar || "/placeholder.svg"}
                alt={post.author.name}
              />
              <AvatarFallback>
                {post.author.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">{post.author.name}</p>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                {post.location && (
                  <>
                    <span>•</span>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate">{post.location}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
              >
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
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
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
                  .filter(([_, count]) => count.length > 0)
                  .slice(0, 3)
                  .map(([type]) => {
                    const config =
                      reactionConfig[type as keyof typeof reactionConfig];
                    return (
                      <div
                        key={type}
                        className={`w-5 h-5 rounded-full bg-background border flex items-center justify-center ${config.color}`}
                      >
                        {typeof config.icon === "string" ? (
                          <span className="text-xs">{config.icon}</span>
                        ) : (
                          <config.icon className="h-3 w-3" />
                        )}
                      </div>
                    );
                  })}
              </div>
              <span>{totalReactions}</span>
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <span>{post.commentsCount} comments</span>
              <span>{post.sharesCount} shares</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t">
          {/* Reaction Button with Hover */}
          <HoverCard openDelay={300} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`flex-1 ${
                  userReactionConfig
                    ? `${userReactionConfig.color} ${userReactionConfig.bgColor}`
                    : "text-muted-foreground"
                }`}
                onClick={() => handleReaction(post.userReaction || "like")}
              >
                {userReactionConfig ? (
                  <>
                    {typeof userReactionConfig.icon === "string" ? (
                      <span className="mr-2">{userReactionConfig.icon}</span>
                    ) : (
                      <userReactionConfig.icon className="mr-2 h-4 w-4" />
                    )}
                    {userReactionConfig.label}
                  </>
                ) : (
                  <>
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Like
                  </>
                )}
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-auto p-2" side="top">
              <div className="flex space-x-1">
                {Object.entries(reactionConfig).map(([type, config]) => (
                  <Button
                    key={type}
                    variant="ghost"
                    size="sm"
                    className={`h-10 w-10 p-0 hover:scale-125 transition-transform ${config.bgColor}`}
                    onClick={() => handleReaction(type)}
                    title={config.label}
                  >
                    {typeof config.icon === "string" ? (
                      <span className="text-lg">{config.icon}</span>
                    ) : (
                      <config.icon className={`h-5 w-5 ${config.color}`} />
                    )}
                  </Button>
                ))}
              </div>
            </HoverCardContent>
          </HoverCard>

          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-muted-foreground"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Comment
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-muted-foreground"
            onClick={() => setShowShareDialog(true)}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
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
