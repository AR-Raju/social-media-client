"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { friendsApi } from "@/services/api"
import { UserPlus, X } from "lucide-react"
import type { User } from "@/types"

interface FriendSuggestionCardProps {
  suggestion: User & { mutualFriends?: number }
}

export function FriendSuggestionCard({ suggestion }: FriendSuggestionCardProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const sendRequestMutation = useMutation({
    mutationFn: () => friendsApi.sendFriendRequest(suggestion._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] })
      toast({
        title: "Friend request sent",
        description: `Friend request sent to ${suggestion.name}!`,
      })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send request",
        description: error.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      })
    },
  })

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={suggestion.avatar || "/placeholder.svg"} alt={suggestion.name} />
            <AvatarFallback>{suggestion.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{suggestion.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{suggestion.bio || "No bio available"}</p>
            {suggestion.mutualFriends !== undefined && suggestion.mutualFriends > 0 && (
              <p className="text-xs text-muted-foreground">{suggestion.mutualFriends} mutual friends</p>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => sendRequestMutation.mutate()}
            disabled={sendRequestMutation.isPending}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Friend
          </Button>
          <Button variant="outline" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
