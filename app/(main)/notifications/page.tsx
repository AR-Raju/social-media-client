"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { notificationsApi } from "@/services/api"
import { Bell, Check, CheckCheck, Trash2, Heart, MessageCircle, UserPlus, Users, Share2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Notification } from "@/types"

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", filter],
    queryFn: () => notificationsApi.getNotifications(50, 1, filter === "unread" ? false : undefined),
  })

  const { data: unreadCount } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationsApi.getUnreadCount(),
  })

  const markAsReadMutation = useMutation({
    mutationFn: (notificationIds?: string[]) => notificationsApi.markAsRead(notificationIds, !notificationIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      toast({
        title: "Notifications marked as read",
        description: "Selected notifications have been marked as read.",
      })
    },
  })

  const deleteNotificationMutation = useMutation({
    mutationFn: notificationsApi.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      toast({
        title: "Notification deleted",
        description: "The notification has been removed.",
      })
    },
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />
      case "comment":
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      case "friend_request":
      case "friend_accept":
        return <UserPlus className="h-4 w-4 text-green-500" />
      case "group_invite":
        return <Users className="h-4 w-4 text-purple-500" />
      case "post_share":
        return <Share2 className="h-4 w-4 text-orange-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const handleMarkAllAsRead = () => {
    markAsReadMutation.mutate()
  }

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate([notificationId])
  }

  const handleDelete = (notificationId: string) => {
    deleteNotificationMutation.mutate(notificationId)
  }

  const notificationsList = notifications?.data?.data || []
  const unreadNotifications = notificationsList.filter((n: Notification) => !n.isRead)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount?.data?.count > 0
              ? `You have ${unreadCount.data.count} unread notifications`
              : "You're all caught up!"}
          </p>
        </div>
        {unreadNotifications.length > 0 && (
          <Button onClick={handleMarkAllAsRead} disabled={markAsReadMutation.isPending}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs value={filter} onValueChange={(value) => setFilter(value as "all" | "unread")}>
        <TabsList>
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>All</span>
            {notificationsList.length > 0 && <Badge variant="secondary">{notificationsList.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Unread</span>
            {unreadNotifications.length > 0 && <Badge variant="destructive">{unreadNotifications.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="space-y-4">
          {notificationsList.length > 0 ? (
            <div className="space-y-2">
              {notificationsList.map((notification: Notification) => (
                <Card
                  key={notification._id}
                  className={`transition-colors ${!notification.isRead ? "bg-muted/50" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={notification.sender.avatar || "/placeholder.svg"}
                          alt={notification.sender.name}
                        />
                        <AvatarFallback>{notification.sender.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            {getNotificationIcon(notification.type)}
                            <p className="text-sm">
                              <span className="font-semibold">{notification.sender.name}</span> {notification.message}
                            </p>
                          </div>
                          {!notification.isRead && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
                        </div>

                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt))} ago
                        </p>
                      </div>

                      <div className="flex items-center space-x-1">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleMarkAsRead(notification._id)}
                            disabled={markAsReadMutation.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(notification._id)}
                          disabled={deleteNotificationMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {filter === "unread" ? "No unread notifications" : "No notifications"}
                </h3>
                <p className="text-muted-foreground text-center">
                  {filter === "unread"
                    ? "You're all caught up! Check back later for new notifications."
                    : "When you get notifications, they'll show up here."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
