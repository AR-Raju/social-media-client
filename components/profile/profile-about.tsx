"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, LinkIcon, Briefcase, GraduationCap, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { User } from "@/types"

interface ProfileAboutProps {
  user: User
  isOwnProfile: boolean
}

export function ProfileAbout({ user, isOwnProfile }: ProfileAboutProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.bio && (
            <div>
              <h4 className="font-semibold mb-2">Bio</h4>
              <p className="text-muted-foreground">{user.bio}</p>
            </div>
          )}

          <div className="space-y-3">
            {user.work && (
              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Works at {user.work}</span>
              </div>
            )}

            {user.education && (
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Studied at {user.education}</span>
              </div>
            )}

            {user.location && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Lives in {user.location}</span>
              </div>
            )}

            {user.website && (
              <div className="flex items-center space-x-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {user.website}
                </a>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Joined {formatDistanceToNow(new Date(user.createdAt))} ago</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Profile Visibility</h4>
            <Badge variant="outline">{user.privacy?.profileVisibility || "public"}</Badge>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Friend List Visibility</h4>
            <Badge variant="outline">{user.privacy?.friendListVisibility || "friends"}</Badge>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Post Visibility</h4>
            <Badge variant="outline">{user.privacy?.postVisibility || "friends"}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
