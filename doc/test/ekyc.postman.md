# eKYC API Documentation

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

All eKYC endpoints require a valid session cookie (`better-auth.session_token`) obtained from login.

---

## 1. Get My eKYC Status

**GET** `/ekyc/my`

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "eKYC record retrieved",
  "data": {
    "id": "cm7x1a1...",
    "userId": "cm7x0f3...",
    "status": "PENDING",
    "rejectReason": null,
    "verifiedAt": null,
    "createdAt": "2026-06-21T10:00:00.000Z",
    "updatedAt": "2026-06-21T10:00:00.000Z",
    "documents": [
      {
        "id": "cm7x2b2...",
        "docType": "PASSPORT",
        "fileUrl": "https://res.cloudinary.com/.../passport.jpg",
        "publicId": "c2b/images/abc123-1718966400000-passport",
        "createdAt": "2026-06-21T10:05:00.000Z"
      }
    ],
    "user": {
      "id": "cm7x0f3...",
      "email": "customer@example.com",
      "name": "John Doe"
    }
  }
}
```

### Notes

- If no eKYC record exists, one is auto-created with status `PENDING`.

---

## 2. Upload Document

**POST** `/ekyc/my/documents`

### Content-Type

`multipart/form-data`

### Form Fields

| Field   | Type   | Required | Description                                                     |
| ------- | ------ | -------- | --------------------------------------------------------------- |
| file    | file   | Yes      | Image or PDF file                                               |
| docType | string | Yes      | `PASSPORT`, `DRIVING_LICENSE`, `MY_NUMBER`, or `RESIDENCE_CARD` |

### Response (201)

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "id": "cm7x2b2...",
    "ekycId": "cm7x1a1...",
    "docType": "PASSPORT",
    "fileUrl": "https://res.cloudinary.com/.../passport.jpg",
    "publicId": "c2b/images/abc123-1718966400000-passport",
    "createdAt": "2026-06-21T10:05:00.000Z"
  }
}
```

### Notes

- Files are uploaded to Cloudinary.
- Cannot upload documents if eKYC is already `VERIFIED`.

---

## 3. Remove My Document

**DELETE** `/ekyc/my/documents/:documentId`

### Path Parameters

| Parameter  | Type   | Required | Description      |
| ---------- | ------ | -------- | ---------------- |
| documentId | string | Yes      | eKYC document ID |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Document removed",
  "data": {
    "id": "cm7x2b2...",
    "ekycId": "cm7x1a1...",
    "docType": "PASSPORT",
    "fileUrl": "https://res.cloudinary.com/.../passport.jpg",
    "publicId": "c2b/images/abc123-...",
    "createdAt": "2026-06-21T10:05:00.000Z"
  }
}
```

### Notes

- Users can only remove their own documents.
- Cannot remove documents from a `VERIFIED` eKYC.

---

## 4. List All eKYC Records (Admin)

**GET** `/ekyc`

### Query Parameters

| Parameter | Type   | Required | Description                                         |
| --------- | ------ | -------- | --------------------------------------------------- |
| page      | number | No       | Page number (default: 1)                            |
| limit     | number | No       | Items per page (default: 20, max 100)               |
| status    | string | No       | Filter by status: `PENDING`, `VERIFIED`, `REJECTED` |
| search    | string | No       | Search by user email or name                        |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "eKYC records retrieved",
  "data": [
    {
      "id": "cm7x1a1...",
      "userId": "cm7x0f3...",
      "status": "PENDING",
      "rejectReason": null,
      "verifiedAt": null,
      "createdAt": "2026-06-21T10:00:00.000Z",
      "updatedAt": "2026-06-21T10:00:00.000Z",
      "documents": [
        {
          "id": "cm7x2b2...",
          "docType": "PASSPORT",
          "fileUrl": "https://res.cloudinary.com/.../passport.jpg",
          "createdAt": "2026-06-21T10:05:00.000Z"
        }
      ],
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
    "total": 10,
    "totalPages": 1
  }
}
```

---

## 5. Get eKYC by ID (Admin)

**GET** `/ekyc/:id`

### Path Parameters

| Parameter | Type   | Required | Description    |
| --------- | ------ | -------- | -------------- |
| id        | string | Yes      | eKYC record ID |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "eKYC record retrieved",
  "data": {
    "id": "cm7x1a1...",
    "userId": "cm7x0f3...",
    "status": "PENDING",
    "rejectReason": null,
    "verifiedAt": null,
    "createdAt": "2026-06-21T10:00:00.000Z",
    "updatedAt": "2026-06-21T10:00:00.000Z",
    "documents": [],
    "user": {
      "id": "cm7x0f3...",
      "email": "customer@example.com",
      "name": "John Doe"
    }
  }
}
```

---

## 6. Get eKYC by User ID (Admin)

**GET** `/ekyc/user/:userId`

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| userId    | string | Yes      | User ID     |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "eKYC record retrieved",
  "data": {
    "id": "cm7x1a1...",
    "userId": "cm7x0f3...",
    "status": "PENDING",
    "rejectReason": null,
    "verifiedAt": null,
    "createdAt": "2026-06-21T10:00:00.000Z",
    "updatedAt": "2026-06-21T10:00:00.000Z",
    "documents": [],
    "user": {
      "id": "cm7x0f3...",
      "email": "customer@example.com",
      "name": "John Doe"
    }
  }
}
```

---

## 7. Verify or Reject eKYC (Admin)

**PATCH** `/ekyc/:id/status`

### Path Parameters

| Parameter | Type   | Required | Description    |
| --------- | ------ | -------- | -------------- |
| id        | string | Yes      | eKYC record ID |

### Request Body — Verify

```json
{
  "status": "VERIFIED"
}
```

### Request Body — Reject

```json
{
  "status": "REJECTED",
  "rejectReason": "Document image is blurry, please re-upload"
}
```

### Body Fields

| Field        | Type   | Required    | Description                                        |
| ------------ | ------ | ----------- | -------------------------------------------------- |
| status       | string | Yes         | `VERIFIED` or `REJECTED`                           |
| rejectReason | string | Conditional | Required when status is `REJECTED` (max 500 chars) |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "eKYC verified successfully",
  "data": {
    "id": "cm7x1a1...",
    "userId": "cm7x0f3...",
    "status": "VERIFIED",
    "rejectReason": null,
    "verifiedAt": "2026-06-21T12:00:00.000Z",
    "createdAt": "2026-06-21T10:00:00.000Z",
    "updatedAt": "2026-06-21T12:00:00.000Z",
    "documents": [],
    "user": {
      "id": "cm7x0f3...",
      "email": "customer@example.com",
      "name": "John Doe"
    }
  }
}
```

### Notes

- Already `VERIFIED` eKYC cannot be changed.
- An audit log entry is created on status change.
- Permission required: `ekyc.manage`
