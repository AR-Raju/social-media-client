"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { tradingApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  Package,
  Search,
  Share2,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

interface TradingListing {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  seller: {
    _id: string;
    name: string;
    avatar?: string;
    rating: number;
    totalSales: number;
  };
  location: string;
  createdAt: string;
  views: number;
  likes: number;
  isLiked: boolean;
  status: "active" | "sold" | "pending";
}

const categories = [
  "All Categories",
  "Electronics",
  "Fashion",
  "Home & Garden",
  "Sports",
  "Books",
  "Automotive",
  "Collectibles",
  "Art & Crafts",
  "Other",
];

const conditions = [
  "All Conditions",
  "New",
  "Like New",
  "Good",
  "Fair",
  "Poor",
];
const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
];

export default function TrendingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedCondition, setSelectedCondition] = useState("All Conditions");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  const {
    data: listings,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["trading-listings", selectedCategory, searchQuery, sortBy],
    queryFn: () =>
      tradingApi.getListings(
        1,
        20,
        selectedCategory !== "All Categories" ? selectedCategory : undefined
      ),
  });

  const { data: apiCategories } = useQuery({
    queryKey: ["trading-categories"],
    queryFn: () => tradingApi.getCategories(),
  });

  const handleLikeListing = async (listingId: string) => {
    try {
      // This would be implemented in the API
      toast({
        title: "Added to Wishlist",
        description: "Item has been added to your wishlist.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to wishlist.",
        variant: "destructive",
      });
    }
  };

  const handleContactSeller = async (listingId: string, sellerId: string) => {
    try {
      await tradingApi.contactSeller(listingId, {
        message: "Hi, I'm interested in this item. Is it still available?",
      });
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the seller.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message to seller.",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            Marketplace
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover and trade items with your community
          </p>
        </div>
        <Button>
          <Package className="h-4 w-4 mr-2" />
          Create Listing
        </Button>
      </div>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Items</TabsTrigger>
          <TabsTrigger value="my-listings">My Listings</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search & Filter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search items..."
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
                <Select
                  value={selectedCondition}
                  onValueChange={setSelectedCondition}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((condition) => (
                      <SelectItem key={condition} value={condition}>
                        {condition}
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

          {/* Listings Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings?.data?.data?.map((listing: TradingListing) => (
                <Card
                  key={listing._id}
                  className="group hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-square overflow-hidden rounded-t-lg">
                    <img
                      src={
                        listing.images?.[0] ||
                        "/placeholder.svg?height=300&width=300"
                      }
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Badge
                        variant={
                          listing.status === "active" ? "default" : "secondary"
                        }
                      >
                        {listing.status}
                      </Badge>
                      {listing.condition && (
                        <Badge variant="outline">{listing.condition}</Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleLikeListing(listing._id)}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          listing.isLiked ? "fill-red-500 text-red-500" : ""
                        }`}
                      />
                    </Button>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
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
                        <Clock className="h-3 w-3 ml-2" />
                        <span>{formatDate(listing.createdAt)}</span>
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
                        <span className="text-sm font-medium">
                          {listing.seller.name}
                        </span>
                        <div className="flex items-center gap-1 ml-auto text-xs text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          <span>{listing.views}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            handleContactSeller(listing._id, listing.seller._id)
                          }
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Contact
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {listings?.data?.data?.length === 0 && (
            <Card className="p-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or check back later for new
                listings.
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="my-listings">
          <Card>
            <CardHeader>
              <CardTitle>My Listings</CardTitle>
              <CardDescription>
                Manage your marketplace listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first listing to start selling items.
                </p>
                <Button>
                  <Package className="h-4 w-4 mr-2" />
                  Create Listing
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wishlist">
          <Card>
            <CardHeader>
              <CardTitle>Wishlist</CardTitle>
              <CardDescription>Items you've saved for later</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No saved items</h3>
                <p className="text-muted-foreground">
                  Items you like will appear here for easy access.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
