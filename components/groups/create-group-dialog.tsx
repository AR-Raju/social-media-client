"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { groupsApi, uploadApi } from "@/services/api"
import { Loader2, Upload } from "lucide-react"

const createGroupSchema = z.object({
  name: z.string().min(2, "Group name must be at least 2 characters").max(100, "Group name is too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description is too long"),
  category: z.string().min(1, "Please select a category"),
  privacy: z.enum(["public", "private"]),
  tags: z.string().optional(),
  rules: z.string().optional(),
})

type CreateGroupFormData = z.infer<typeof createGroupSchema>

interface CreateGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const [avatar, setAvatar] = useState<string>("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<CreateGroupFormData>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      privacy: "public",
      tags: "",
      rules: "",
    },
  })

  const categories = [
    "Technology",
    "Sports",
    "Music",
    "Art",
    "Business",
    "Education",
    "Gaming",
    "Travel",
    "Food",
    "Health",
    "Science",
    "Entertainment",
  ]

  const createGroupMutation = useMutation({
    mutationFn: groupsApi.createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      toast({
        title: "Group created successfully!",
        description: "Your group has been created and you are now the admin.",
      })
      onOpenChange(false)
      form.reset()
      setAvatar("")
      setAvatarFile(null)
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create group",
        description: error.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      })
    },
  })

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatar(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: CreateGroupFormData) => {
    try {
      let avatarUrl = ""

      // Upload avatar if selected
      if (avatarFile) {
        setIsUploading(true)
        const uploadResponse = await uploadApi.uploadImage(avatarFile)
        avatarUrl = uploadResponse.data.url
        setIsUploading(false)
      }

      const groupData = {
        ...data,
        avatar: avatarUrl,
        tags: data.tags
          ? data.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        rules: data.rules
          ? data.rules
              .split("\n")
              .map((rule) => rule.trim())
              .filter(Boolean)
          : [],
      }

      createGroupMutation.mutate(groupData)
    } catch (error) {
      setIsUploading(false)
      toast({
        title: "Failed to upload image",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>Create a group to bring people together around shared interests.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-2">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {avatar ? (
                    <img src={avatar || "/placeholder.svg"} alt="Group avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
              </div>
              <p className="text-xs text-muted-foreground">Upload group picture (optional)</p>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter group name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what your group is about..."
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full px-3 py-2 border rounded-md bg-background">
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="privacy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Privacy</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="public" id="public" />
                        <Label htmlFor="public" className="flex-1">
                          <div>
                            <p className="font-medium">Public</p>
                            <p className="text-sm text-muted-foreground">Anyone can see and join this group</p>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="private" id="private" />
                        <Label htmlFor="private" className="flex-1">
                          <div>
                            <p className="font-medium">Private</p>
                            <p className="text-sm text-muted-foreground">
                              Only members can see posts and join by invitation
                            </p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter tags separated by commas" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">e.g. programming, javascript, web development</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rules"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Rules (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter group rules, one per line..."
                      className="min-h-[60px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">Each line will be a separate rule</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createGroupMutation.isPending || isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createGroupMutation.isPending || isUploading}>
                {(createGroupMutation.isPending || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Group
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
