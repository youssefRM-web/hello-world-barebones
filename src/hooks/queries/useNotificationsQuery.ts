import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notificationService';
import { useToast } from '@/hooks/use-toast';

export const useNotificationsQuery = (params?: { unread?: boolean; limit?: number; page?: number }, enabled = true) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationService.getNotifications(params),
    enabled,
    refetchOnWindowFocus: false,
    select: (response) => response.data.data,
  });
};

export const useUnreadCountQuery = (enabled = true) => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
    enabled,
    refetchOnWindowFocus: false,
    select: (response) => response.data.unreadCount,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update notification",
        variant: "destructive",
      });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Notifications",
        description: "All notifications marked as read",
        variant: "success"
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    },
  });
};