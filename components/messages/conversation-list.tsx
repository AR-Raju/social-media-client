"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import type { Conversation } from "@/types"

interface ConversationListProps {
  conversations: Conversation[]
  selectedUserId: string | null
  onSelectConversation: (userId: string) => void
}

export function ConversationList({ conversations, selectedUserId, onSelectConversation }: ConversationListProps) {
  return (
    <div className="space-y-1">
      {conversations.map((conversation) => {
        const otherParticipant = conversation.participants.find((p) => p._id !== conversation.participants[0]._id)
        const isSelected = selectedUserId === otherParticipant?._id

        return (
          <div
            key={conversation._id}
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
              isSelected ? "bg-muted" : ""
            }`}
            onClick={() => onSelectConversation(otherParticipant?._id || "")}
          >
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={otherParticipant?.avatar || "/placeholder.svg"} alt={otherParticipant?.name} />
                <AvatarFallback>{otherParticipant?.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              {otherParticipant?.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-semibold truncate">{otherParticipant?.name}</p>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(conversation.updatedAt))} ago
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
        )
      })}
    </div>
  )
}
