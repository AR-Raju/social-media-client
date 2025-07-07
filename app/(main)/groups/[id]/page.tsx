"use client";

import { CreatePost } from "@/components/posts/create-post";
import { PostCard } from "@/components/posts/post-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { groupsApi } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Crown,
  ExternalLink,
  Globe,
  Lock,
  MapPin,
  MoreHorizontal,
  Settings,
  Share2,
  Shield,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function GroupDetailsPage() {
  const params = useParams();
  const groupId = params.id as string;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("posts");

  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ["group", groupId],
    queryFn: () => groupsApi.getGroup(groupId),
  });

  const { data: groupPosts, isLoading: postsLoading } = useQuery({
    queryKey: ["group-posts", groupId],
    queryFn: () => groupsApi.getGroupPosts(groupId, 20),
    enabled: activeTab === "posts",
  });

  const joinGroupMutation = useMutation({
    mutationFn: () => groupsApi.joinGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      toast({
        title: "Joined Group",
        description: "You have successfully joined the group!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to join group",
        variant: "destructive",
      });
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: () => groupsApi.leaveGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      toast({
        title: "Left Group",
        description: "You have left the group.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to leave group",
        variant: "destructive",
      });
    },
  });

  if (groupLoading) {
    return <GroupDetailsSkeleton />;
  }

  const groupData = group?.data?.data;
  if (!groupData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold mb-2">Group Not Found</h2>
        <p className="text-muted-foreground">
          The group you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  const isMember = groupData.members?.some(
    (member: any) => member._id === "current-user-id"
  ); // Replace with actual user ID
  const isAdmin = groupData.admin?._id === "current-user-id"; // Replace with actual user ID

  return (
    <div className="space-y-6">
      {/* Cover Photo & Header */}
      <div className="relative">
        <div className="h-48 md:h-64 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg overflow-hidden">
          {groupData.coverPhoto && (
            <img
              src={groupData.coverPhoto || "/placeholder.svg"}
              alt={groupData.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="absolute -bottom-16 left-6">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background">
            <AvatarImage
              src={groupData.avatar || "/placeholder.svg"}
              alt={groupData.name}
            />
            <AvatarFallback className="text-2xl">
              {groupData.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Group Info */}
      <div className="pt-16 space-y-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold">
                {groupData.name}
              </h1>
              <Badge
                variant={
                  groupData.privacy === "public" ? "secondary" : "outline"
                }
              >
                {groupData.privacy === "public" ? (
                  <>
                    <Globe className="h-3 w-3 mr-1" /> Public
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3 mr-1" /> Private
                  </>
                )}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{groupData.membersCount} members</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Created {new Date(groupData.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {groupData.location && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{groupData.location}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isMember ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => leaveGroupMutation.mutate()}
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  Leave Group
                </Button>
                {isAdmin && (
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                )}
              </>
            ) : (
              <Button onClick={() => joinGroupMutation.mutate()}>
                <UserPlus className="h-4 w-4 mr-2" />
                Join Group
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Group
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <p className="text-muted-foreground max-w-3xl">
          {groupData.description}
        </p>

        {groupData.tags && groupData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {groupData.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          {isMember && <CreatePost />}

          {postsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-muted rounded-full" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted rounded w-1/4" />
                          <div className="h-3 bg-muted rounded w-1/6" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded" />
                        <div className="h-4 bg-muted rounded w-3/4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {groupPosts?.data?.data?.map((post: any) => (
                <PostCard key={post._id} post={post} />
              )) || (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                    <p className="text-muted-foreground text-center">
                      Be the first to share something with this group!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Admin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage
                    src={groupData.admin?.avatar || "/placeholder.svg"}
                  />
                  <AvatarFallback>
                    {groupData.admin?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{groupData.admin?.name}</p>
                  <p className="text-sm text-muted-foreground">Group Admin</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {groupData.moderators && groupData.moderators.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Moderators
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {groupData.moderators.map((moderator: any) => (
                  <div
                    key={moderator._id}
                    className="flex items-center space-x-3"
                  >
                    <Avatar>
                      <AvatarImage
                        src={moderator.avatar || "/placeholder.svg"}
                      />
                      <AvatarFallback>
                        {moderator.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{moderator.name}</p>
                      <p className="text-sm text-muted-foreground">Moderator</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Members ({groupData.membersCount})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupData.members?.slice(0, 10).map((member: any) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={member.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{member.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Joined{" "}
                        {new Date(
                          member.joinedAt || groupData.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </div>
              ))}

              {groupData.membersCount > 10 && (
                <Button variant="outline" className="w-full bg-transparent">
                  View All Members
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About This Group</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground">{groupData.description}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Category</h4>
                  <Badge variant="outline">{groupData.category}</Badge>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Privacy</h4>
                  <Badge
                    variant={
                      groupData.privacy === "public" ? "secondary" : "outline"
                    }
                  >
                    {groupData.privacy === "public" ? "Public" : "Private"}
                  </Badge>
                </div>

                {groupData.location && (
                  <div>
                    <h4 className="font-medium mb-2">Location</h4>
                    <p className="text-muted-foreground">
                      {groupData.location}
                    </p>
                  </div>
                )}

                {groupData.website && (
                  <div>
                    <h4 className="font-medium mb-2">Website</h4>
                    <a
                      href={groupData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {groupData.website}
                    </a>
                  </div>
                )}
              </div>

              {groupData.rules && groupData.rules.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Group Rules</h4>
                    <ul className="space-y-2">
                      {groupData.rules.map((rule: string, index: number) => (
                        <li key={index} className="text-muted-foreground">
                          {index + 1}. {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GroupDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="relative">
        <Skeleton className="h-48 md:h-64 w-full rounded-lg" />
        <div className="absolute -bottom-16 left-6">
          <Skeleton className="h-24 w-24 md:h-32 md:w-32 rounded-full" />
        </div>
      </div>

      <div className="pt-16 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}
