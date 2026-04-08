import { useEffect, useCallback, useRef } from "react";
import { socketService, SocketNamespace } from "@/services/socketService";
import { useCurrentUserQuery } from "@/hooks/queries";

interface UseSocketOptions {
  namespace: SocketNamespace;
  autoJoinOrg?: boolean;
}

interface SocketEventHandler<T = any> {
  event: string;
  handler: (data: T) => void;
}

/**
 * Reusable hook for Socket.IO connections
 * Automatically connects to namespace and joins organization room
 * Uses refs for handlers to always call the latest version without re-triggering the effect.
 */
export function useSocket<T = any>(
  options: UseSocketOptions,
  eventHandlers: SocketEventHandler<T>[] = []
) {
  const { namespace, autoJoinOrg = true } = options;
  const { data: currentUser } = useCurrentUserQuery();
  const organizationId = currentUser?.Organization_id?._id;
  const hasJoinedRef = useRef(false);

  // Keep a ref that always points to the latest handlers
  const handlersRef = useRef(eventHandlers);
  handlersRef.current = eventHandlers;

  // Connect and setup event handlers
  useEffect(() => {
    const socket = socketService.connect(namespace);

    // Create stable wrapper functions that delegate to the latest handlers via ref
    const wrappers = handlersRef.current.map(({ event }) => {
      const wrapper = (data: any) => {
        const current = handlersRef.current.find((h) => h.event === event);
        current?.handler(data);
      };
      socket.on(event, wrapper);
      return { event, wrapper };
    });

    // Join organization room when connected
    const handleConnect = () => {
      if (autoJoinOrg && organizationId && !hasJoinedRef.current) {
        socketService.joinOrganization(namespace, organizationId);
        hasJoinedRef.current = true;
      }
    };

    // If already connected, join immediately
    if (socket.connected && autoJoinOrg && organizationId && !hasJoinedRef.current) {
      socketService.joinOrganization(namespace, organizationId);
      hasJoinedRef.current = true;
    }

    socket.on("connect", handleConnect);

    return () => {
      socket.off("connect", handleConnect);
      // Remove the stable wrappers
      wrappers.forEach(({ event, wrapper }) => {
        socket.off(event, wrapper);
      });
      // Leave organization room
      if (autoJoinOrg && organizationId && hasJoinedRef.current) {
        socketService.leaveOrganization(namespace, organizationId);
        hasJoinedRef.current = false;
      }
    };
  }, [namespace, organizationId, autoJoinOrg]);

  // Emit function
  const emit = useCallback(
    (event: string, data?: any) => {
      const socket = socketService.getSocket(namespace);
      if (socket?.connected) {
        socket.emit(event, data);
      }
    },
    [namespace]
  );

  return {
    emit,
    isConnected: socketService.getSocket(namespace)?.connected ?? false,
  };
}
