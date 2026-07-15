# Category Check Item API Documentation

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

Public endpoints (get by category) do not require authentication. Admin endpoints require a valid session cookie and `category.manage` permission.

---

## 1. Get Check Items by Category (Public)

**GET** `/check-items/category/:categoryId`

### Path Parameters

| Parameter  | Type   | Required | Description    |
| ---------- | ------ | -------- | -------------- |
| categoryId | string | Yes      | Category ID    |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Check items retrieved successfully",
  "data": [
    {
      "id": "cm7x1a1...",
      "categoryId": "cm7x3c3...",
      "content": "If the remaining warranty period for the iPhone is less than 9 months, the price will be reduced.",
      "sortOrder": 1,
      "isActive": true,
      "createdAt": "2026-06-21T10:00:00.000Z",
      "updatedAt": "2026-06-21T10:00:00.000Z"
    },
    {
      "id": "cm7x2b2...",
      "categoryId": "cm7x3c3...",
      "content": "If you have set up an Apple ID or Apple iCloud, please be sure to delete and reset it.",
      "sortOrder": 2,
      "isActive": true,
      "createdAt": "2026-06-21T10:00:00.000Z",
      "updatedAt": "2026-06-21T10:00:00.000Z"
    }
  ]
}
```

### Alternate Route

**GET** `/categories/:categoryId/check-items`

Same response format. Both endpoints return only active items sorted by `sortOrder` ascending.

---

## 2. List All Check Items (Admin)

**GET** `/check-items`

### Query Parameters

| Parameter  | Type    | Required | Description                           |
| ---------- | ------- | -------- | ------------------------------------- |
| page       | number  | No       | Page number (default: 1)              |
| limit      | number  | No       | Items per page (default: 20, max 100) |
| search     | string  | No       | Searches content field                |
| categoryId | string  | No       | Filter by category ID                 |
| isActive   | string  | No       | Filter: `true` or `false`             |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Check items retrieved successfully",
  "data": [
    {
      "id": "cm7x1a1...",
      "categoryId": "cm7x3c3...",
      "content": "If the remaining warranty period for the iPhone is less than 9 months, the price will be reduced.",
      "sortOrder": 1,
      "isActive": true,
      "createdAt": "2026-06-21T10:00:00.000Z",
      "updatedAt": "2026-06-21T10:00:00.000Z",
      "category": {
        "id": "cm7x3c3...",
        "slug": "smartphones",
        "name": "Smartphones"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  }
}
```

---

## 3. Get Single Check Item (Admin)

**GET** `/check-items/:id`

### Path Parameters

| Parameter | Type   | Required | Description   |
| --------- | ------ | -------- | ------------- |
| id        | string | Yes      | Check item ID |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Check item retrieved successfully",
  "data": {
    "id": "cm7x1a1...",
    "categoryId": "cm7x3c3...",
    "content": "If the remaining warranty period for the iPhone is less than 9 months, the price will be reduced.",
    "sortOrder": 1,
    "isActive": true,
    "createdAt": "2026-06-21T10:00:00.000Z",
    "updatedAt": "2026-06-21T10:00:00.000Z",
    "category": {
      "id": "cm7x3c3...",
      "slug": "smartphones",
      "name": "Smartphones"
    }
  }
}
```

---

## 4. Create Check Item (Admin)

**POST** `/check-items`

### Request Body

```json
{
  "categoryId": "cm7x3c3...",
  "content": "If the remaining warranty period for the iPhone is less than 9 months, the price will be reduced.",
  "sortOrder": 1,
  "isActive": true
}
```

### Body Fields

| Field      | Type    | Required | Description                         |
| ---------- | ------- | -------- | ----------------------------------- |
| categoryId | string  | Yes      | Category ID                         |
| content    | string  | Yes      | Check item text                     |
| sortOrder  | number  | No       | Sort order (default: 0)             |
| isActive   | boolean | No       | Active status (default: true)       |

### Response (201)

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Check item created successfully",
  "data": {
    "id": "cm7x1a1...",
    "categoryId": "cm7x3c3...",
    "content": "If the remaining warranty period for the iPhone is less than 9 months, the price will be reduced.",
    "sortOrder": 1,
    "isActive": true,
    "createdAt": "2026-06-21T10:00:00.000Z",
    "updatedAt": "2026-06-21T10:00:00.000Z",
    "category": {
      "id": "cm7x3c3...",
      "slug": "smartphones",
      "name": "Smartphones"
    }
  }
}
```

---

## 5. Update Check Item (Admin)

**PATCH** `/check-items/:id`

### Path Parameters

| Parameter | Type   | Required | Description   |
| --------- | ------ | -------- | ------------- |
| id        | string | Yes      | Check item ID |

### Request Body

```json
{
  "content": "Updated check item text.",
  "sortOrder": 2,
  "isActive": false
}
```

### Body Fields

| Field     | Type    | Required | Description                    |
| --------- | ------- | -------- | ------------------------------ |
| content   | string  | No       | Check item text                |
| sortOrder | number  | No       | Sort order                     |
| isActive  | boolean | No       | Active status                  |

All fields are optional. Only provided fields will be updated.

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Check item updated successfully",
  "data": {
    "id": "cm7x1a1...",
    "categoryId": "cm7x3c3...",
    "content": "Updated check item text.",
    "sortOrder": 2,
    "isActive": false,
    "createdAt": "2026-06-21T10:00:00.000Z",
    "updatedAt": "2026-06-21T10:00:00.000Z",
    "category": {
      "id": "cm7x3c3...",
      "slug": "smartphones",
      "name": "Smartphones"
    }
  }
}
```

---

## 6. Delete Check Item (Admin)

**DELETE** `/check-items/:id`

### Path Parameters

| Parameter | Type   | Required | Description   |
| --------- | ------ | -------- | ------------- |
| id        | string | Yes      | Check item ID |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Check item deleted successfully",
  "data": {
    "id": "cm7x1a1..."
  }
}
```

---

## Notes

- Items are ordered by `sortOrder` ascending in public responses.
- Only `isActive: true` items are returned via the public endpoint.
- Deleting a category cascades and removes all its check items.
- Permission required for admin endpoints: `category.manage`.
