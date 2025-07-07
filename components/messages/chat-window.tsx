"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { useSocket } from "@/context/socket-context";
import { useToast } from "@/hooks/use-toast";
import { messagesApi, usersApi } from "@/services/api";
import type { Message } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Info, Phone, Send, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const messageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message is too long"),
});

type MessageFormData = z.infer<typeof messageSchema>;

interface ChatWindowProps {
  userId: string;
}

export function ChatWindow({ userId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { socket } = useSocket();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: "" },
  });

  const { data: otherUser } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => usersApi.getProfile(userId),
  });

  const { data: messagesData } = useQuery({
    queryKey: ["messages", userId],
    queryFn: () => messagesApi.getMessages(userId, 50, 1),
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (messagesData) {
      setMessages(messagesData.data.data.reverse());
      // Mark messages as read
      messagesApi.markAsRead(userId);
    }
  }, [messagesData, userId]);

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      messagesApi.sendMessage(userId, { content, type: "text" }),
    onSuccess: (data) => {
      setMessages((prev) => [...prev, data.data.data]);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send message",
        description: error.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      if (message.sender._id === userId || message.receiver._id === userId) {
        setMessages((prev) => [...prev, message]);
        // Mark as read if window is focused
        if (document.hasFocus()) {
          messagesApi.markAsRead(userId);
        }
      }
    };

    const handleTyping = (data: { userId: string; isTyping: boolean }) => {
      if (data.userId === userId) {
        setIsTyping(data.isTyping);
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("typing", handleTyping);
    };
  }, [socket, userId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Typing indicator
  useEffect(() => {
    if (!socket) return;

    const content = form.watch("content");
    const isCurrentlyTyping = content.length > 0;

    socket.emit("typing", { userId, isTyping: isCurrentlyTyping });

    const timer = setTimeout(() => {
      socket.emit("typing", { userId, isTyping: false });
    }, 1000);

    return () => clearTimeout(timer);
  }, [form.watch("content"), socket, userId]);

  const onSubmit = (data: MessageFormData) => {
    sendMessageMutation.mutate(data.content);
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={otherUser?.data?.data?.avatar || "/placeholder.svg"}
                alt={otherUser?.data?.data?.name}
              />
              <AvatarFallback>
                {otherUser?.data?.data?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {otherUser?.data?.data?.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
            )}
          </div>
          <div>
            <h2 className="font-semibold">{otherUser?.data?.data?.name}</h2>
            <p className="text-sm text-muted-foreground">
              {otherUser?.data?.data?.isOnline
                ? "Online"
                : `Last seen ${formatDistanceToNow(
                    new Date(otherUser?.data?.data?.lastSeen || Date.now())
                  )} ago`}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {Object.entries(messageGroups).map(([date, dayMessages]) => (
          <div key={date}>
            <div className="flex justify-center mb-4">
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {new Date(date).toLocaleDateString()}
              </span>
            </div>
            {dayMessages.map((message) => {
              const isOwn = message.sender._id === user?._id;
              return (
                <div
                  key={message._id}
                  className={`flex ${
                    isOwn ? "justify-end" : "justify-start"
                  } mb-2`}
                >
                  <div
                    className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                      isOwn ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    {!isOwn && (
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={message.sender.avatar || "/placeholder.svg"}
                          alt={message.sender.name}
                        />
                        <AvatarFallback>
                          {message.sender.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwn
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {isOwn && message.isRead && (
                          <span className="ml-1">✓✓</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={otherUser?.data?.data?.avatar || "/placeholder.svg"}
                  alt={otherUser?.data?.data?.name}
                />
                <AvatarFallback>
                  {otherUser?.data?.data?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg px-3 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  />
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex space-x-2"
          >
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      placeholder="Type a message..."
                      {...field}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          form.handleSubmit(onSubmit)();
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              size="icon"
              disabled={
                sendMessageMutation.isPending || !form.watch("content").trim()
              }
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
