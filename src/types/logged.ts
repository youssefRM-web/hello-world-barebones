export interface LoggedTime {
  _id: string;
  id_user: string;
  start_time: string;
  end_time: string;
  log_date: string;
  description?: string;
  attachments: string[];
}

export interface LoggedTimeDisplay {
  _id: string;
  task_id: string;
  user_id: {
    _id: string;
    Name: string;
    Last_Name: string;
    profile_picture?: string;
  };
  date: string;
  start_time: string;
  end_time: string;
  duration: number; // in minutes
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoggedMaterial {
  _id: string;
  accepted_issue_id: string;
  id_user: string;
  log_date: string;
  amount: number;
  description?: string;
  attachements: string[];
  createdAt: string;
  updatedAt: string;
}
