"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { postsApi, uploadApi } from "@/services/api"
import { ImageIcon, MapPin, Smile, X, Loader2 } from "lucide-react"

const createPostSchema = z.object({
  content: z.string().min(1, "Post content is required").max(2000, "Post is too long"),
})

type CreatePostFormData = z.infer<typeof createPostSchema>

export function CreatePost() {
  const [images, setImages] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [location, setLocation] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      content: "",
    },
  })

  const createPostMutation = useMutation({
    mutationFn: postsApi.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      form.reset()
      setImages([])
      setImageFiles([])
      setLocation("")
      toast({
        title: "Post created successfully!",
        description: "Your post has been shared with your friends.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create post",
        description: error.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      })
    },
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setIsUploading(true)
    try {
      const uploadPromises = files.map((file) => uploadApi.uploadImage(file))
      const responses = await Promise.all(uploadPromises)
      const imageUrls = responses.map((response) => response.data.url)

      setImages((prev) => [...prev, ...imageUrls])
      setImageFiles((prev) => [...prev, ...files])
    } catch (error) {
      toast({
        title: "Failed to upload images",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: CreatePostFormData) => {
    createPostMutation.mutate({
      content: data.content,
      images: images,
      type: images.length > 0 ? "image" : "text",
      visibility: "public",
      location: location || undefined,
    })
  }

  return (
    <Card>
      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder={`What's on your mind, ${user?.name?.split(" ")[0]}?`}
                          className="min-h-[100px] resize-none border-none shadow-none focus-visible:ring-0 text-lg"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
                <Button type="button" variant="ghost" size="sm" onClick={() => setLocation("")}>
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
                    const loc = prompt("Add location:")
                    if (loc) setLocation(loc)
                  }}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Location
                </Button>

                <Button type="button" variant="ghost" size="sm" className="text-muted-foreground">
                  <Smile className="mr-2 h-4 w-4" />
                  Feeling
                </Button>
              </div>

              <Button type="submit" disabled={createPostMutation.isPending || !form.watch("content").trim()}>
                {createPostMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Post
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
