"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import { useRouter } from "next/navigation"
import type { User } from "@/types"

interface ProfileFriendsProps {
  userId: string
  friends: User[]
}

export function ProfileFriends({ userId, friends }: ProfileFriendsProps) {
  const router = useRouter()

  if (friends.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No friends to show</h3>
          <p className="text-muted-foreground text-center">This user hasn't added any friends yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Friends ({friends.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {friends.slice(0, 12).map((friend) => (
            <div
              key={friend._id}
              className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => router.push(`/profile/${friend._id}`)}
            >
              <Avatar className="h-16 w-16">
                <AvatarImage src={friend.avatar || "/placeholder.svg"} alt={friend.name} />
                <AvatarFallback>{friend.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium text-center truncate w-full">{friend.name}</p>
            </div>
          ))}
        </div>
        {friends.length > 12 && (
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => router.push(`/friends`)}>
              See All Friends
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
