# Banner API Documentation

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

Public endpoints (list, get) do not require authentication. Admin endpoints require a valid session cookie and `banner.manage` permission.

---

## 1. List Banners (Public)

**GET** `/banners`

### Query Parameters

| Parameter  | Type   | Required | Description                           |
| ---------- | ------ | -------- | ------------------------------------- |
| page       | number | No       | Page number (default: 1)              |
| limit      | number | No       | Items per page (default: 20, max 100) |
| categoryId | string | No       | Filter by category ID (empty = root)  |
| isActive   | string | No       | Filter: `true` or `false`             |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Banners retrieved",
  "data": [
    {
      "id": "cm7x1a1...",
      "categoryId": null,
      "imageUrl": "https://res.cloudinary.com/.../banner-home.jpg",
      "imagePublicId": "c2b/images/banner-home",
      "linkUrl": "https://example.com/promo",
      "sortOrder": 0,
      "isActive": true,
      "isDeleted": false,
      "deletedAt": null,
      "createdAt": "2026-06-21T10:00:00.000Z",
      "updatedAt": "2026-06-21T10:00:00.000Z",
      "category": null
    },
    {
      "id": "cm7x2b2...",
      "categoryId": "cm7x3c3...",
      "imageUrl": "https://res.cloudinary.com/.../banner-smartphones.jpg",
      "imagePublicId": "c2b/images/banner-smartphones",
      "linkUrl": null,
      "sortOrder": 1,
      "isActive": true,
      "category": {
        "id": "cm7x3c3...",
        "slug": "smartphones"
      }
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

## 2. Get Single Banner (Public)

**GET** `/banners/:id`

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| id        | string | Yes      | Banner ID   |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Banner retrieved",
  "data": {
    "id": "cm7x1a1...",
    "categoryId": null,
    "imageUrl": "https://res.cloudinary.com/.../banner-home.jpg",
    "imagePublicId": "c2b/images/banner-home",
    "linkUrl": "https://example.com/promo",
    "sortOrder": 0,
    "isActive": true,
    "category": null
  }
}
```

---

## 3. Create Banner (Admin)

**POST** `/banners`

### Request Body

```json
{
  "categoryId": null,
  "imageUrl": "https://res.cloudinary.com/.../banner-home.jpg",
  "imagePublicId": "c2b/images/banner-home",
  "linkUrl": "https://example.com/promo",
  "sortOrder": 0,
  "isActive": true
}
```

### Body Fields

| Field         | Type    | Required | Description                                |
| ------------- | ------- | -------- | ------------------------------------------ |
| categoryId    | string  | No       | Category ID (null for root/common banners) |
| imageUrl      | string  | Yes      | Image URL                                  |
| imagePublicId | string  | No       | Cloudinary public ID                       |
| linkUrl       | string  | No       | Click-through URL                          |
| sortOrder     | number  | No       | Sort order (default: 0)                    |
| isActive      | boolean | No       | Active status (default: true)              |

### Response (201)

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Banner created",
  "data": {
    "id": "cm7x1a1...",
    "categoryId": null,
    "imageUrl": "https://res.cloudinary.com/.../banner-home.jpg",
    "imagePublicId": "c2b/images/banner-home",
    "linkUrl": "https://example.com/promo",
    "sortOrder": 0,
    "isActive": true,
    "category": null
  }
}
```

---

## 4. Update Banner (Admin)

**PATCH** `/banners/:id`

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| id        | string | Yes      | Banner ID   |

### Request Body

```json
{
  "sortOrder": 2,
  "isActive": false
}
```

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Banner updated",
  "data": {
    "id": "cm7x1a1...",
    "sortOrder": 2,
    "isActive": false,
    "category": null
  }
}
```

---

## 5. Delete Banner (Admin — Soft Delete)

**DELETE** `/banners/:id`

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| id        | string | Yes      | Banner ID   |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Banner deleted",
  "data": null
}
```

### Notes

- Soft delete: sets `isDeleted: true` and `deletedAt` timestamp.
- Banners are ordered by `sortOrder` ascending.
- `categoryId: null` means root/common banner (shown on homepage).
- Permission required for admin endpoints: `banner.manage`
