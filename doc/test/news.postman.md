# News API Documentation

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

Public endpoints (list, get) do not require authentication. Admin endpoints require a valid session cookie and `news.manage` permission.

---

## 1. List News (Public)

**GET** `/news`

### Query Parameters

| Parameter | Type   | Required | Description                           |
| --------- | ------ | -------- | ------------------------------------- |
| page      | number | No       | Page number (default: 1)              |
| limit     | number | No       | Items per page (default: 20, max 100) |
| locale    | string | No       | `EN` (default) or `BN`                |
| isActive  | string | No       | Filter: `true` or `false`             |
| search    | string | No       | Search by title                       |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "News retrieved",
  "data": [
    {
      "id": "cm7x1a1...",
      "publishedAt": "2026-06-21T10:00:00.000Z",
      "isActive": true,
      "isDeleted": false,
      "deletedAt": null,
      "createdAt": "2026-06-21T10:00:00.000Z",
      "updatedAt": "2026-06-21T10:00:00.000Z",
      "translations": [
        {
          "locale": "EN",
          "title": "New Buyback Program Launched",
          "body": "We are excited to announce..."
        }
      ]
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

## 2. Get Single News (Public)

**GET** `/news/:id`

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| id        | string | Yes      | News ID     |

### Query Parameters

| Parameter | Type   | Required | Description                           |
| --------- | ------ | -------- | ------------------------------------- |
| locale    | string | No       | `EN` or `BN` (returns all if omitted) |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "News retrieved",
  "data": {
    "id": "cm7x1a1...",
    "publishedAt": "2026-06-21T10:00:00.000Z",
    "isActive": true,
    "isDeleted": false,
    "deletedAt": null,
    "createdAt": "2026-06-21T10:00:00.000Z",
    "updatedAt": "2026-06-21T10:00:00.000Z",
    "translations": [
      {
        "locale": "EN",
        "title": "New Buyback Program Launched",
        "body": "We are excited to announce..."
      },
      {
        "locale": "BN",
        "title": "নতুন বাইব্যাক প্রোগ্রাম চালু",
        "body": "আমরা উৎসাহের সাথে ঘোষণা করছি..."
      }
    ]
  }
}
```

---

## 3. Create News (Admin)

**POST** `/news`

### Request Body

```json
{
  "publishedAt": "2026-06-21T10:00:00.000Z",
  "isActive": true,
  "translations": [
    {
      "locale": "EN",
      "title": "New Buyback Program Launched",
      "body": "We are excited to announce our new buyback program..."
    },
    {
      "locale": "BN",
      "title": "নতুন বাইব্যাক প্রোগ্রাম চালু",
      "body": "আমরা উৎসাহের সাথে ঘোষণা করছি..."
    }
  ]
}
```

### Body Fields

| Field        | Type    | Required | Description                         |
| ------------ | ------- | -------- | ----------------------------------- |
| publishedAt  | string  | No       | ISO datetime (default: now)         |
| isActive     | boolean | No       | Active status (default: true)       |
| translations | array   | Yes      | At least one translation (EN or BN) |

### Translation Object

| Field  | Type   | Required | Description              |
| ------ | ------ | -------- | ------------------------ |
| locale | string | Yes      | `EN` or `BN`             |
| title  | string | Yes      | Title (max 300 chars)    |
| body   | string | No       | Body content (max 50000) |

### Response (201)

```json
{
  "statusCode": 201,
  "success": true,
  "message": "News created",
  "data": {
    "id": "cm7x1a1...",
    "publishedAt": "2026-06-21T10:00:00.000Z",
    "isActive": true,
    "translations": [
      {
        "locale": "EN",
        "title": "New Buyback Program Launched",
        "body": "We are excited to announce..."
      },
      {
        "locale": "BN",
        "title": "নতুন বাইব্যাক প্রোগ্রাম চালু",
        "body": "আমরা উৎসাহের সাথে ঘোষণা করছি..."
      }
    ]
  }
}
```

---

## 4. Update News (Admin)

**PATCH** `/news/:id`

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| id        | string | Yes      | News ID     |

### Request Body

```json
{
  "isActive": false,
  "translations": [
    {
      "locale": "EN",
      "title": "Updated Title",
      "body": "Updated body content..."
    },
    {
      "locale": "BN",
      "title": "আপডেট করা শিরোনাম",
      "body": "আপডেট করা বিষয়বস্তু..."
    }
  ]
}
```

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "News updated",
  "data": {
    "id": "cm7x1a1...",
    "isActive": false,
    "translations": [
      {
        "locale": "EN",
        "title": "Updated Title",
        "body": "Updated body content..."
      },
      {
        "locale": "BN",
        "title": "আপডেট করা শিরোনাম",
        "body": "আপডেট করা বিয়বস্তু..."
      }
    ]
  }
}
```

### Notes

- When translations are provided, all existing translations are replaced.
- When translations are omitted, only base fields are updated.

---

## 5. Delete News (Admin — Soft Delete)

**DELETE** `/news/:id`

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| id        | string | Yes      | News ID     |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "News deleted",
  "data": null
}
```

### Notes

- Soft delete: sets `isDeleted: true` and `deletedAt` timestamp.
- Deleted news is excluded from public listings.
- Permission required: `news.manage`
