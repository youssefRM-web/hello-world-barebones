import { useEffect, useCallback, useRef } from "react";
import { socketService } from "@/services/socketService";
import { CommentType } from "@/types";

interface CommentSocketOptions {
  taskId: string;
  onCommentCreated?: (comment: CommentType) => void;
  onReplyCreated?: (data: { parentCommentId: string; reply: CommentType }) => void;
  onReactionToggled?: (data: { commentId: string; reactions: any }) => void;
  onCommentDeleted?: (commentId: string) => void;
}

/**
 * Hook for real-time comment updates via WebSocket
 * Connects to the comments namespace and joins task-specific room
 */
export function useCommentSocket(options: CommentSocketOptions) {
  const { taskId, onCommentCreated, onReplyCreated, onReactionToggled, onCommentDeleted } = options;
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (!taskId) return;

    // Connect to comments namespace
    const socket = socketService.connect("comments");

    // Join task comments room when connected
    const handleConnect = () => {
      if (!hasJoinedRef.current) {
        socket.emit("joinTaskComments", taskId);
        hasJoinedRef.current = true;
      }
    };

    // If already connected, join immediately
    if (socket.connected && !hasJoinedRef.current) {
      socket.emit("joinTaskComments", taskId);
      hasJoinedRef.current = true;
    }

    socket.on("connect", handleConnect);

    // Listen for comment events
    const handleCommentCreated = (comment: CommentType) => {
      onCommentCreated?.(comment);
    };

    const handleReplyCreated = (data: { parentCommentId: string; reply: CommentType }) => {
    
      onReplyCreated?.(data);
    };

    const handleReactionToggled = (data: { commentId: string; reactions: any }) => {
    
      onReactionToggled?.(data);
    };

    const handleCommentDeleted = (commentId: string) => {
      
      onCommentDeleted?.(commentId);
    };

    socket.on("commentCreated", handleCommentCreated);
    socket.on("replyCreated", handleReplyCreated);
    socket.on("reactionToggled", handleReactionToggled);
    socket.on("commentDeleted", handleCommentDeleted);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("commentCreated", handleCommentCreated);
      socket.off("replyCreated", handleReplyCreated);
      socket.off("reactionToggled", handleReactionToggled);
      socket.off("commentDeleted", handleCommentDeleted);

      // Leave task comments room
      if (hasJoinedRef.current) {
        socket.emit("leaveTaskComments", taskId);
        hasJoinedRef.current = false;
      }
    };
  }, [taskId, onCommentCreated, onReplyCreated, onReactionToggled, onCommentDeleted]);

  // Emit function for sending events
  const emit = useCallback(
    (event: string, data?: any) => {
      const socket = socketService.getSocket("comments");
      if (socket?.connected) {
        socket.emit(event, data);
      }
    },
    []
  );

  return {
    emit,
    isConnected: socketService.getSocket("comments")?.connected ?? false,
  };
}
