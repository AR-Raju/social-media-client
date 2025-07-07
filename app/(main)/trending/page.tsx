"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { eventsApi, postsApi, tradingApi } from "@/services/api";
import type { Event, Post, TradingListing } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  Bookmark,
  BookmarkCheck,
  Calendar,
  Clock,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  Package,
  Search,
  Share2,
  ThumbsUp,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";

const sortOptions = [
  { value: "popular", label: "Most Popular" },
  { value: "recent", label: "Most Recent" },
  { value: "trending", label: "Trending Now" },
];

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
  "Entertainment",
];

export default function TrendingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("popular");
  const [activeTab, setActiveTab] = useState("posts");

  // Fetch trending posts
  const {
    data: trendingPosts,
    isLoading: postsLoading,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: ["trending-posts", sortBy, selectedCategory],
    queryFn: () => postsApi.getFeedPosts(20, 1),
    enabled: activeTab === "posts",
  });

  // Fetch trending events
  const {
    data: trendingEvents,
    isLoading: eventsLoading,
    refetch: refetchEvents,
  } = useQuery({
    queryKey: ["trending-events", sortBy, selectedCategory],
    queryFn: () => eventsApi.getEvents(1, 20),
    enabled: activeTab === "events",
  });

  // Fetch trending marketplace items
  const {
    data: trendingListings,
    isLoading: listingsLoading,
    refetch: refetchListings,
  } = useQuery({
    queryKey: ["trending-listings", sortBy, selectedCategory],
    queryFn: () =>
      tradingApi.getListings(
        1,
        20,
        selectedCategory !== "All Categories" ? selectedCategory : undefined
      ),
    enabled: activeTab === "marketplace",
  });

  const handleSavePost = async (postId: string) => {
    try {
      await postsApi.savePost(postId);
      toast({
        title: "Post Saved",
        description: "Post has been added to your saved items.",
      });
      refetchPosts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save post.",
        variant: "destructive",
      });
    }
  };

  const handleUnsavePost = async (postId: string) => {
    try {
      await postsApi.unsavePost(postId);
      toast({
        title: "Post Removed",
        description: "Post has been removed from your saved items.",
      });
      refetchPosts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove post from saved items.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const filteredPosts =
    trendingPosts?.data?.data?.filter(
      (post: Post) =>
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const filteredEvents =
    trendingEvents?.data?.data?.filter(
      (event: Event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const filteredListings =
    trendingListings?.data?.data?.filter(
      (listing: TradingListing) =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            Trending
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover what's popular in your community
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search trending content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
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
              <SelectTrigger className="w-full md:w-48">
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
        </CardContent>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Posts ({filteredPosts.length})
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Events ({filteredEvents.length})
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Marketplace ({filteredListings.length})
          </TabsTrigger>
        </TabsList>

        {/* Trending Posts */}
        <TabsContent value="posts" className="space-y-4">
          {postsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted rounded-full" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-1/4" />
                        <div className="h-3 bg-muted rounded w-1/6" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded" />
                      <div className="h-4 bg-muted rounded w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="space-y-4">
              {filteredPosts.map((post: Post) => (
                <Card
                  key={post._id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={post.author.avatar || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {post.author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{post.author.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(post.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          post.isSaved
                            ? handleUnsavePost(post._id)
                            : handleSavePost(post._id)
                        }
                      >
                        {post.isSaved ? (
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm leading-relaxed">{post.content}</p>
                    </div>

                    {post.images && post.images.length > 0 && (
                      <div className="mb-4">
                        <img
                          src={post.images[0] || "/placeholder.svg"}
                          alt="Post image"
                          className="w-full rounded-lg object-cover max-h-96"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          {Object.values(post.reactions).reduce(
                            (sum, arr) => sum + arr.length,
                            0
                          )}
                        </span>
                        <span>{post.commentsCount} comments</span>
                        <span>{post.sharesCount} shares</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No trending posts</h3>
              <p className="text-muted-foreground">
                Check back later for trending content.
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Trending Events */}
        <TabsContent value="events" className="space-y-4">
          {eventsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted rounded-t-lg" />
                  <CardContent className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                    <div className="h-6 bg-muted rounded w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredEvents.map((event: Event) => (
                <Card
                  key={event._id}
                  className="hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-video overflow-hidden rounded-t-lg">
                    <img
                      src={
                        event.images?.[0] ||
                        "/placeholder.svg?height=200&width=400" ||
                        "/placeholder.svg"
                      }
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          // Handle save event
                          toast({
                            title: "Event Saved",
                            description: "Event added to your saved items.",
                          });
                        }}
                      >
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <h3 className="font-semibold line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(event.date)}</span>
                          <Clock className="h-4 w-4 ml-2" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{event.attendees} attending</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={event.organizer.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback>
                              {event.organizer.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {event.organizer.name}
                          </span>
                        </div>
                        <Badge variant="secondary">
                          {event.price === 0
                            ? "Free"
                            : formatPrice(event.price)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No trending events</h3>
              <p className="text-muted-foreground">
                Check back later for popular events.
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Trending Marketplace */}
        <TabsContent value="marketplace" className="space-y-4">
          {listingsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-muted rounded-t-lg" />
                  <CardContent className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                    <div className="h-6 bg-muted rounded w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing: TradingListing) => (
                <Card
                  key={listing._id}
                  className="hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-square overflow-hidden rounded-t-lg">
                    <img
                      src={
                        listing.images?.[0] ||
                        "/placeholder.svg?height=300&width=300" ||
                        "/placeholder.svg"
                      }
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          // Handle save listing
                          toast({
                            title: "Item Saved",
                            description: "Item added to your saved items.",
                          });
                        }}
                      >
                        {listing.isLiked ? (
                          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                        ) : (
                          <Heart className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold line-clamp-2">
                        {listing.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {listing.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(listing.price)}
                        </span>
                        <Badge variant="outline">{listing.category}</Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{listing.location}</span>
                        <Eye className="h-3 w-3 ml-2" />
                        <span>{listing.views}</span>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={listing.seller.avatar || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {listing.seller.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{listing.seller.name}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No trending items</h3>
              <p className="text-muted-foreground">
                Check back later for popular marketplace items.
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
