"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { friendsApi } from "@/services/api"
import { MessageCircle, MoreHorizontal, UserMinus } from "lucide-react"
import { useRouter } from "next/navigation"
import type { User } from "@/types"

interface FriendCardProps {
  friend: User
}

export function FriendCard({ friend }: FriendCardProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const router = useRouter()

  const removeFriendMutation = useMutation({
    mutationFn: () => friendsApi.removeFriend(friend._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] })
      toast({
        title: "Friend removed",
        description: `You are no longer friends with ${friend.name}.`,
      })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove friend",
        description: error.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      })
    },
  })

  const handleRemoveFriend = () => {
    if (confirm(`Are you sure you want to remove ${friend.name} from your friends?`)) {
      removeFriendMutation.mutate()
    }
  }

  const handleMessage = () => {
    router.push(`/messages?user=${friend._id}`)
  }

  const handleViewProfile = () => {
    router.push(`/profile/${friend._id}`)
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="h-12 w-12 cursor-pointer" onClick={handleViewProfile}>
            <AvatarImage src={friend.avatar || "/placeholder.svg"} alt={friend.name} />
            <AvatarFallback>{friend.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate cursor-pointer hover:underline" onClick={handleViewProfile}>
              {friend.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">{friend.bio || "No bio available"}</p>
            {friend.friendsCount !== undefined && (
              <p className="text-xs text-muted-foreground">{friend.friendsCount} mutual friends</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleViewProfile}>View Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={handleRemoveFriend} className="text-destructive">
                <UserMinus className="mr-2 h-4 w-4" />
                Remove Friend
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={handleMessage}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Message
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
