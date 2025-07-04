"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { friendsApi } from "@/services/api"
import { MessageCircle, UserPlus, UserCheck, Settings, Camera } from "lucide-react"
import { useRouter } from "next/navigation"
import type { User } from "@/types"

interface ProfileHeaderProps {
  user: User
  isOwnProfile: boolean
}

export function ProfileHeader({ user, isOwnProfile }: ProfileHeaderProps) {
  const [friendshipStatus, setFriendshipStatus] = useState<"none" | "pending" | "friends">("none")
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const router = useRouter()

  const sendFriendRequestMutation = useMutation({
    mutationFn: () => friendsApi.sendFriendRequest(user._id),
    onSuccess: () => {
      setFriendshipStatus("pending")
      toast({
        title: "Friend request sent",
        description: `Friend request sent to ${user.name}!`,
      })
    },
  })

  const handleMessage = () => {
    router.push(`/messages?user=${user._id}`)
  }

  const handleEditProfile = () => {
    router.push("/settings")
  }

  return (
    <Card>
      <CardContent className="p-0">
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          {user.coverPhoto && (
            <img src={user.coverPhoto || "/placeholder.svg"} alt="Cover" className="w-full h-full object-cover" />
          )}
          {isOwnProfile && (
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-4 right-4"
              onClick={() => {
                /* Handle cover photo upload */
              }}
            >
              <Camera className="mr-2 h-4 w-4" />
              Edit Cover
            </Button>
          )}
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-4 -mt-16">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-background">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="text-2xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full"
                  onClick={() => {
                    /* Handle avatar upload */
                  }}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
              {user.isOnline && (
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-background rounded-full" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  {user.bio && <p className="text-muted-foreground mt-1">{user.bio}</p>}
                  <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                    <span>{user.friendsCount || 0} friends</span>
                    <span>{user.postsCount || 0} posts</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                  {isOwnProfile ? (
                    <Button onClick={handleEditProfile}>
                      <Settings className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handleMessage}>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Message
                      </Button>
                      {friendshipStatus === "friends" ? (
                        <Button variant="outline">
                          <UserCheck className="mr-2 h-4 w-4" />
                          Friends
                        </Button>
                      ) : friendshipStatus === "pending" ? (
                        <Button variant="outline" disabled>
                          Request Sent
                        </Button>
                      ) : (
                        <Button
                          onClick={() => sendFriendRequestMutation.mutate()}
                          disabled={sendFriendRequestMutation.isPending}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add Friend
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
