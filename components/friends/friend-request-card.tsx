"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { friendsApi } from "@/services/api"
import { Check, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { FriendRequest } from "@/types"

interface FriendRequestCardProps {
  request: FriendRequest
}

export function FriendRequestCard({ request }: FriendRequestCardProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const acceptRequestMutation = useMutation({
    mutationFn: () => friendsApi.acceptFriendRequest(request._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] })
      toast({
        title: "Friend request accepted",
        description: `You are now friends with ${request.sender.name}!`,
      })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to accept request",
        description: error.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      })
    },
  })

  const rejectRequestMutation = useMutation({
    mutationFn: () => friendsApi.rejectFriendRequest(request._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] })
      toast({
        title: "Friend request rejected",
        description: "The friend request has been declined.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to reject request",
        description: error.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      })
    },
  })

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={request.sender.avatar || "/placeholder.svg"} alt={request.sender.name} />
            <AvatarFallback>{request.sender.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold">{request.sender.name}</h3>
            <p className="text-sm text-muted-foreground">Sent {formatDistanceToNow(new Date(request.createdAt))} ago</p>
            {request.message && <p className="text-sm text-muted-foreground mt-1 italic">"{request.message}"</p>}
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => acceptRequestMutation.mutate()}
            disabled={acceptRequestMutation.isPending || rejectRequestMutation.isPending}
          >
            <Check className="mr-2 h-4 w-4" />
            Accept
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-transparent"
            onClick={() => rejectRequestMutation.mutate()}
            disabled={acceptRequestMutation.isPending || rejectRequestMutation.isPending}
          >
            <X className="mr-2 h-4 w-4" />
            Decline
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
