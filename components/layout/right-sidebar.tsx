"use client";

import { UpcomingEventsCard } from "@/components/events/upcoming-events-card";
import { SuggestedFriendsCard } from "@/components/friends/suggested-friends-card";
import { TrendingTopicsCard } from "@/components/trending/tranding-topics-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSocket } from "@/context/socket-context";
import { eventsApi, groupsApi, notificationsApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Bell, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

export function RightSidebar() {
  const { onlineUsers } = useSocket();

  const { data: recentNotifications } = useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: () => notificationsApi.getNotifications(5, 1, false),
  });

  const { data: trendingGroups } = useQuery({
    queryKey: ["groups", "trending"],
    queryFn: () => groupsApi.getAllGroups(5, undefined, "public"),
  });

  const { data: upcomingEvents } = useQuery({
    queryKey: ["groups", "trending"],
    queryFn: () => eventsApi.getEvents(1, 4),
  });

  return (
    <aside className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 xl:w-96 border-l bg-background overflow-y-auto custom-scrollbar hidden lg:block">
      <div className="p-4 space-y-6">
        {/* Online Friends */}
        {onlineUsers.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Online Now ({onlineUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {onlineUsers.slice(0, 5).map((userId) => (
                <div key={userId} className="flex items-center space-x-2">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                  </div>
                  <span className="text-sm">Online User</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="mr-2 h-4 w-4" />
                Recent Activity
              </div>
              <Link href="/notifications">
                <Button variant="ghost" size="sm">
                  See all
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentNotifications?.data?.data?.length > 0 ? (
              recentNotifications?.data.data.map((notification: any) => (
                <div
                  key={notification._id}
                  className="flex items-start space-x-2 p-2 rounded-lg hover:bg-muted/50"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={notification.sender?.avatar || "/placeholder.svg"}
                      alt={notification.sender?.name}
                    />
                    <AvatarFallback>
                      {notification.sender?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent notifications
              </p>
            )}
          </CardContent>
        </Card>

        {/* Trending Groups */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                Trending Groups
              </div>
              <Link href="/groups">
                <Button variant="ghost" size="sm">
                  Explore
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trendingGroups?.data?.data?.length > 0 ? (
              trendingGroups?.data?.data.map((group: any) => (
                <div
                  key={group._id}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={group.avatar || "/placeholder.svg"}
                      alt={group.name}
                    />
                    <AvatarFallback>
                      {group.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{group.name}</p>
                    <div className="flex items-center space-x-2">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {group.membersCount} members
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {group.category}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No trending groups
              </p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <UpcomingEventsCard />

        <Separator />

        {/* Suggested Friends */}
        <SuggestedFriendsCard />

        <Separator />

        {/* Trending Topics */}
        <TrendingTopicsCard />
      </div>
    </aside>
  );
}
