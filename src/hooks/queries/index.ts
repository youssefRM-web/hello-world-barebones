// Centralized exports for all query hooks
export { useBuildingsQuery, usePaginatedBuildingsQuery } from './useBuildingsQuery';
export { useCurrentUserQuery } from './useCurrentUserQuery';
export { useGroupsQuery, useCreateGroupMutation, useDeleteGroupMutation } from './useGroupsQuery';
export { 
  useLoggedMaterialQuery, 
  useCreateLoggedMaterialMutation, 
  useDeleteLoggedMaterialMutation 
} from './useLoggedMaterialQuery';
export { 
  useLoggedTimeQuery, 
  useCreateLoggedTimeMutation, 
  useDeleteLoggedTimeMutation 
} from './useLoggedTimeQuery';
export { 
  useNotificationsQuery, 
  useUnreadCountQuery,
  useMarkNotificationAsRead, 
  useMarkAllNotificationsAsRead 
} from './useNotificationsQuery';
export { useOrganizationQuery } from './useOrganizationQuery';
export { useReferenceDataQuery } from './useReferenceDataQuery';
export { useSubscriptionStatus } from './useSubscriptionStatus';
export { 
  useTasksQuery, 
  useUpdateTaskMutation, 
  useDeleteTaskMutation, 
  useCreateTaskMutation, 
  useUploadTaskAttachmentMutation,
  useArchiveTaskMutation 
} from './useTasksQuery';
export { useTaskDetailQuery, TASK_DETAIL_QUERY_KEY } from './useTaskDetailQuery';
export { 
  useTicketsQuery, 
  useTicketDetailQuery,
  useCreateTicketMutation, 
  useSendMessageMutation, 
  useMarkTicketReadMutation, 
  useUpdateTicketStatusMutation,
  type Ticket,
  type TicketMessage,
  type TicketCustomer
} from './useTicketsQuery';
export { useRecurringTasksQuery } from './useRecurringTasksQuery';
export { useDocumentsQuery } from './useDocumentsQuery';
export { useIssuesQuery } from './useIssuesQuery';
export { useLinkedIssuesQuery, type LinkedIssue } from './useLinkedIssuesQuery';
export { useExternalIssuesQuery } from './useExternalIssuesQuery';
export { usePaymentsQuery } from './usePaymentsQuery';
export { usePlansQuery } from './usePlansQuery';