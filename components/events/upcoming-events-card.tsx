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
import { toast } from "@/hooks/use-toast";
import { eventsApi } from "@/services/api";
import type { Event } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  CalendarPlus,
  Clock,
  MapPin,
  Star,
  Ticket,
  Users,
} from "lucide-react";

export function UpcomingEventsCard() {
  const queryClient = useQueryClient();

  const { data: upcomingEvents, isLoading } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: () => eventsApi.getEvents(1, 5),
  });

  const joinEventMutation = useMutation({
    mutationFn: eventsApi.joinEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upcoming-events"] });
      toast({
        title: "Event Joined",
        description: "You've successfully joined this event!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to join event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const events = upcomingEvents?.data?.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Upcoming Events
        </CardTitle>
        <CardDescription>
          Don't miss out on these exciting events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.length > 0 ? (
          events.slice(0, 5).map((event: Event) => (
            <div
              key={event._id}
              className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  {event.images?.[0] ? (
                    <img
                      src={event.images[0] || "/placeholder.svg"}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Calendar className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                {isEventSoon(event.date) && (
                  <div className="absolute -top-1 -right-1">
                    <Badge className="bg-red-500 hover:bg-red-600 text-xs px-1 py-0">
                      Soon
                    </Badge>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm line-clamp-1">
                  {event.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(event.date)}</span>
                  {event.time && (
                    <>
                      <Clock className="h-3 w-3 ml-1" />
                      <span>{event.time}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <Avatar className="h-4 w-4">
                        <AvatarImage
                          src={event.organizer.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback className="text-xs">
                          {event.organizer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-muted-foreground">
                        {event.organizer.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{event.organizer.rating}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {formatPrice(event.price)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{event.attendees} attending</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                {event.isAttending ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 bg-transparent"
                  >
                    <Ticket className="h-3 w-3 mr-1" />
                    Attending
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => joinEventMutation.mutate(event._id)}
                    disabled={joinEventMutation.isPending}
                  >
                    <CalendarPlus className="h-3 w-3 mr-1" />
                    Join
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No upcoming events</h3>
            <p className="text-sm text-muted-foreground">
              Check back later for new events in your area.
            </p>
          </div>
        )}

        {events.length > 0 && (
          <div className="pt-2 border-t">
            <Button variant="ghost" className="w-full text-sm">
              View All Events
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
