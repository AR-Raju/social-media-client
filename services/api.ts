import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

console.log("API initialized with base URL:", API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console?.error("API Error:", {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
    });

    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      document.cookie =
        "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data: { email: string; password: string }) => {
    console.log("Making login request...");
    return api.post("/auth/login", data);
  },
  register: (data: any) => {
    console.log("Making register request...");
    return api.post("/auth/register", data);
  },
  getCurrentUser: () => {
    console.log("Getting current user...");
    return api.get("/auth/me");
  },
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    api.post("/auth/change-password", data),
  logout: () => api.post("/auth/logout"),
};

// Users API
export const usersApi = {
  updateProfile: (data: any) => api.patch("/users/me", data),
  getProfile: (userId: string) => api.get(`/users/${userId}`),
  searchUsers: (searchTerm: string, limit = 10) =>
    api.get(`/users/search?searchTerm=${searchTerm}&limit=${limit}`),
  getUserFriends: (userId: string, limit = 20) =>
    api.get(`/users/${userId}/friends?limit=${limit}`),
  getUserGroups: (userId: string, limit = 20) =>
    api.get(`/users/${userId}/groups?limit=${limit}`),
  blockUser: (userId: string) => api.post(`/users/block/${userId}`),
  unblockUser: (userId: string) => api.post(`/users/unblock/${userId}`),
};

// Posts API
export const postsApi = {
  createPost: (data: any) => api.post("/posts", data),
  getFeedPosts: (limit = 10, page = 1) =>
    api.get(`/posts?limit=${limit}&page=${page}&sort=-createdAt`),
  getPost: (postId: string) => api.get(`/posts/${postId}`),
  updatePost: (postId: string, data: any) =>
    api.patch(`/posts/${postId}`, data),
  deletePost: (postId: string) => api.delete(`/posts/${postId}`),
  reactToPost: (postId: string, type: string) =>
    api.post(`/posts/${postId}/react`, { type }),
  sharePost: (postId: string, content?: string) =>
    api.post(`/posts/${postId}/share`, { content }),
  getUserPosts: (userId: string, limit = 10, page = 1) =>
    api.get(`/posts/user/${userId}?limit=${limit}&page=${page}`),
};

// Comments API
export const commentsApi = {
  addComment: (postId: string, data: any) =>
    api.post(`/comments/post/${postId}`, data),
  getPostComments: (postId: string, limit = 20, page = 1) =>
    api.get(
      `/comments/post/${postId}?limit=${limit}&page=${page}&sort=-createdAt`
    ),
  getComment: (commentId: string) => api.get(`/comments/${commentId}`),
  updateComment: (commentId: string, data: any) =>
    api.patch(`/comments/${commentId}`, data),
  deleteComment: (commentId: string) => api.delete(`/comments/${commentId}`),
  reactToComment: (commentId: string, type: string) =>
    api.post(`/comments/${commentId}/react`, { type }),
  getCommentReplies: (commentId: string, limit = 10) =>
    api.get(`/comments/${commentId}/replies?limit=${limit}`),
};

// Friends API
export const friendsApi = {
  sendFriendRequest: (userId: string, message?: string) =>
    api.post(`/friends/request/${userId}`, { message }),
  acceptFriendRequest: (requestId: string) =>
    api.post(`/friends/accept/${requestId}`),
  rejectFriendRequest: (requestId: string) =>
    api.post(`/friends/reject/${requestId}`),
  removeFriend: (userId: string) => api.delete(`/friends/remove/${userId}`),
  getFriendsList: (limit = 50, searchTerm?: string) =>
    api.get(
      `/friends/list?limit=${limit}${
        searchTerm ? `&searchTerm=${searchTerm}` : ""
      }`
    ),
  getFriendRequests: (limit = 20) =>
    api.get(`/friends/requests?limit=${limit}`),
  getSentFriendRequests: (limit = 20) =>
    api.get(`/friends/requests/sent?limit=${limit}`),
  getFriendSuggestions: (limit = 10) =>
    api.get(`/friends/suggestions?limit=${limit}`),
};

// Messages API
export const messagesApi = {
  sendMessage: (userId: string, data: any) =>
    api.post(`/messages/send/${userId}`, data),
  getConversations: (limit = 20) =>
    api.get(`/messages/conversations?limit=${limit}`),
  getMessages: (userId: string, limit = 50, page = 1) =>
    api.get(`/messages/${userId}?limit=${limit}&page=${page}`),
  markAsRead: (userId: string) => api.patch(`/messages/${userId}/read`),
};

// Groups API
export const groupsApi = {
  createGroup: (data: any) => api.post("/groups/create", data),
  getAllGroups: (limit = 20, category?: string, privacy = "public") =>
    api.get(
      `/groups?limit=${limit}${
        category ? `&category=${category}` : ""
      }&privacy=${privacy}`
    ),
  getGroup: (groupId: string) => api.get(`/groups/${groupId}`),
  updateGroup: (groupId: string, data: any) =>
    api.patch(`/groups/${groupId}`, data),
  joinGroup: (groupId: string) => api.post(`/groups/${groupId}/join`),
  leaveGroup: (groupId: string) => api.post(`/groups/${groupId}/leave`),
  getGroupPosts: (groupId: string, limit = 20) =>
    api.get(`/groups/${groupId}/posts?limit=${limit}&sort=-createdAt`),
  getMyGroups: (limit = 50) => api.get(`/groups/user?limit=${limit}`),
  getGroupSuggestions: (limit = 10) =>
    api.get(`/groups/suggestions?limit=${limit}`),
  deleteGroup: (groupId: string) => api.delete(`/groups/${groupId}`),
};

// Notifications API
export const notificationsApi = {
  getNotifications: (limit = 20, page = 1, isRead?: boolean) =>
    api.get(
      `/notifications?limit=${limit}&page=${page}${
        isRead !== undefined ? `&isRead=${isRead}` : ""
      }`
    ),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markAsRead: (notificationIds?: string[], markAll = false) =>
    api.patch("/notifications/mark-read", { notificationIds, markAll }),
  deleteNotification: (notificationId: string) =>
    api.delete(`/notifications/${notificationId}`),
};

// Upload API
export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default api;
