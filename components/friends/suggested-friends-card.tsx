"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { friendsApi } from "@/services/api";
import type { User } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Users, X } from "lucide-react";

export function SuggestedFriendsCard() {
  const queryClient = useQueryClient();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ["friend-suggestions"],
    queryFn: () => friendsApi.getFriendSuggestions(5),
  });

  const sendRequestMutation = useMutation({
    mutationFn: friendsApi.sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friend-suggestions"] });
      toast({
        title: "Friend Request Sent",
        description: "Your friend request has been sent successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send friend request. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Suggested Friends
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const suggestedFriends = suggestions?.data?.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Suggested Friends
        </CardTitle>
        <CardDescription>People you might know</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestedFriends.length > 0 ? (
          suggestedFriends.slice(0, 5).map((friend: User) => (
            <div
              key={friend._id}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={friend.avatar || "/placeholder.svg"}
                  alt={friend.name}
                />
                <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-1">
                  {friend.name}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {friend.bio || "No bio available"}
                </p>
                {friend.mutualFriends && friend.mutualFriends > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {friend.mutualFriends} mutual friends
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 p-0 bg-transparent"
                  onClick={() => sendRequestMutation.mutate(friend._id)}
                  disabled={sendRequestMutation.isPending}
                >
                  <UserPlus className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No friend suggestions available
            </p>
          </div>
        )}

        {suggestedFriends.length > 0 && (
          <div className="pt-2 border-t">
            <Button variant="ghost" className="w-full text-sm">
              See All Suggestions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
