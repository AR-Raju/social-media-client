"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { friendsApi, groupsApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import {
  Bookmark,
  Calendar,
  Home,
  MessageCircle,
  Settings,
  TrendingUp,
  Users,
  Users2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Friends", href: "/friends", icon: Users },
  { name: "Messages", href: "/messages", icon: MessageCircle },
  { name: "Groups", href: "/groups", icon: Users2 },
  { name: "Saved", href: "/saved", icon: Bookmark },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Trending", href: "/trending", icon: TrendingUp },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const { data: friendSuggestions } = useQuery({
    queryKey: ["friend-suggestions"],
    queryFn: () => friendsApi.getFriendSuggestions(5),
  });

  const { data: groupSuggestions } = useQuery({
    queryKey: ["group-suggestions"],
    queryFn: () => groupsApi.getGroupSuggestions(5),
  });

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r bg-background overflow-y-auto custom-scrollbar hidden lg:block">
      <div className="p-4 space-y-6">
        {/* User Profile */}
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={user?.avatar || "/placeholder.svg"}
              alt={user?.name}
            />
            <AvatarFallback>
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Friend Suggestions */}
        {friendSuggestions?.data?.data &&
          friendSuggestions.data.data.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                People you may know
              </h3>
              <div className="space-y-2">
                {friendSuggestions.data.data.slice(0, 3).map((friend: any) => (
                  <Link href={`/profile/${friend._id}`}>
                    <div
                      key={friend._id}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={friend.avatar || "/placeholder.svg"}
                          alt={friend.name}
                        />
                        <AvatarFallback>
                          {friend.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {friend.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {friend.mutualFriends} mutual friends
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href="/friends/suggestions">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                >
                  See all
                </Button>
              </Link>
            </div>
          )}

        {/* Group Suggestions */}
        {groupSuggestions?.data?.data &&
          groupSuggestions.data.data.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Suggested Groups
              </h3>
              <div className="space-y-2">
                {groupSuggestions.data.data.slice(0, 3).map((group: any) => (
                  <div
                    key={group._id}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={group.avatar || "/placeholder.svg"}
                        alt={group.name}
                      />
                      <AvatarFallback>
                        {group.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {group.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {group.membersCount} members
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/groups/discover">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                >
                  Discover more
                </Button>
              </Link>
            </div>
          )}
      </div>
    </aside>
  );
}
