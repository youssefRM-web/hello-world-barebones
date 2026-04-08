# Example API Routes for Reference Data

## Authentication Routes

### Get Current User
```
GET /api/auth/current-user
Headers: Authorization: Bearer {token}
Response: {
  id: string,
  name: string,
  email: string,
  role: string,
  building_ids: string[]
}
```

### Login
```
POST /api/auth/login
Body: { email: string, password: string }
Response: { token: string, user: User }
```

## Reference Data Routes

### Get All Users
```
GET /api/users
Response: User[]
```

### Get All Categories
```
GET /api/categories
Response: Category[]
```

### Get All Buildings
```
GET /api/buildings
Response: Building[]
```

### Get All Tasks
```
GET /api/tasks
Query params: ?building_id={id} (optional filter)
Response: Task[]
```

## Issue Routes

### Create Issue
```
POST /api/issues
Body: {
  created_by: string,
  issue_summary: string,
  additional_info: string,
  Building_id: string,
  task_id: string | null,
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
  categories_ids: string,
  Assigned_to: string,
  Status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CLOSED',
  Due_date: string (ISO),
  Checklist: Array<{name: string, completed: boolean}>,
  Attachements: string[]
}
```

### Get Issues
```
GET /api/issues
Query params: 
  ?building_id={id}
  ?assigned_to={user_id}
  ?status={status}
  ?page={number}&limit={number}
Response: { data: Issue[], pagination: {...} }
```

## MongoDB Schema Examples

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String, // hashed
  role: String, // 'admin', 'manager', 'technician', 'user'
  building_ids: [ObjectId], // buildings user has access to
  created_at: Date,
  updated_at: Date
}
```

### Buildings Collection
```javascript
{
  _id: ObjectId,
  name: String,
  address: String,
  description: String,
  created_at: Date,
  updated_at: Date
}
```

### Categories Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  color: String, // hex color for UI
  created_at: Date,
  updated_at: Date
}
```

### Tasks Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  building_id: ObjectId,
  category_id: ObjectId,
  assigned_to: ObjectId,
  status: String,
  priority: String,
  due_date: Date,
  created_at: Date,
  updated_at: Date
}
```

### Issues Collection
```javascript
{
  _id: ObjectId,
  created_by: ObjectId,
  issue_summary: String,
  additional_info: String,
  Building_id: ObjectId,
  task_id: ObjectId, // optional reference to task
  priority: String,
  categories_ids: ObjectId,
  Assigned_to: ObjectId,
  Status: String,
  Due_date: Date,
  Checklist: [{
    name: String,
    completed: Boolean,
    completed_at: Date,
    completed_by: ObjectId
  }],
  Attachements: [String], // file URLs or names
  created_at: Date,
  updated_at: Date
}
```