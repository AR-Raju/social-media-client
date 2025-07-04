"use client"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { usersApi, postsApi } from "@/services/api"
import { useAuth } from "@/context/auth-context"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfilePosts } from "@/components/profile/profile-posts"
import { ProfileFriends } from "@/components/profile/profile-friends"
import { ProfileAbout } from "@/components/profile/profile-about"

export default function ProfilePage() {
  const params = useParams()
  const { user: currentUser } = useAuth()
  const userId = params.id as string

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => usersApi.getProfile(userId),
  })

  const { data: userPosts } = useQuery({
    queryKey: ["posts", "user", userId],
    queryFn: () => postsApi.getUserPosts(userId, 10, 1),
  })

  const { data: userFriends } = useQuery({
    queryKey: ["friends", "user", userId],
    queryFn: () => usersApi.getUserFriends(userId, 20),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const user = userProfile?.data?.data
  const isOwnProfile = currentUser?._id === userId

  if (!user) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">User not found</h2>
        <p className="text-muted-foreground">The user you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ProfileHeader user={user} isOwnProfile={isOwnProfile} />

      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <ProfilePosts userId={userId} posts={userPosts?.data?.data || []} />
        </TabsContent>

        <TabsContent value="about">
          <ProfileAbout user={user} isOwnProfile={isOwnProfile} />
        </TabsContent>

        <TabsContent value="friends">
          <ProfileFriends userId={userId} friends={userFriends?.data?.data || []} />
        </TabsContent>

        <TabsContent value="photos">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground">Photos feature coming soon!</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
