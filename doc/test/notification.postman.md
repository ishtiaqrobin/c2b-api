# Notification API Documentation

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

All notification endpoints require a valid session cookie (`better-auth.session_token`) obtained from login.

---

## 1. Get My Notifications

**GET** `/notifications/my`

### Query Parameters

| Parameter | Type   | Required | Description                           |
| --------- | ------ | -------- | ------------------------------------- |
| page      | number | No       | Page number (default: 1)              |
| limit     | number | No       | Items per page (default: 20, max 100) |
| status    | string | No       | `PENDING`, `SENT`, `FAILED`           |
| channel   | string | No       | `EMAIL`, `SMS`, `IN_APP`              |
| type      | string | No       | Filter by notification type           |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Notifications retrieved",
  "data": [
    {
      "id": "cm7x1a1...",
      "userId": "cm7x0f3...",
      "type": "ORDER_STATUS",
      "channel": "EMAIL",
      "status": "PENDING",
      "subject": "Your order has been shipped",
      "body": "Order ORD-20260621-00001 has been shipped...",
      "sentAt": null,
      "createdAt": "2026-06-21T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

---

## 2. Get Unread Count

**GET** `/notifications/my/unread-count`

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Unread count retrieved",
  "data": {
    "unreadCount": 3
  }
}
```

---

## 3. Get Single Notification

**GET** `/notifications/my/:id`

### Path Parameters

| Parameter | Type   | Required | Description     |
| --------- | ------ | -------- | --------------- |
| id        | string | Yes      | Notification ID |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Notification retrieved",
  "data": {
    "id": "cm7x1a1...",
    "userId": "cm7x0f3...",
    "type": "ORDER_STATUS",
    "channel": "EMAIL",
    "status": "PENDING",
    "subject": "Your order has been shipped",
    "body": "Order ORD-20260621-00001 has been shipped...",
    "sentAt": null,
    "createdAt": "2026-06-21T10:00:00.000Z"
  }
}
```

---

## 4. Mark as Read

**PATCH** `/notifications/my/:id/read`

### Path Parameters

| Parameter | Type   | Required | Description     |
| --------- | ------ | -------- | --------------- |
| id        | string | Yes      | Notification ID |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id": "cm7x1a1...",
    "status": "SENT",
    "sentAt": "2026-06-21T12:00:00.000Z"
  }
}
```

---

## 5. Mark All as Read

**PATCH** `/notifications/my/read-all`

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "3 notifications marked as read",
  "data": {
    "updatedCount": 3
  }
}
```

---

## 6. List All Notifications (Admin)

**GET** `/notifications`

### Query Parameters

| Parameter | Type   | Required | Description                           |
| --------- | ------ | -------- | ------------------------------------- |
| page      | number | No       | Page number (default: 1)              |
| limit     | number | No       | Items per page (default: 20, max 100) |
| status    | string | No       | `PENDING`, `SENT`, `FAILED`           |
| channel   | string | No       | `EMAIL`, `SMS`, `IN_APP`              |
| userId    | string | No       | Filter by user ID                     |
| type      | string | No       | Filter by notification type           |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Notifications retrieved",
  "data": [
    {
      "id": "cm7x1a1...",
      "userId": "cm7x0f3...",
      "type": "ORDER_STATUS",
      "channel": "EMAIL",
      "status": "PENDING",
      "subject": "Your order has been shipped",
      "body": "...",
      "sentAt": null,
      "createdAt": "2026-06-21T10:00:00.000Z",
      "user": {
        "id": "cm7x0f3...",
        "email": "customer@example.com",
        "name": "John Doe"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

---

## 7. Create Notification (Admin)

**POST** `/notifications`

### Request Body

```json
{
  "userId": "cm7x0f3...",
  "type": "ORDER_STATUS",
  "channel": "EMAIL",
  "subject": "Your order has been approved",
  "body": "Your buyback order ORD-20260621-00001 has been approved."
}
```

### Body Fields

| Field   | Type   | Required | Description                                             |
| ------- | ------ | -------- | ------------------------------------------------------- |
| userId  | string | Yes      | Target user ID                                          |
| type    | string | Yes      | Notification type (e.g., `ORDER_STATUS`, `EKYC_RESULT`) |
| channel | string | No       | `EMAIL` (default), `SMS`, or `IN_APP`                   |
| subject | string | No       | Subject line (max 200 chars)                            |
| body    | string | No       | Notification body (max 5000 chars)                      |

### Response (201)

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Notification created",
  "data": {
    "id": "cm7x1a1...",
    "userId": "cm7x0f3...",
    "type": "ORDER_STATUS",
    "channel": "EMAIL",
    "status": "PENDING",
    "subject": "Your order has been approved",
    "body": "Your buyback order ORD-20260621-00001 has been approved.",
    "sentAt": null,
    "createdAt": "2026-06-21T10:00:00.000Z"
  }
}
```

---

## 8. Get Any Notification by ID (Admin)

**GET** `/notifications/:id`

### Path Parameters

| Parameter | Type   | Required | Description     |
| --------- | ------ | -------- | --------------- |
| id        | string | Yes      | Notification ID |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Notification retrieved",
  "data": {
    "id": "cm7x1a1...",
    "userId": "cm7x0f3...",
    "type": "ORDER_STATUS",
    "channel": "EMAIL",
    "status": "PENDING",
    "subject": "Your order has been shipped",
    "body": "...",
    "sentAt": null,
    "createdAt": "2026-06-21T10:00:00.000Z",
    "user": {
      "id": "cm7x0f3...",
      "email": "customer@example.com",
      "name": "John Doe"
    }
  }
}
```

---

## 9. Delete Notification (Admin)

**DELETE** `/notifications/:id`

### Path Parameters

| Parameter | Type   | Required | Description     |
| --------- | ------ | -------- | --------------- |
| id        | string | Yes      | Notification ID |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Notification deleted",
  "data": null
}
```

### Notes

- Admin endpoints require `notification.manage` permission.
- Customer endpoints only access own notifications.
