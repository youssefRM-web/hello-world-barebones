
export interface Task {
  id: number;
  title: string;
  building: string;
  area: string;
  status: string;
  priority: string;
  category: string;
  assignee: string;
  dueDate: string;
  time_logs: string[],
  description: string;
  attachments: number;
  comments: number;
  avatars: string[];
  images?: string[];
}
