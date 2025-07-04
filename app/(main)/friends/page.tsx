"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { friendsApi } from "@/services/api"
import { Search, Users, UserPlus, Clock, CheckCircle } from "lucide-react"
import { FriendCard } from "@/components/friends/friend-card"
import { FriendRequestCard } from "@/components/friends/friend-request-card"
import { FriendSuggestionCard } from "@/components/friends/friend-suggestion-card"

export default function FriendsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const { data: friendsList } = useQuery({
    queryKey: ["friends", "list", searchTerm],
    queryFn: () => friendsApi.getFriendsList(50, searchTerm || undefined),
  })

  const { data: friendRequests } = useQuery({
    queryKey: ["friends", "requests"],
    queryFn: () => friendsApi.getFriendRequests(20),
  })

  const { data: sentRequests } = useQuery({
    queryKey: ["friends", "sent-requests"],
    queryFn: () => friendsApi.getSentFriendRequests(20),
  })

  const { data: suggestions } = useQuery({
    queryKey: ["friends", "suggestions"],
    queryFn: () => friendsApi.getFriendSuggestions(20),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Friends</h1>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search friends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>All Friends</span>
            {friendsList?.data?.data && <Badge variant="secondary">{friendsList.data.data.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <span>Requests</span>
            {friendRequests?.data?.data && friendRequests.data.data.length > 0 && (
              <Badge variant="destructive">{friendRequests.data.data.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Sent</span>
            {sentRequests?.data?.data && sentRequests.data.data.length > 0 && (
              <Badge variant="outline">{sentRequests.data.data.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Suggestions</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {friendsList?.data?.data && friendsList.data.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friendsList.data.data.map((friend: any) => (
                <FriendCard key={friend._id} friend={friend} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No friends yet</h3>
                <p className="text-muted-foreground text-center">
                  Start connecting with people by sending friend requests!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {friendRequests?.data?.data && friendRequests.data.data.length > 0 ? (
            <div className="space-y-4">
              {friendRequests.data.data.map((request: any) => (
                <FriendRequestCard key={request._id} request={request} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No friend requests</h3>
                <p className="text-muted-foreground text-center">You don't have any pending friend requests.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {sentRequests?.data?.data && sentRequests.data.data.length > 0 ? (
            <div className="space-y-4">
              {sentRequests.data.data.map((request: any) => (
                <Card key={request._id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={request.receiver.avatar || "/placeholder.svg"} alt={request.receiver.name} />
                        <AvatarFallback>{request.receiver.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{request.receiver.name}</p>
                        <p className="text-sm text-muted-foreground">Request sent</p>
                      </div>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No sent requests</h3>
                <p className="text-muted-foreground text-center">You haven't sent any friend requests recently.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          {suggestions?.data?.data && suggestions.data.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.data.data.map((suggestion: any) => (
                <FriendSuggestionCard key={suggestion._id} suggestion={suggestion} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No suggestions</h3>
                <p className="text-muted-foreground text-center">
                  We don't have any friend suggestions for you right now.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
