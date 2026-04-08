import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Refetch on window focus to keep data fresh
      refetchOnWindowFocus: true,
      // Refetch on reconnect to recover from network issues
      refetchOnReconnect: true,
    },
  },
});