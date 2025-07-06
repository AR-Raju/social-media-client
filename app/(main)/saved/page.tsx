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
import { useQuery } from "@tanstack/react-query";
import {
  Bookmark,
  Calendar,
  ExternalLink,
  FileText,
  Heart,
  Package,
  Search,
  Share2,
  Trash2,
} from "lucide-react";
import { useState } from "react";

interface SavedPost {
  _id: string;
  title?: string;
  content: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  savedAt: string;
}

interface SavedEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  organizer: {
    _id: string;
    name: string;
    avatar?: string;
  };
  attendees: number;
  isAttending: boolean;
  savedAt: string;
}

interface SavedListing {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  seller: {
    _id: string;
    name: string;
    avatar?: string;
  };
  location: string;
  savedAt: string;
}

const sortOptions = [
  { value: "newest", label: "Recently Saved" },
  { value: "oldest", label: "Oldest Saved" },
  { value: "title", label: "Title A-Z" },
  { value: "popular", label: "Most Popular" },
];

export default function SavedPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("posts");

  const {
    data: savedPosts,
    isLoading: postsLoading,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: ["saved-posts", sortBy],
    queryFn: () => postsApi.getSavedPosts(1, 20),
    enabled: activeTab === "posts",
  });

  const { data: savedEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["saved-events", sortBy],
    queryFn: () => eventsApi.getMyEvents(1, 20), // This would be saved events endpoint
    enabled: activeTab === "events",
  });

  const { data: savedListings, isLoading: listingsLoading } = useQuery({
    queryKey: ["saved-listings", sortBy],
    queryFn: () => tradingApi.getMyListings(1, 20), // This would be saved listings endpoint
    enabled: activeTab === "listings",
  });

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

  const handleSharePost = async (postId: string) => {
    try {
      // Copy link to clipboard
      await navigator.clipboard.writeText(
        `${window.location.origin}/posts/${postId}`
      );
      toast({
        title: "Link Copied",
        description: "Post link has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link.",
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
    savedPosts?.data?.data?.filter(
      (post: SavedPost) =>
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const filteredEvents =
    savedEvents?.data?.data?.filter(
      (event: SavedEvent) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const filteredListings =
    savedListings?.data?.data?.filter(
      (listing: SavedListing) =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bookmark className="h-8 w-8 text-primary" />
            Saved Items
          </h1>
          <p className="text-muted-foreground mt-1">
            Your bookmarked posts, events, and marketplace items
          </p>
        </div>
      </div>

      {/* Search and Sort */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search saved items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
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
            <FileText className="h-4 w-4" />
            Posts ({filteredPosts.length})
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Events ({filteredEvents.length})
          </TabsTrigger>
          <TabsTrigger value="listings" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Marketplace ({filteredListings.length})
          </TabsTrigger>
        </TabsList>

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
              {filteredPosts.map((post: SavedPost) => (
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
                      <Badge variant="outline">
                        Saved {formatDate(post.savedAt)}
                      </Badge>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm leading-relaxed">{post.content}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {post.likes}
                        </span>
                        <span>{post.comments} comments</span>
                        <span>{post.shares} shares</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSharePost(post._id)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnsavePost(post._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No saved posts</h3>
              <p className="text-muted-foreground">
                Posts you save will appear here for easy access later.
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          {eventsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 space-y-4">
                    <div className="h-6 bg-muted rounded w-1/3" />
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="space-y-4">
              {filteredEvents.map((event: SavedEvent) => (
                <Card
                  key={event._id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          {event.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(event.date)}
                          </span>
                          <span>{event.location}</span>
                          <span>{event.attendees} attending</span>
                        </div>
                      </div>
                      <Badge variant="outline">
                        Saved {formatDate(event.savedAt)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={event.organizer.avatar || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {event.organizer.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          Organized by {event.organizer.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No saved events</h3>
              <p className="text-muted-foreground">
                Events you're interested in will appear here.
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="listings" className="space-y-4">
          {listingsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          ) : filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredListings.map((listing: SavedListing) => (
                <Card
                  key={listing._id}
                  className="hover:shadow-md transition-shadow"
                >
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img
                      src={
                        listing.images?.[0] ||
                        "/placeholder.svg?height=200&width=300"
                      }
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold line-clamp-1">
                        {listing.title}
                      </h3>
                      <Badge variant="outline">
                        Saved {formatDate(listing.savedAt)}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {listing.description}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(listing.price)}
                      </span>
                      <Badge variant="outline">{listing.category}</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
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

                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No saved listings</h3>
              <p className="text-muted-foreground">
                Marketplace items you save will appear here.
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
