"use client";

import { ChatWindow } from "@/components/messages/chat-window";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { messagesApi } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function MessagesPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const { data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => messagesApi.getConversations(20),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Handle URL parameter for direct message
  useEffect(() => {
    const userId = searchParams.get("user");
    if (userId) {
      setSelectedUserId(userId);
    }
  }, [searchParams]);

  const filteredConversations =
    conversations?.data?.data?.filter((conv: any) =>
      conv.participants.some((p: any) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ) || [];

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r bg-background flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredConversations.length > 0 ? (
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation: any) => {
                const otherParticipant = conversation.participants.find(
                  (p: any) => p._id !== user?._id
                );
                console.log("otherParticipant", otherParticipant);
                const isSelected = selectedUserId === otherParticipant?._id;

                return (
                  <div
                    key={conversation._id}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                      isSelected ? "bg-muted" : ""
                    }`}
                    onClick={() => setSelectedUserId(otherParticipant?._id)}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={otherParticipant?.avatar || "/placeholder.svg"}
                          alt={otherParticipant?.name}
                        />
                        <AvatarFallback>
                          {otherParticipant?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {otherParticipant?.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold truncate">
                          {otherParticipant?.name}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(
                            new Date(conversation.updatedAt)
                          )}{" "}
                          ago
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage?.content || "No messages yet"}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No conversations</h3>
              <p className="text-muted-foreground text-center text-sm">
                Start a conversation by sending a message to a friend!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1">
        {selectedUserId ? (
          <ChatWindow userId={selectedUserId} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Select a conversation
            </h2>
            <p className="text-muted-foreground">
              Choose a conversation from the sidebar to start messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
