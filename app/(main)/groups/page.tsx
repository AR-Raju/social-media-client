"use client";

import { CreateGroupDialog } from "@/components/groups/create-group-dialog";
import { GroupCard } from "@/components/groups/group-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { groupsApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Compass, Plus, Search, Settings, Users } from "lucide-react";
import { useState } from "react";

export default function GroupsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: allGroups } = useQuery({
    queryKey: ["groups", "all", selectedCategory],
    queryFn: () =>
      groupsApi.getAllGroups(20, selectedCategory || undefined, "public"),
  });

  const { data: myGroups } = useQuery({
    queryKey: ["groups", "my"],
    queryFn: () => groupsApi.getMyGroups(50),
  });

  const { data: suggestions } = useQuery({
    queryKey: ["groups", "suggestions"],
    queryFn: () => groupsApi.getGroupSuggestions(10),
  });

  const categories = [
    "Technology",
    "Sports",
    "Music",
    "Art",
    "Business",
    "Education",
    "Gaming",
    "Travel",
    "Food",
    "Health",
    "Science",
    "Entertainment",
  ];

  const filteredGroups =
    allGroups?.data?.data?.filter(
      (group: any) =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Groups</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <Tabs defaultValue="discover" className="space-y-4">
        <TabsList>
          <TabsTrigger value="discover" className="flex items-center space-x-2">
            <Compass className="h-4 w-4" />
            <span>Discover</span>
          </TabsTrigger>
          <TabsTrigger
            value="my-groups"
            className="flex items-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span>My Groups</span>
            {myGroups?.data?.data && (
              <Badge variant="secondary">{myGroups.data.data.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="suggestions"
            className="flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Suggested</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-4">
          {filteredGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGroups.map((group: any) => (
                <GroupCard key={group._id} group={group} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Compass className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No groups found</h3>
                <p className="text-muted-foreground text-center">
                  Try adjusting your search terms or browse different
                  categories.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="my-groups" className="space-y-4">
          {myGroups?.data?.data && myGroups.data.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myGroups.data.data.map((group: any) => (
                <GroupCard key={group._id} group={group} isMember={true} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
                <p className="text-muted-foreground text-center">
                  Join some groups to see them here, or create your own!
                </p>
                <Button
                  className="mt-4"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Group
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          {suggestions?.data?.data && suggestions.data.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
              {suggestions.data.data.map((group: any) => (
                <GroupCard key={group._id} group={group} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No suggestions</h3>
                <p className="text-muted-foreground text-center">
                  We don't have any group suggestions for you right now.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <CreateGroupDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
