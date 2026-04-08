import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, AtSign } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage } from "@/contexts/LanguageContext";

interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onMentionSelect: (username: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  currentUser?: any;
  isReply?: boolean;
}

// Mock user data for tagging - replace with real data later
const mockUsers = [
  { username: "john_doe", name: "John Doe", avatar: "", role: "Manager" },
  { username: "jane_smith", name: "Jane Smith", avatar: "", role: "Developer" },
  { username: "mike_wilson", name: "Mike Wilson", avatar: "", role: "Designer" },
  { username: "sarah_johnson", name: "Sarah Johnson", avatar: "", role: "Analyst" },
];

export function CommentInput({
  value,
  onChange,
  onSend,
  onMentionSelect,
  placeholder,
  isLoading = false,
  currentUser,
  isReply = false
}: CommentInputProps) {
  const { t } = useLanguage();
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const initials = (user: any) =>
    user?.Name?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  // Handle @ symbol typing to trigger mention popup
  const handleInputChange = (newValue: string) => {
    onChange(newValue);

    // Check if user typed @ symbol
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      const shouldShowMentions = 
        (lastAtIndex === 0 || textBeforeCursor[lastAtIndex - 1] === " ") &&
        !textAfterAt.includes(" ");
      
      if (shouldShowMentions) {
        setMentionQuery(textAfterAt);
        setShowMentions(true);
        setCursorPosition(cursorPos);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionClick = (username: string) => {
    const cursorPos = cursorPosition;
    const textBeforeCursor = value.slice(0, cursorPos);
    const textAfterCursor = value.slice(cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    
    if (lastAtIndex !== -1) {
      const newText = 
        textBeforeCursor.slice(0, lastAtIndex) + 
        `@${username} ` + 
        textAfterCursor;
      onChange(newText);
    }
    
    setShowMentions(false);
    setMentionQuery("");
    
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onSend();
    }
  };

  const filteredUsers = mockUsers.filter(user =>
    user.username.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    user.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        {/* Current User Avatar */}
        <Avatar className={isReply ? "h-6 w-6" : "h-8 w-8"}>
          {currentUser?.profile_picture ? (
            <AvatarImage
              src={currentUser.profile_picture}
              alt={currentUser.Name || "Profile"}
            />
          ) : (
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials(currentUser)}
            </AvatarFallback>
          )}
        </Avatar>

        {/* Input Area */}
        <div className="flex-1 space-y-2">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder || t("comments.writeComment")}
              className={`resize-none ${isReply ? "min-h-[60px]" : "min-h-[80px]"} pr-12`}
            />
            
            {/* @ Mention Button */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                  onClick={() => {
                    const currentValue = value;
                    const newValue = currentValue + (currentValue && !currentValue.endsWith(" ") ? " @" : "@");
                    onChange(newValue);
                    setTimeout(() => {
                      textareaRef.current?.focus();
                      const newPos = newValue.length;
                      textareaRef.current?.setSelectionRange(newPos, newPos);
                    }, 0);
                  }}
                >
                  <AtSign className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" side="top">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  {t("comments.clickToAddMention")}
                </div>
                <div className="space-y-1">
                  {mockUsers.slice(0, 4).map((user) => (
                    <button
                      key={user.username}
                      onClick={() => {
                        onMentionSelect(user.username);
                      }}
                      className="w-full flex items-center gap-2 p-2 text-left hover:bg-accent rounded-sm"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">@{user.username}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Auto-complete mentions popup */}
            {showMentions && filteredUsers.length > 0 && (
              <div className="absolute z-50 mt-1 w-64 bg-popover border border-border rounded-md shadow-lg p-2">
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  {t("comments.selectUserToMention")}
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.username}
                      onClick={() => handleMentionClick(user.username)}
                      className="w-full flex items-center gap-2 p-2 text-left hover:bg-accent rounded-sm"
                    >
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">@{user.username}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Send Button and Shortcuts */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {t("comments.pressCtrlEnter")}
            </div>
            <Button
              onClick={onSend}
              disabled={!value.trim() || isLoading}
              size="sm"
              className="h-8"
            >
              <Send className="h-3 w-3 mr-1" />
              {isLoading ? t("comments.sending") : t("comments.send")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
