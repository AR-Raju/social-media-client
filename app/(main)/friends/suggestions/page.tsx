"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { friendsApi } from "@/services/api";
import type { User } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Briefcase, MapPin, Search, UserPlus, Users, X } from "lucide-react";
import { useState } from "react";

export default function SuggestedFriendsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ["friend-suggestions", searchTerm],
    queryFn: () => friendsApi.getFriendSuggestions(50),
  });

  const sendRequestMutation = useMutation({
    mutationFn: (userId: string) => friendsApi.sendFriendRequest(userId),
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

  const suggestedFriends = suggestions?.data?.data || [];
  const filteredSuggestions = suggestedFriends.filter(
    (friend: User) =>
      friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.bio?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Suggested Friends</h1>
          <p className="text-muted-foreground">People you might know</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {filteredSuggestions.length} suggestions
        </Badge>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search suggested friends..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Suggestions Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 w-9" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredSuggestions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuggestions.map((friend: User) => (
            <Card
              key={friend._id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={friend.avatar || "/placeholder.svg"}
                      alt={friend.name}
                    />
                    <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold line-clamp-1">
                      {friend.name}
                    </h3>
                    {friend.mutualFriends && friend.mutualFriends > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {friend.mutualFriends} mutual friends
                      </p>
                    )}
                  </div>
                </div>

                {/* User Info */}
                <div className="space-y-2 mb-4">
                  {friend.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {friend.bio}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {friend.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{friend.location}</span>
                      </div>
                    )}
                    {friend.work && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        <span>{friend.work}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mutual Friends Preview */}
                {friend.mutualFriends && friend.mutualFriends > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Mutual Friends
                      </span>
                    </div>
                    <div className="flex -space-x-2">
                      {/* Mock mutual friends avatars */}
                      {Array.from({
                        length: Math.min(3, friend.mutualFriends),
                      }).map((_, i) => (
                        <Avatar
                          key={i}
                          className="h-6 w-6 border-2 border-background"
                        >
                          <AvatarImage src={`/placeholder.svg?${i}`} />
                          <AvatarFallback className="text-xs">U</AvatarFallback>
                        </Avatar>
                      ))}
                      {friend.mutualFriends > 3 && (
                        <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                          <span className="text-xs font-medium">
                            +{friend.mutualFriends - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => sendRequestMutation.mutate(friend._id)}
                    disabled={sendRequestMutation.isPending}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {sendRequestMutation.isPending
                      ? "Sending..."
                      : "Add Friend"}
                  </Button>
                  <Button variant="outline" size="icon">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "No matching suggestions" : "No friend suggestions"}
            </h3>
            <p className="text-muted-foreground text-center">
              {searchTerm
                ? "Try adjusting your search terms to find more people."
                : "We don't have any friend suggestions for you right now. Check back later!"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Load More */}
      {filteredSuggestions.length > 0 && (
        <div className="flex justify-center pt-6">
          <Button variant="outline">Load More Suggestions</Button>
        </div>
      )}
    </div>
  );
}
