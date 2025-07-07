"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const trendingTopics = [
  { tag: "NextJS", posts: 1234, trend: "+12%" },
  { tag: "React", posts: 987, trend: "+8%" },
  { tag: "TypeScript", posts: 756, trend: "+15%" },
  { tag: "TailwindCSS", posts: 543, trend: "+5%" },
  { tag: "WebDev", posts: 432, trend: "+20%" },
];

export function TrendingTopicsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Trending Topics
        </CardTitle>
        <CardDescription>Popular hashtags and topics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {trendingTopics.map((topic, index) => (
          <div
            key={topic.tag}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {index + 1}
              </span>
              <div>
                <p className="font-medium text-sm">#{topic.tag}</p>
                <p className="text-xs text-muted-foreground">
                  {topic.posts.toLocaleString()} posts
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {topic.trend}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
