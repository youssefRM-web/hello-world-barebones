export interface User {
  _id: string;
  Name: string;
  Last_Name: string;
  email: string;
  role: string;
  Organization_id: {
    _id: string;
  };
  profile_picture: string;
  Roles?: string[];
  affectedTo?: Array<{
    _id: string;
    label: string;
  }>;
}

export interface Permissions {
  issues: {
    accessNewIssues: boolean;
    acceptDeclineNewIssues: boolean;
  };
  board: {
    accessTicketBoard: boolean;
    createTickets: boolean;
    manageOwnTickets: boolean;
    editTimeLog: boolean;
    editMaterialLog: boolean;
  };
  tasks: {
    accessTasks: boolean;
    createTasks: boolean;
    updateTasks: boolean;
    deleteTasks: boolean;
  };
  spaces: {
    accessSpaces: boolean;
    createSpaces: boolean;
    updateSpaces: boolean;
    deleteSpaces: boolean;
  };
  assets: {
    accessAssets: boolean;
    createAssets: boolean;
    updateAssets: boolean;
    deleteAssets: boolean;
  };
  documents: {
    accessDocuments: boolean;
    createDocuments: boolean;
    updateDocuments: boolean;
    deleteDocuments: boolean;
  };
  insights: {
    accessInsights: boolean;
  };
  qrCodes: {
    accessQRCodes: boolean;
    createQRCodes: boolean;
  };
  organisation: {
    accessOrganisation: boolean;
    manageSubscription: boolean;
    manageBillingPayment: boolean;
    manageInvoices: boolean;
    manageUsers: boolean;
    manageSettings: boolean;
  };
  buildings: {
    manageBuildings: boolean;
    manageCategories: boolean;
    manageReportFlow: boolean;
  };
}

export interface BuildingPermission {
  buildingId: string;
  permissions: Permissions;
  assignedAt?: string;
  updatedAt?: string;
}

export interface CurrentUser extends User {
  Email: string;
  building_ids: string[];
  profile_picture: string;
  Roles: string[];
  permissions: Permissions;
  buildingPermissions?: BuildingPermission[];
  notificationSettings?: {
    email: {
      allActivities: {
        assignedToTask: boolean;
        mentionedInTask: boolean;
      };
      relevantActivities: {
        taskCreated: boolean;
        taskEdited: boolean;
        taskDeleted: boolean;
        statusChanged: boolean;
        commentAdded: boolean;
      };
    };
    inApp: boolean;
  };
  trialStartDate?: string;
  trialEndDate?: string;
  trialExpired?: boolean;
  trialReminderSent?: boolean;
  inviteId?: string;
}

