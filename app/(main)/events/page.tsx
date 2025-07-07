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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { eventsApi } from "@/services/api";
import { Event } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  CalendarPlus,
  Clock,
  MapPin,
  Plus,
  Search,
  Share2,
  Star,
  Ticket,
  Users,
} from "lucide-react";
import { useState } from "react";

const eventCategories = [
  { key: "all", label: "All Categories" },
  { key: "music", label: "Music & Concerts" },
  { key: "sports", label: "Sports & Fitness" },
  { key: "technology", label: "Technology" },
  { key: "business", label: "Business & Networking" },
  { key: "education", label: "Education" },
  { key: "food", label: "Food & Drink" },
  { key: "art", label: "Arts & Culture" },
  { key: "health", label: "Health & Wellness" },
  { key: "social", label: "Community" },
  { key: "other", label: "Other" },
];

const sortOptions = [
  { value: "date", label: "Date (Soonest)" },
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Recently Added" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("date");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "",
    maxAttendees: "",
    price: "",
  });

  const {
    data: events,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["events", selectedCategory, searchQuery, sortBy],
    queryFn: () => eventsApi.getEvents(1, 20),
  });

  const { data: myEvents } = useQuery({
    queryKey: ["my-events"],
    queryFn: () => eventsApi.getMyEvents(1, 20),
  });

  const handleJoinEvent = async (eventId: string) => {
    try {
      await eventsApi.joinEvent(eventId);
      toast({
        title: "Event Joined",
        description: "You've successfully joined this event!",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    try {
      await eventsApi.leaveEvent(eventId);
      toast({
        title: "Event Left",
        description: "You've left this event.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to leave event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateEvent = async () => {
    try {
      await eventsApi.createEvent({
        ...newEvent,
        maxAttendees: newEvent.maxAttendees
          ? Number.parseInt(newEvent.maxAttendees)
          : undefined,
        price: Number.parseFloat(newEvent.price) || 0,
      });
      toast({
        title: "Event Created",
        description: "Your event has been created successfully!",
      });
      setShowCreateDialog(false);
      setNewEvent({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        category: "",
        maxAttendees: "",
        price: "",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return price === 0
      ? "Free"
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(price);
  };

  const isEventSoon = (dateString: string) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8 text-primary" />
            Events
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover and join events in your community
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>
                Fill in the details to create your event.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  placeholder="Enter event title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  placeholder="Describe your event"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, date: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newEvent.time}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, time: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newEvent.location}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, location: e.target.value })
                  }
                  placeholder="Event location"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newEvent.category}
                    onValueChange={(value) =>
                      setNewEvent({ ...newEvent, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventCategories.slice(1).map((category) => (
                        <SelectItem key={category.key} value={category.key}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newEvent.price}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, price: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxAttendees">Max Attendees (Optional)</Label>
                <Input
                  id="maxAttendees"
                  type="number"
                  min="1"
                  value={newEvent.maxAttendees}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, maxAttendees: e.target.value })
                  }
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateEvent}>Create Event</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="discover" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discover">Discover Events</TabsTrigger>
          <TabsTrigger value="my-events">My Events</TabsTrigger>
          <TabsTrigger value="attending">Attending</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Find Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search events..."
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
                    {eventCategories.map((category) => (
                      <SelectItem key={category.key} value={category.key}>
                        {category.label}
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

          {/* Events Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events?.data?.data?.map((event: Event) => (
                <Card
                  key={event._id}
                  className="group hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={
                        event.images?.[0] ||
                        "/placeholder.svg?height=200&width=400"
                      }
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 left-2 flex gap-2">
                      {isEventSoon(event.date) && (
                        <Badge className="bg-red-500 hover:bg-red-600">
                          Soon
                        </Badge>
                      )}
                      <Badge variant="secondary">{event.category}</Badge>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant={event.price === 0 ? "default" : "secondary"}
                      >
                        {formatPrice(event.price)}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {event.description}
                        </p>
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(event.date)}</span>
                          {event.time && (
                            <>
                              <Clock className="h-4 w-4 ml-2" />
                              <span>{event.time}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>
                            {event.attendees} attending
                            {event.maxAttendees &&
                              ` / ${event.maxAttendees} max`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={event.organizer.avatar || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {event.organizer.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {event.organizer.name}
                        </span>
                        <div className="flex items-center gap-1 ml-auto">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">
                            {event.organizer.rating}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        {event.isAttending ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 bg-transparent"
                            onClick={() => handleLeaveEvent(event._id)}
                          >
                            <Ticket className="h-4 w-4 mr-1" />
                            Attending
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleJoinEvent(event._id)}
                          >
                            <CalendarPlus className="h-4 w-4 mr-1" />
                            Join Event
                          </Button>
                        )}
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

          {events?.data?.data?.length === 0 && (
            <Card className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or check back later for new
                events.
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="my-events">
          <Card>
            <CardHeader>
              <CardTitle>My Events</CardTitle>
              <CardDescription>
                Events you've created and are organizing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No events created yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first event to start building your community.
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attending">
          <Card>
            <CardHeader>
              <CardTitle>Events I'm Attending</CardTitle>
              <CardDescription>
                Events you've joined and plan to attend
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No events joined yet
                </h3>
                <p className="text-muted-foreground">
                  Events you join will appear here with all the details you
                  need.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
