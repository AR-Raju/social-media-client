"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { eventsApi } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bookmark,
  BookmarkCheck,
  Calendar,
  Clock,
  DollarSign,
  Heart,
  MapPin,
  MoreHorizontal,
  Share2,
  Star,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = params.id as string;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("details");

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => eventsApi.getEvent(eventId),
  });

  const { data: attendees, isLoading: attendeesLoading } = useQuery({
    queryKey: ["event-attendees", eventId],
    queryFn: () => eventsApi.getEventAttendees(eventId, 1, 20),
    enabled: activeTab === "attendees",
  });

  const joinEventMutation = useMutation({
    mutationFn: () => eventsApi.joinEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      toast({
        title: "Joined Event",
        description: "You have successfully joined the event!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to join event",
        variant: "destructive",
      });
    },
  });

  const leaveEventMutation = useMutation({
    mutationFn: () => eventsApi.leaveEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      toast({
        title: "Left Event",
        description: "You have left the event.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to leave event",
        variant: "destructive",
      });
    },
  });

  if (eventLoading) {
    return <EventDetailsSkeleton />;
  }

  const eventData = event?.data?.data;
  if (!eventData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
        <p className="text-muted-foreground">
          The event you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  const eventDate = new Date(eventData.date);
  const isUpcoming = eventDate > new Date();
  const isPast = eventDate < new Date();

  return (
    <div className="space-y-6">
      {/* Event Header Image */}
      <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
        {eventData.images && eventData.images.length > 0 ? (
          <img
            src={eventData.images[0] || "/placeholder.svg"}
            alt={eventData.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Calendar className="h-16 w-16 text-white" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/20" />

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {eventData.title}
              </h1>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{eventDate.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{eventData.time}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
              >
                {eventData.isSaved ? (
                  <BookmarkCheck className="h-4 w-4 text-white" />
                ) : (
                  <Bookmark className="h-4 w-4 text-white" />
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                  >
                    <MoreHorizontal className="h-4 w-4 text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Event
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Heart className="h-4 w-4 mr-2" />
                    Add to Favorites
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Event Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Main Event Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={eventData.organizer?.avatar || "/placeholder.svg"}
                    />
                    <AvatarFallback>
                      {eventData.organizer?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      Organized by {eventData.organizer?.name}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{eventData.organizer?.rating || 5.0}</span>
                    </div>
                  </div>
                </div>

                <Badge
                  variant={
                    isUpcoming ? "default" : isPast ? "secondary" : "outline"
                  }
                >
                  {isUpcoming ? "Upcoming" : isPast ? "Past" : "Ongoing"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {eventDate.toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {eventData.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {eventData.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {eventData.attendees} attending
                    </p>
                    {eventData.maxAttendees && (
                      <p className="text-sm text-muted-foreground">
                        {eventData.maxAttendees - eventData.attendees} spots
                        left
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {eventData.price === 0 ? "Free" : `$${eventData.price}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {eventData.price === 0
                        ? "No cost to attend"
                        : "Per person"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="font-semibold mb-3">About This Event</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {eventData.description}
                </p>
              </div>

              {eventData.tags && eventData.tags.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {eventData.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="attendees">Attendees</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Category</h4>
                    <Badge variant="outline">{eventData.category}</Badge>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Full Description</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {eventData.description}
                    </p>
                  </div>

                  {eventData.images && eventData.images.length > 1 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-3">Event Photos</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {eventData.images
                            .slice(1)
                            .map((image: string, index: number) => (
                              <img
                                key={index}
                                src={image || "/placeholder.svg"}
                                alt={`Event photo ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                            ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendees" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Attendees ({eventData.attendees})</CardTitle>
                </CardHeader>
                <CardContent>
                  {attendeesLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {attendees?.data?.data?.map((attendee: any) => (
                        <div
                          key={attendee._id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage
                                src={attendee.avatar || "/placeholder.svg"}
                              />
                              <AvatarFallback>
                                {attendee.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{attendee.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Joined{" "}
                                {new Date(
                                  attendee.joinedAt || eventData.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                        </div>
                      )) || (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">
                            No attendees yet
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Join/Leave Button */}
          <Card>
            <CardContent className="p-6">
              {eventData.isAttending ? (
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => leaveEventMutation.mutate()}
                  disabled={leaveEventMutation.isPending}
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  {leaveEventMutation.isPending ? "Leaving..." : "Leave Event"}
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => joinEventMutation.mutate()}
                  disabled={joinEventMutation.isPending || isPast}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {joinEventMutation.isPending
                    ? "Joining..."
                    : isPast
                    ? "Event Ended"
                    : "Join Event"}
                </Button>
              )}

              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {eventData.attendees} people attending
                </p>
                {eventData.maxAttendees && (
                  <p className="text-xs text-muted-foreground">
                    {eventData.maxAttendees - eventData.attendees} spots
                    remaining
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Organizer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Organizer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={eventData.organizer?.avatar || "/placeholder.svg"}
                  />
                  <AvatarFallback>
                    {eventData.organizer?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{eventData.organizer?.name}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{eventData.organizer?.rating || 5.0} rating</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full bg-transparent">
                View Profile
              </Button>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {eventDate.toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{eventData.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">
                  {eventData.price === 0 ? "Free" : `$${eventData.price}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <Badge variant="outline" className="text-xs">
                  {eventData.category}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function EventDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-64 md:h-80 w-full rounded-lg" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-8 rounded" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