export interface CategoryBuilding {
  _id: string;
  label: string;
  areas: AreaForm[];
  photo?: string;
  address?: string;
  zipCode?: string;
  city?: string;
  organization_id?: string;
  requireContactDetails?: boolean;
  contactType?: string;
  askForName?: boolean;
  autoAccept?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface Category {
  _id: string;
  label: string;
  status: string;
  buildingIds: CategoryBuilding[];
  createdAt: string;
  autoAssignToNewBuildings?: boolean;
  updatedAt: string;
  __v?: number;
}

export interface Space {
  _id: string;
  name: string;
  group?: string; // corresponds to "group" in your table, optional
  building_id: Building; // object with label
  area?: AreaForm | null; // array of areas
  spaceGroup?: string;
  archived: boolean;
  additionalInformation?: string;
  openTasks?: number; // for table column
  tasksInProgress?: number; // for table column
  tasksCompleted?: number; // for table column
  label: string;
  taskCounts?: {
    open: number;
    inProgress: number;
    completed: number;
  };
  attachments?: Array<{
    _id: string;
    name: string;
    url: string;
    createdAt?: string;
  }>;
  assets?: Array<{ _id: string; name: string }>;
}

export interface AreaForm {
  _id: string;
  label: string;
}

export interface Organization {
  _id: string;
  name: string;
  address?: string;
  phone_number?: string;
  email?: string;
}

export interface Building {
  _id: string;
  label: string;
  areas: AreaForm[]; // Keep this for backward compatibility
  organization_id: Organization;
  photo: string;
  address: string;
  zipCode: string;
  members: string[];
  archived: boolean;
  city: string;
  requireContactDetails: boolean;
  contactType: string;
  askForName: boolean;
  autoAccept: boolean;
}

export interface CommentReaction {
  type: string; // 👍 ❤️ 😂 👀
  users: {
    _id: string;
    Name: string;
    Last_Name?: string;
    profile_picture?: string;
  }[];
}

export interface CommentType {
  _id: string;
  content: string;
  id_user: {
    _id: string;
    Name: string;
    Last_Name: string;
    profile_picture: string;
    assignedIssues : any;
    affectedTo : any
  };
  Name: string;
  createdAt: string;
  replies?: CommentType[];
  accepted_issue: string;
  attachments?: (string | { url: string; type: string })[];
  reactions?: CommentReaction[];
}

export interface ActivityChange {
  _id: string;
  field: string;
  old: any;
  new: any;
}

export interface ActivityDetails {
  message?: string;
  userName?: string;
  comment_preview?: string;
  duration_hours?: string;
  description?: string;
  amount?: string;
  taskTitle?: string;
  oldLocation?: string;
  newLocation?: string;
  oldStatus?: string;
  newStatus?: string;
  oldPriority?: string;
  newPriority?: string;
  oldDueDate?: string;
  newDueDate?: string;
  oldSummary?: string;
  newSummary?: string;
  oldCategory?: string;
  newCategory?: string;
  oldAssignees?: string;
  newAssignees?: string;
  attachment_url?: string;
  changes?: Array<{ field: string; old: string | null; new: string | null }>;
  display?: {
    user?: { name: string; id: string; picture?: string };
    changes?: any[];
  };
}

export interface ActivityUser {
  id: string; // matches DB 'user.id'
  name: string; // matches DB 'user.name'
  picture?: string;
}

export interface ActivityLog {
  _id: string;
  action:
    | "updated"
    | "commented"
    | "created"
    | "attachment_added"
    | "attachment_removed"; // extendable
  user_id: {
    Name: string;
    Last_Name: string;
  };
  user?: ActivityUser; // populated user info
  timestamp: string; // ISO date string
  details: ActivityDetails;
  message: string | string[];
}

export interface AcceptedTasks {
  _id: string;
  created_by: {
    _id: string;
    Name: string;
    Last_Name: string;
    Email: string;
    profile_picture?: string;
  };
  Assigned_to: {
    _id: string;
    Name: string;
    Last_Name: string;
    Email?: string;
    profile_picture?: string;
  }[];
  AssignedTo?: string;
  isAccepted: boolean;
  issue_summary: string;
  additional_info?: string;
  isExternalTask?: boolean;
  isRecurring?: boolean;
  comments?: CommentType[];
  location_coordinates?: {
    lat: number;
    lng: number;
  };
  location_name: string;
  Building_id: string | { _id: string } | null;
  Linked_To?: {
    _id: string;
    name: string;
    building_id: {
      _id: string;
      areas: string[];
      label: string;
    };
    linked_space_id?: string;
    category_id?: string;
    assetGroup?: string;
    id_number?: string;
    brand?: string;
    supplier?: string;
    purchase_date?: string;
    additional_information?: string;
    open_tasks?: number;
    tasks_in_progress?: number;
    tasks_completed?: number;
    status?: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  Linked_To_Model: "Asset" | "Space";
  priority: "Low" | "Medium" | "High" | "urgent";
  category_id: string[] | { _id: string; label: string };
  Status: "TO_DO" | "IN_PROGRESS" | "DONE" | "CLOSED";
  Due_date?: string;
  locationChain?: string;
  Checklist: {
    name?: string;
    text?: string;
    completed: boolean;
  }[];
  Attachements: string[];
  material_logs?: {
    _id: string;
    accepted_issue_id: string;
    id_user: any;
    log_date: string;
    amount: number;
    description?: string;
    attachements?: (string | { url: string; type: string; _id?: string })[];
    createdAt: string;
    updatedAt: string;
  }[];
  activity_log: ActivityLog[]; // matches DB
  transatedNotificationMessage?: string;
  additional_info_key?: string;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  reporter?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export interface BuildingFormData {
  label: string;
  _id: string;
  areas: AreaForm[];
  organization_id: string | null;
  photo: string;
  address: string;
  zipCode: string;
  createdBy: string;
  city: string;
  requireContactDetails: boolean;
  contactType: string;
  askForName: boolean;
  autoAccept: boolean;
}

export interface Asset {
  _id: string;
  name: string;
  building_id: { _id: string; label: string }; // populated building
  linked_space_id: { _id: string; name: string }; // populated space
  category_id: { _id: string; label: string };
  assetGroup: string; // e.g., "Printer", "Router", etc.
  id_number: string; // Serial or identification number
  brand: string;
  supplier: string;
  purchase_date: string; // ISO date string, e.g., "2022-02-03"
  additional_information?: string; // optional description
  label: string;
  asset_picture?: string; // optional asset image URL
  chainLocation: string;
  open_tasks: number;
  tasks_in_progress: number;
  archived: boolean;
  tasks_completed: number;
  taskCounts?: {
    open: number;
    inProgress: number;
    completed: number;
  };
  documents?: Document[];
  attachments?: Array<{
    _id: string;
    name: string;
    url: string;
    createdAt?: string;
  }>;
}

export interface SpaceFormData {
  name: string;
  building_id: string;
  area_id?: string;
  spaceGroup?: string;
  additionalInformation?: string;
}

export interface Comment {
  _id: string;
  content: string;
  id_user: User;
  accepted_issue: string;
  createdAt: Date;
  updatedAt: Date;
  replies?: Comment[];
}

export type Issue = {
  _id: string;
  created_by: {
    _id: string;
    Name: string;
    Last_Name: string;
    Email: string;
  };
  assignedTo: String;
  isAccepted: Boolean;
  issue_summary: string;
  additional_info?: string;
  buildingId: {
    label: string;
    _id: string;
  };
  Linked_To?: {
    _id: string;
    name: string;
    building_id: string;
    linked_space_id?: string;
    category_id?: string;
    assetGroup?: string;
    id_number?: string;
    brand?: string;
    supplier?: string;
    purchase_date?: string;
    additional_information?: string;
    open_tasks?: number;
    tasks_in_progress?: number;
    tasks_completed?: number;
    status?: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  Linked_To_Model: "Asset" | "Space";
  priority: "Low" | "Medium" | "High" | "URGENT";
  category_id: string[];
  Status: "TO_DO" | "IN_PROGRESS" | "DONE" | "CLOSED";
  Due_date?: string;
  locationChain?: string;
  Checklist: {
    name: string;
    completed: boolean;
  }[];
  attachements: string[];
  reporter?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  organization?: string;
  location_name?: string;
  location_coordinates?: {
    lat: number;
    lng: number;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export interface Document {
  _id: string;
  name: string;
  linkedTo: {
    type: string;
    _id: string;
    name: string;
    building: {
      _id: string;
      name: string;
    };
  }[];
  additionalInformation?: string;
  expirationDate?: string;
  notificationDate?: string;
  visibility: "private" | "public";
  fileUrls: string;
  archived?: boolean;
  expired?: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
