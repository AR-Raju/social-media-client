"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "./auth-context";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Only connect if user is authenticated and not loading
    if (!isLoading && user) {
      const token = localStorage.getItem("auth_token");

      if (token) {
        console.log("Connecting to Socket.IO server...");

        const socketInstance = io(
          process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000",
          {
            auth: {
              token,
            },
            transports: ["websocket", "polling"],
            reconnectionAttempts: 3,
            reconnectionDelay: 1000,
          }
        );

        socketInstance.on("connect", () => {
          console.log("Socket.IO connected");
          setIsConnected(true);
        });

        socketInstance.on("disconnect", () => {
          console.log("Socket.IO disconnected");
          setIsConnected(false);
        });

        socketInstance.on("connect_error", (error) => {
          console.error("Socket.IO connection error:", error);
          setIsConnected(false);
        });

        socketInstance.on("onlineUsers", (users: string[]) => {
          setOnlineUsers(users);
        });

        socketInstance.on("newMessage", (message) => {
          console.log("New message received:", message);
          // Handle new message
        });

        socketInstance.on("newNotification", (notification) => {
          console.log("New notification received:", notification);
          // Handle new notification
        });

        setSocket(socketInstance);

        return () => {
          console.log("Cleaning up Socket.IO connection");
          socketInstance.disconnect();
          setSocket(null);
          setIsConnected(false);
          setOnlineUsers([]);
        };
      }
    } else if (!user && socket) {
      // User logged out, disconnect socket
      console.log("User logged out, disconnecting socket");
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setOnlineUsers([]);
    }
  }, [user, isLoading]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
