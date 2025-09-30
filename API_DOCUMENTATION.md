# Quodo3 API Documentation

## Authentication

### Login
**POST** `/api/auth/login`

Request:
```json
{
  "username": "string",
  "password": "string"
}
```

Response:
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "fullName": "string",
    "role": "string",
    "office": "string"
  }
}
```

### Get Current User
**GET** `/api/auth/me`

Response:
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "fullName": "string",
  "role": "string",
  "office": "string",
  "isActive": "boolean",
  "storageQuota": "number",
  "usedStorage": "number",
  "createdAt": "date",
  "updatedAt": "date"
}
```

## Users

### Get All Users
**GET** `/api/users`

Response:
```json
[
  {
    "id": "string",
    "username": "string",
    "email": "string",
    "fullName": "string",
    "role": "string",
    "office": "string",
    "isActive": "boolean",
    "storageQuota": "number",
    "usedStorage": "number",
    "createdAt": "date",
    "updatedAt": "date"
  }
]
```

### Create User
**POST** `/api/users`

Request:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "fullName": "string",
  "role": "string",
  "office": "string"
}
```

Response:
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "fullName": "string",
  "role": "string",
  "office": "string"
}
```

### Update User
**PUT** `/api/users/:id`

Request:
```json
{
  "username": "string",
  "email": "string",
  "fullName": "string",
  "role": "string",
  "office": "string",
  "isActive": "boolean"
}
```

Response:
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "fullName": "string",
  "role": "string",
  "office": "string",
  "isActive": "boolean"
}
```

### Delete User
**DELETE** `/api/users/:id`

Response:
```json
{
  "message": "User deactivated successfully"
}
```

## Tasks

### Get All Tasks
**GET** `/api/tasks`

Response:
```json
[
  {
    "id": "string",
    "date": "date",
    "source": "string",
    "category": "string",
    "service": "string",
    "userId": "string",
    "userName": "string",
    "office": "string",
    "description": "string",
    "status": "string",
    "comments": [
      {
        "text": "string",
        "userId": "string",
        "userName": "string",
        "createdAt": "date"
      }
    ],
    "attachments": [
      {
        "filename": "string",
        "path": "string",
        "size": "number",
        "uploadedAt": "date"
      }
    ],
    "createdAt": "date",
    "updatedAt": "date"
  }
]
```

### Create Task
**POST** `/api/tasks`

Request (multipart/form-data):
```form
date: "date"
source: "string"
category: "string"
service: "string"
description: "string"
status: "string"
attachments: "file"
```

Response:
```json
{
  "id": "string",
  "date": "date",
  "source": "string",
  "category": "string",
  "service": "string",
  "userId": "string",
  "userName": "string",
  "office": "string",
  "description": "string",
  "status": "string",
  "comments": [],
  "attachments": [],
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Update Task
**PUT** `/api/tasks/:id`

Request:
```json
{
  "date": "date",
  "source": "string",
  "category": "string",
  "service": "string",
  "description": "string",
  "status": "string",
  "comment": "string"
}
```

Response:
```json
{
  "id": "string",
  "date": "date",
  "source": "string",
  "category": "string",
  "service": "string",
  "userId": "string",
  "userName": "string",
  "office": "string",
  "description": "string",
  "status": "string",
  "comments": [],
  "attachments": [],
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Delete Task
**DELETE** `/api/tasks/:id`

Response:
```json
{
  "message": "Task deleted successfully"
}
```

## Leaves

### Get All Leaves
**GET** `/api/leaves`

Response:
```json
[
  {
    "id": "string",
    "userId": "string",
    "userName": "string",
    "startDate": "date",
    "endDate": "date",
    "reason": "string",
    "status": "string",
    "approvedBy": "string",
    "approvedByName": "string",
    "approvedAt": "date",
    "rejectionReason": "string",
    "createdAt": "date",
    "updatedAt": "date"
  }
]
```

### Request Leave
**POST** `/api/leaves`

Request:
```json
{
  "startDate": "date",
  "endDate": "date",
  "reason": "string"
}
```

Response:
```json
{
  "id": "string",
  "userId": "string",
  "userName": "string",
  "startDate": "date",
  "endDate": "date",
  "reason": "string",
  "status": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Approve Leave
**PUT** `/api/leaves/:id/approve`

Response:
```json
{
  "id": "string",
  "userId": "string",
  "userName": "string",
  "startDate": "date",
  "endDate": "date",
  "reason": "string",
  "status": "string",
  "approvedBy": "string",
  "approvedByName": "string",
  "approvedAt": "date",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Reject Leave
**PUT** `/api/leaves/:id/reject`

Request:
```json
{
  "rejectionReason": "string"
}
```

Response:
```json
{
  "id": "string",
  "userId": "string",
  "userName": "string",
  "startDate": "date",
  "endDate": "date",
  "reason": "string",
  "status": "string",
  "approvedBy": "string",
  "approvedByName": "string",
  "approvedAt": "date",
  "rejectionReason": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

## Dropdowns

### Get Dropdown Values
**GET** `/api/dropdowns/:type?parentValue=string`

Response:
```json
[
  {
    "id": "string",
    "type": "string",
    "value": "string",
    "parentType": "string",
    "parentValue": "string",
    "isActive": "boolean",
    "createdBy": "string",
    "createdAt": "date",
    "updatedAt": "date"
  }
]
```

### Create Dropdown Value
**POST** `/api/dropdowns`

Request:
```json
{
  "type": "string",
  "value": "string",
  "parentType": "string",
  "parentValue": "string"
}
```

Response:
```json
{
  "id": "string",
  "type": "string",
  "value": "string",
  "parentType": "string",
  "parentValue": "string",
  "isActive": "boolean",
  "createdBy": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Update Dropdown Value
**PUT** `/api/dropdowns/:id`

Request:
```json
{
  "value": "string",
  "isActive": "boolean"
}
```

Response:
```json
{
  "id": "string",
  "type": "string",
  "value": "string",
  "parentType": "string",
  "parentValue": "string",
  "isActive": "boolean",
  "createdBy": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

## Reports

### Get Task Report
**GET** `/api/reports/tasks?startDate=date&endDate=date&userId=string&status=string`

Response:
```json
[
  {
    "id": "string",
    "date": "date",
    "source": "string",
    "category": "string",
    "service": "string",
    "userId": {
      "username": "string",
      "fullName": "string"
    },
    "userName": "string",
    "office": "string",
    "description": "string",
    "status": "string",
    "comments": [],
    "attachments": [],
    "createdAt": "date",
    "updatedAt": "date"
  }
]
```

### Get Leave Report
**GET** `/api/reports/leaves?startDate=date&endDate=date&userId=string&status=string`

Response:
```json
[
  {
    "id": "string",
    "userId": {
      "username": "string",
      "fullName": "string"
    },
    "userName": "string",
    "startDate": "date",
    "endDate": "date",
    "reason": "string",
    "status": "string",
    "approvedBy": "string",
    "approvedByName": "string",
    "approvedAt": "date",
    "rejectionReason": "string",
    "createdAt": "date",
    "updatedAt": "date"
  }
]
```

### Get Summary Report
**GET** `/api/reports/summary?startDate=date&endDate=date`

Response:
```json
{
  "tasks": [
    {
      "_id": "string",
      "count": "number"
    }
  ],
  "leaves": [
    {
      "_id": "string",
      "count": "number"
    }
  ],
  "userCount": "number"
}
```