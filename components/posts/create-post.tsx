"use client";

import type React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { postsApi, uploadApi } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImageIcon, Loader2, MapPin, Smile, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const createPostSchema = z.object({
  content: z
    .string()
    .min(1, "Post content is required")
    .max(2000, "Post is too long"),
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

const feelings = [
  { emoji: "😊", label: "happy", color: "text-yellow-500" },
  { emoji: "😢", label: "sad", color: "text-blue-500" },
  { emoji: "😍", label: "loved", color: "text-red-500" },
  { emoji: "😴", label: "tired", color: "text-gray-500" },
  { emoji: "🎉", label: "excited", color: "text-purple-500" },
  { emoji: "😤", label: "frustrated", color: "text-orange-500" },
  { emoji: "🤔", label: "thoughtful", color: "text-indigo-500" },
  { emoji: "😎", label: "cool", color: "text-cyan-500" },
  { emoji: "🥳", label: "celebrating", color: "text-pink-500" },
  { emoji: "😌", label: "peaceful", color: "text-green-500" },
];

const activities = [
  { emoji: "🍕", label: "eating", activity: "pizza" },
  { emoji: "🎬", label: "watching", activity: "a movie" },
  { emoji: "📚", label: "reading", activity: "a book" },
  { emoji: "🎵", label: "listening to", activity: "music" },
  { emoji: "🏃", label: "exercising", activity: "" },
  { emoji: "✈️", label: "traveling to", activity: "" },
  { emoji: "🎮", label: "playing", activity: "games" },
  { emoji: "☕", label: "drinking", activity: "coffee" },
  { emoji: "🛍️", label: "shopping", activity: "" },
  { emoji: "🎨", label: "creating", activity: "art" },
];

export function CreatePost() {
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [location, setLocation] = useState("");
  const [selectedFeeling, setSelectedFeeling] = useState<{
    emoji: string;
    label: string;
    color: string;
  } | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<{
    emoji: string;
    label: string;
    activity: string;
  } | null>(null);
  const [customActivity, setCustomActivity] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showFeelingDialog, setShowFeelingDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      content: "",
    },
  });

  const createPostMutation = useMutation({
    mutationFn: postsApi.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      form.reset();
      setImages([]);
      setImageFiles([]);
      setLocation("");
      setSelectedFeeling(null);
      setSelectedActivity(null);
      setCustomActivity("");
      toast({
        title: "Post created successfully!",
        description: "Your post has been shared with your friends.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create post",
        description: error.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map((file) => uploadApi.uploadImage(file));
      const responses = await Promise.all(uploadPromises);
      const imageUrls = responses.map((response) => response.data.data.url);

      setImages((prev) => [...prev, ...imageUrls]);
      setImageFiles((prev) => [...prev, ...files]);
    } catch (error) {
      toast({
        title: "Failed to upload images",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreatePostFormData) => {
    let postContent = data.content;

    // Add feeling/activity to content
    if (selectedFeeling) {
      postContent += ` — feeling ${selectedFeeling.label} ${selectedFeeling.emoji}`;
    }
    if (selectedActivity) {
      const activityText = customActivity || selectedActivity.activity;
      postContent += ` — ${selectedActivity.label} ${activityText} ${selectedActivity.emoji}`;
    }

    createPostMutation.mutate({
      content: postContent,
      images: images,
      type: images.length > 0 ? "image" : "text",
      visibility: "public",
      location: location || undefined,
      feeling: selectedFeeling?.label,
      activity: selectedActivity
        ? {
            type: selectedActivity.label,
            description: customActivity || selectedActivity.activity,
          }
        : undefined,
    });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={user?.avatar || "/placeholder.svg"}
                  alt={user?.name}
                />
                <AvatarFallback>
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder={`What's on your mind, ${
                            user?.name?.split(" ")[0]
                          }?`}
                          className="min-h-[100px] resize-none border-none shadow-none focus-visible:ring-0 text-lg"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Feeling/Activity Display */}
            {(selectedFeeling || selectedActivity) && (
              <div className="flex items-center gap-2 px-3 py-2 bg-accent/50 rounded-lg">
                {selectedFeeling && (
                  <div className="flex items-center gap-1">
                    <span>feeling</span>
                    <span className={selectedFeeling.color}>
                      {selectedFeeling.label} {selectedFeeling.emoji}
                    </span>
                  </div>
                )}
                {selectedActivity && (
                  <div className="flex items-center gap-1">
                    {selectedFeeling && <span>—</span>}
                    <span>{selectedActivity.label}</span>
                    <span>
                      {customActivity || selectedActivity.activity}{" "}
                      {selectedActivity.emoji}
                    </span>
                  </div>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFeeling(null);
                    setSelectedActivity(null);
                    setCustomActivity("");
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Location */}
            {location && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={isUploading}
                />
                <label htmlFor="image-upload">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    disabled={isUploading}
                    asChild
                  >
                    <span>
                      {isUploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ImageIcon className="mr-2 h-4 w-4" />
                      )}
                      Photo
                    </span>
                  </Button>
                </label>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => {
                    const loc = prompt("Add location:");
                    if (loc) setLocation(loc);
                  }}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Location
                </Button>

                <Dialog
                  open={showFeelingDialog}
                  onOpenChange={setShowFeelingDialog}
                >
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                    >
                      <Smile className="mr-2 h-4 w-4" />
                      Feeling/Activity
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>How are you feeling?</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Feelings</h4>
                        <div className="grid grid-cols-5 gap-2">
                          {feelings.map((feeling) => (
                            <Button
                              key={feeling.label}
                              type="button"
                              variant={
                                selectedFeeling?.label === feeling.label
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              className="flex flex-col h-auto p-2"
                              onClick={() => setSelectedFeeling(feeling)}
                            >
                              <span className="text-lg">{feeling.emoji}</span>
                              <span className="text-xs">{feeling.label}</span>
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Activities</h4>
                        <div className="grid grid-cols-5 gap-2">
                          {activities.map((activity) => (
                            <Button
                              key={activity.label}
                              type="button"
                              variant={
                                selectedActivity?.label === activity.label
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              className="flex flex-col h-auto p-2"
                              onClick={() => setSelectedActivity(activity)}
                            >
                              <span className="text-lg">{activity.emoji}</span>
                              <span className="text-xs">{activity.label}</span>
                            </Button>
                          ))}
                        </div>
                      </div>

                      {selectedActivity && (
                        <div>
                          <label className="text-sm font-medium">
                            Custom activity (optional)
                          </label>
                          <input
                            type="text"
                            placeholder={`e.g., ${selectedActivity.activity}`}
                            value={customActivity}
                            onChange={(e) => setCustomActivity(e.target.value)}
                            className="w-full mt-1 px-3 py-2 border rounded-md"
                          />
                        </div>
                      )}

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowFeelingDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setShowFeelingDialog(false)}
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Button
                type="submit"
                disabled={
                  createPostMutation.isPending || !form.watch("content").trim()
                }
              >
                {createPostMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Post
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
