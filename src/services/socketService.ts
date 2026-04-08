import { io, Socket } from "socket.io-client";
import { apiUrl } from "./api";

export type SocketNamespace = "issues" | "comments" | "notifications" | "accepted-issues";

interface SocketEventHandlers {
  [event: string]: (data: any) => void;
}

class SocketService {
  private sockets: Map<SocketNamespace, Socket> = new Map();
  private eventHandlers: Map<SocketNamespace, SocketEventHandlers> = new Map();

  /**
   * Connect to a specific namespace
   */
  connect(namespace: SocketNamespace, _opts?: Record<string, any>): Socket {
    if (this.sockets.has(namespace)) {
      return this.sockets.get(namespace)!;
    }

    // Remove trailing slash from apiUrl if present
    const baseUrl = apiUrl?.replace(/\/$/, "") || "";

    // Build connection options
    const socketOptions: any = {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    };

    const socket = io(`${baseUrl}/${namespace}`, socketOptions);

    socket.on("connect", () => {

    });

    socket.on("disconnect", (reason) => {
    });

    socket.on("connect_error", (error) => {
    });

    this.sockets.set(namespace, socket);
    this.eventHandlers.set(namespace, {});

    return socket;
  }

  /**
   * Get existing socket or create new one
   */
  getSocket(namespace: SocketNamespace): Socket | null {
    return this.sockets.get(namespace) || null;
  }

  /**
   * Join an organization room
   */
  joinOrganization(namespace: SocketNamespace, orgId: string): void {
    const socket = this.sockets.get(namespace);
    if (socket?.connected) {
      socket.emit("joinOrganization", orgId);
    }
  }

  /**
   * Leave an organization room
   */
  leaveOrganization(namespace: SocketNamespace, orgId: string): void {
    const socket = this.sockets.get(namespace);
    if (socket?.connected) {
      socket.emit("leaveOrganization", orgId);
    }
  }

  /**
   * Subscribe to an event
   */
  on<T = any>(
    namespace: SocketNamespace,
    event: string,
    handler: (data: T) => void
  ): void {
    const socket = this.sockets.get(namespace);
    if (socket) {
      socket.on(event, handler);
      const handlers = this.eventHandlers.get(namespace) || {};
      handlers[event] = handler;
      this.eventHandlers.set(namespace, handlers);
    }
  }

  /**
   * Unsubscribe from an event
   */
  off(namespace: SocketNamespace, event: string, handler?: (data: any) => void): void {
    const socket = this.sockets.get(namespace);
    if (socket) {
      if (handler) {
        socket.off(event, handler);
      } else {
        const handlers = this.eventHandlers.get(namespace);
        if (handlers?.[event]) {
          socket.off(event, handlers[event]);
          delete handlers[event];
        }
      }
    }
  }

  /**
   * Disconnect from a namespace
   */
  disconnect(namespace: SocketNamespace): void {
    const socket = this.sockets.get(namespace);
    if (socket) {
      socket.disconnect();
      this.sockets.delete(namespace);
      this.eventHandlers.delete(namespace);
    }
  }

  /**
   * Disconnect from all namespaces
   */
  disconnectAll(): void {
    this.sockets.forEach((socket, namespace) => {
      socket.disconnect();
    });
    this.sockets.clear();
    this.eventHandlers.clear();
  }
}

// Export singleton instance
export const socketService = new SocketService();
