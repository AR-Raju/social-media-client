"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usersApi, postsApi, groupsApi } from "@/services/api"
import { Search, Users, FileText, Users2, Loader2 } from "lucide-react"
import { PostCard } from "@/components/posts/post-card"
import { GroupCard } from "@/components/groups/group-card"
import { FriendSuggestionCard } from "@/components/friends/friend-suggestion-card"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const query = searchParams.get("q")
    if (query) {
      setSearchTerm(query)
    }
  }, [searchParams])

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["search", "users", searchTerm],
    queryFn: () => usersApi.searchUsers(searchTerm, 20),
    enabled: searchTerm.length > 0,
  })

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["search", "posts", searchTerm],
    queryFn: () => postsApi.getFeedPosts(20, 1), // Note: This would need a search endpoint
    enabled: searchTerm.length > 0,
  })

  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ["search", "groups", searchTerm],
    queryFn: () => groupsApi.getAllGroups(20),
    enabled: searchTerm.length > 0,
  })

  const users = usersData?.data?.data || []
  const posts = postsData?.data?.data || []
  const groups = groupsData?.data?.data || []

  const filteredPosts = posts.filter((post: any) => post.content.toLowerCase().includes(searchTerm.toLowerCase()))

  const filteredGroups = groups.filter(
    (group: any) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const isLoading = usersLoading || postsLoading || groupsLoading

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for people, posts, groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {searchTerm.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Start searching</h3>
            <p className="text-muted-foreground text-center">Enter a search term to find people, posts, and groups.</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>All</span>
            </TabsTrigger>
            <TabsTrigger value="people" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>People</span>
              {users.length > 0 && <Badge variant="secondary">{users.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Posts</span>
              {filteredPosts.length > 0 && <Badge variant="secondary">{filteredPosts.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center space-x-2">
              <Users2 className="h-4 w-4" />
              <span>Groups</span>
              {filteredGroups.length > 0 && <Badge variant="secondary">{filteredGroups.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                {/* People Results */}
                {users.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">People</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {users.slice(0, 6).map((user: any) => (
                        <FriendSuggestionCard key={user._id} suggestion={user} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Posts Results */}
                {filteredPosts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Posts</h3>
                    <div className="space-y-4">
                      {filteredPosts.slice(0, 3).map((post: any) => (
                        <PostCard key={post._id} post={post} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Groups Results */}
                {filteredGroups.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Groups</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredGroups.slice(0, 6).map((group: any) => (
                        <GroupCard key={group._id} group={group} />
                      ))}
                    </div>
                  </div>
                )}

                {users.length === 0 && filteredPosts.length === 0 && filteredGroups.length === 0 && !isLoading && (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Search className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No results found</h3>
                      <p className="text-muted-foreground text-center">
                        Try adjusting your search terms or browse different categories.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="people" className="space-y-4">
            {users.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user: any) => (
                  <FriendSuggestionCard key={user._id} suggestion={user} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No people found</h3>
                  <p className="text-muted-foreground text-center">No users match your search criteria.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            {filteredPosts.length > 0 ? (
              <div className="space-y-6">
                {filteredPosts.map((post: any) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                  <p className="text-muted-foreground text-center">No posts match your search criteria.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            {filteredGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGroups.map((group: any) => (
                  <GroupCard key={group._id} group={group} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No groups found</h3>
                  <p className="text-muted-foreground text-center">No groups match your search criteria.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
