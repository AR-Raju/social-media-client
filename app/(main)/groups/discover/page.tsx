"use client";

import { GroupCard } from "@/components/groups/group-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { groupsApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Compass, Search, TrendingUp, Users } from "lucide-react";
import { useState } from "react";

const categories = [
  "All Categories",
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
  "Photography",
  "Books",
  "Movies",
  "Fashion",
  "Fitness",
];

const sortOptions = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "members", label: "Most Members" },
  { value: "active", label: "Most Active" },
];

export default function DiscoverGroupsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("popular");
  const [activeTab, setActiveTab] = useState("all");

  const { data: allGroups, isLoading: allGroupsLoading } = useQuery({
    queryKey: ["groups", "discover", selectedCategory, sortBy],
    queryFn: () =>
      groupsApi.getAllGroups(
        50,
        selectedCategory === "All Categories" ? undefined : selectedCategory,
        "public"
      ),
  });

  const { data: trendingGroups, isLoading: trendingLoading } = useQuery({
    queryKey: ["groups", "trending"],
    queryFn: () => groupsApi.getAllGroups(12, undefined, "public"),
    enabled: activeTab === "trending",
  });

  const { data: suggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ["groups", "suggestions"],
    queryFn: () => groupsApi.getGroupSuggestions(20),
    enabled: activeTab === "suggested",
  });

  const filteredGroups =
    allGroups?.data?.data?.filter(
      (group: any) =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Discover Groups</h1>
          <p className="text-muted-foreground">
            Find communities that match your interests
          </p>
        </div>
        <Badge variant="secondary" className="text-sm w-fit">
          {filteredGroups.length} groups found
        </Badge>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search groups by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Compass className="h-4 w-4" />
            All Groups
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="suggested" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Suggested
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Category Quick Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.slice(1, 9).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="text-xs"
              >
                {category}
              </Button>
            ))}
          </div>

          {allGroupsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                      <Skeleton className="h-16 w-full" />
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-9 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group: any) => (
                <GroupCard key={group._id} group={group} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Compass className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No groups found</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm || selectedCategory !== "All Categories"
                    ? "Try adjusting your search terms or filters."
                    : "No groups are available at the moment."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Trending Groups</h2>
            <p className="text-muted-foreground">
              Groups that are gaining popularity
            </p>
          </div>

          {trendingLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingGroups?.data?.data
                ?.slice(0, 12)
                .map((group: any, index: number) => (
                  <div key={group._id} className="relative">
                    {index < 3 && (
                      <Badge
                        className="absolute -top-2 -right-2 z-10"
                        variant={index === 0 ? "default" : "secondary"}
                      >
                        #{index + 1} Trending
                      </Badge>
                    )}
                    <GroupCard group={group} />
                  </div>
                )) || (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No trending groups
                    </h3>
                    <p className="text-muted-foreground text-center">
                      Check back later for trending groups.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="suggested" className="space-y-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Suggested for You</h2>
            <p className="text-muted-foreground">
              Groups based on your interests and activity
            </p>
          </div>

          {suggestionsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions?.data?.data?.map((group: any) => (
                <GroupCard key={group._id} group={group} />
              )) || (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No suggestions available
                    </h3>
                    <p className="text-muted-foreground text-center">
                      We don't have any group suggestions for you right now. Try
                      exploring different categories!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Load More */}
      {filteredGroups.length > 0 && activeTab === "all" && (
        <div className="flex justify-center pt-6">
          <Button variant="outline">Load More Groups</Button>
        </div>
      )}
    </div>
  );
}
