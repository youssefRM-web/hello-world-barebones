import { ReactNode } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Building } from "lucide-react";

interface UserMentionPopoverProps {
  username: string;
  children: ReactNode;
}

// Mock user data - replace with real API call later
const getUserInfo = (username: string) => {
  const mockUsers: Record<string, any> = {
    john_doe: {
      name: "John Doe",
      email: "john.doe@company.com",
      role: "Project Manager",
      department: "Operations",
      avatar: "",
      status: "online",
      location: "New York, USA"
    },
    jane_smith: {
      name: "Jane Smith",
      email: "jane.smith@company.com",
      role: "Senior Developer",
      department: "Engineering",
      avatar: "",
      status: "away",
      location: "San Francisco, USA"
    },
    mike_wilson: {
      name: "Mike Wilson",
      email: "mike.wilson@company.com",
      role: "UI/UX Designer",
      department: "Design",
      avatar: "",
      status: "online",
      location: "London, UK"
    },
    sarah_johnson: {
      name: "Sarah Johnson",
      email: "sarah.johnson@company.com",
      role: "Business Analyst",
      department: "Strategy",
      avatar: "",
      status: "offline",
      location: "Toronto, Canada"
    }
  };

  return mockUsers[username] || {
    name: username,
    email: `${username}@company.com`,
    role: "Team Member",
    department: "General",
    avatar: "",
    status: "unknown",
    location: "Unknown"
  };
};

export function UserMentionPopover({ username, children }: UserMentionPopoverProps) {
  const userInfo = getUserInfo(username);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="right">
        <div className="space-y-4">
          {/* Header with Avatar and Basic Info */}
          <div className="flex items-start gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                {userInfo.avatar ? (
                  <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
                ) : (
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initials(userInfo.name)}
                  </AvatarFallback>
                )}
              </Avatar>
              {/* Status indicator */}
              <div
                className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(
                  userInfo.status
                )}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-foreground">
                {userInfo.name}
              </h4>
              <p className="text-sm text-muted-foreground">@{username}</p>
              <Badge variant="secondary" className="mt-1 text-xs">
                {userInfo.role}
              </Badge>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-2 border-t pt-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{userInfo.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{userInfo.department}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{userInfo.location}</span>
            </div>
          </div>

          {/* Status */}
          <div className="border-t pt-3">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${getStatusColor(userInfo.status)}`}
              />
              <span className="text-sm text-muted-foreground first-letter:uppercase">
                {userInfo.status}
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}