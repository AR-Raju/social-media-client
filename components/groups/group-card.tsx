"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { groupsApi } from "@/services/api"
import { Users, MoreHorizontal, Settings, LogOut, Crown } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Group } from "@/types"

interface GroupCardProps {
  group: Group
  isMember?: boolean
}

export function GroupCard({ group, isMember = false }: GroupCardProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const router = useRouter()

  const joinGroupMutation = useMutation({
    mutationFn: () => groupsApi.joinGroup(group._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      toast({
        title: "Joined group",
        description: `You have successfully joined ${group.name}!`,
      })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to join group",
        description: error.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      })
    },
  })

  const leaveGroupMutation = useMutation({
    mutationFn: () => groupsApi.leaveGroup(group._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      toast({
        title: "Left group",
        description: `You have left ${group.name}.`,
      })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to leave group",
        description: error.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      })
    },
  })

  const handleJoinGroup = () => {
    joinGroupMutation.mutate()
  }

  const handleLeaveGroup = () => {
    if (confirm(`Are you sure you want to leave ${group.name}?`)) {
      leaveGroupMutation.mutate()
    }
  }

  const handleViewGroup = () => {
    router.push(`/groups/${group._id}`)
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewGroup}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={group.avatar || "/placeholder.svg"} alt={group.name} />
              <AvatarFallback>{group.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{group.name}</h3>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {group.category}
                </Badge>
                <Badge variant={group.privacy === "public" ? "secondary" : "outline"} className="text-xs">
                  {group.privacy}
                </Badge>
              </div>
            </div>
          </div>
          {isMember && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleViewGroup()
                  }}
                >
                  View Group
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation() /* Handle settings */
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleLeaveGroup()
                  }}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Leave Group
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{group.membersCount} members</span>
          </div>
          {group.admin && (
            <div className="flex items-center space-x-1">
              <Crown className="h-3 w-3" />
              <span className="text-xs">by {group.admin.name}</span>
            </div>
          )}
        </div>

        {group.tags && group.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {group.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {group.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{group.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="pt-2" onClick={(e) => e.stopPropagation()}>
          {isMember ? (
            <Button variant="outline" className="w-full bg-transparent" onClick={handleViewGroup}>
              View Group
            </Button>
          ) : (
            <Button className="w-full" onClick={handleJoinGroup} disabled={joinGroupMutation.isPending}>
              {joinGroupMutation.isPending ? "Joining..." : "Join Group"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
