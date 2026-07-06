# Address API Documentation

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

Address CRUD endpoints require a valid session cookie (`better.auth.session_token`). Prefecture listing is public.

---

## 1. List Prefectures

**GET** `/addresses/prefectures`

### Query Parameters

| Parameter | Type   | Required | Description                           |
| --------- | ------ | -------- | ------------------------------------- |
| page      | number | No       | Page number (default: 1)              |
| limit     | number | No       | Items per page (default: 50, max 100) |
| search    | string | No       | Search by name (EN/BN) or code        |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Prefectures retrieved",
  "data": [
    {
      "id": 13,
      "code": "JP-13",
      "nameEn": "Tokyo",
      "nameBn": "টোকিও"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 47,
    "totalPages": 1
  }
}
```

---

## 2. Get My Addresses

**GET** `/addresses/my`

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Addresses retrieved",
  "data": [
    {
      "id": "cm7x1a1...",
      "userId": "cm7x0f3...",
      "type": "HOME",
      "label": "My Home",
      "recipientName": "John Doe",
      "telephone": "090-1234-5678",
      "postCode": "100-0001",
      "prefectureId": 13,
      "cityTownVillage": "Chiyoda-ku",
      "streetAddress": "1-1-1 Chiyoda",
      "apartment": "Tower A 1201",
      "isDefault": true,
      "isDeleted": false,
      "deletedAt": null,
      "createdAt": "2026-06-21T10:00:00.000Z",
      "updatedAt": "2026-06-21T10:00:00.000Z",
      "prefecture": {
        "id": 13,
        "code": "JP-13",
        "nameEn": "Tokyo",
        "nameBn": "টোকিও"
      }
    }
  ]
}
```

---

## 3. Get Single Address

**GET** `/addresses/my/:id`

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| id        | string | Yes      | Address ID  |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Address retrieved",
  "data": {
    "id": "cm7x1a1...",
    "type": "HOME",
    "label": "My Home",
    "recipientName": "John Doe",
    "telephone": "090-1234-5678",
    "postCode": "100-0001",
    "prefectureId": 13,
    "cityTownVillage": "Chiyoda-ku",
    "streetAddress": "1-1-1 Chiyoda",
    "apartment": "Tower A 1201",
    "isDefault": true,
    "prefecture": {
      "id": 13,
      "code": "JP-13",
      "nameEn": "Tokyo",
      "nameBn": "টোকিও"
    }
  }
}
```

---

## 4. Create Address

**POST** `/addresses/my`

### Request Body

```json
{
  "type": "HOME",
  "label": "My Home",
  "recipientName": "John Doe",
  "telephone": "090-1234-5678",
  "postCode": "100-0001",
  "prefectureId": 13,
  "cityTownVillage": "Chiyoda-ku",
  "streetAddress": "1-1-1 Chiyoda",
  "apartment": "Tower A 1201",
  "isDefault": true
}
```

### Body Fields

| Field           | Type    | Required | Description                                       |
| --------------- | ------- | -------- | ------------------------------------------------- |
| type            | string  | No       | `HOME` (default), `SHIPPING`, `RETURN`, `COMPANY` |
| label           | string  | No       | Friendly name (max 50 chars)                      |
| recipientName   | string  | No       | Recipient name (max 100 chars)                    |
| telephone       | string  | No       | Phone number (max 20 chars)                       |
| postCode        | string  | Yes      | Postal code                                       |
| prefectureId    | number  | Yes      | Prefecture ID (from prefectures list)             |
| cityTownVillage | string  | Yes      | City/Town/Village                                 |
| streetAddress   | string  | Yes      | Street address                                    |
| apartment       | string  | No       | Apartment/building (max 100 chars)                |
| isDefault       | boolean | No       | Set as default address                            |

### Response (201)

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Address created",
  "data": {
    "id": "cm7x1a1...",
    "type": "HOME",
    "label": "My Home",
    "postCode": "100-0001",
    "prefectureId": 13,
    "cityTownVillage": "Chiyoda-ku",
    "streetAddress": "1-1-1 Chiyoda",
    "apartment": "Tower A 1201",
    "isDefault": true,
    "prefecture": {
      "id": 13,
      "code": "JP-13",
      "nameEn": "Tokyo",
      "nameBn": "টোকিও"
    }
  }
}
```

---

## 5. Update Address

**PATCH** `/addresses/my/:id`

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| id        | string | Yes      | Address ID  |

### Request Body

```json
{
  "label": "Updated Label",
  "telephone": "080-9876-5432",
  "isDefault": false
}
```

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Address updated",
  "data": {
    "id": "cm7x1a1...",
    "label": "Updated Label",
    "telephone": "080-9876-5432",
    "isDefault": false,
    "prefecture": {
      "id": 13,
      "code": "JP-13",
      "nameEn": "Tokyo",
      "nameBn": "টোকিও"
    }
  }
}
```

---

## 6. Delete Address (Soft Delete)

**DELETE** `/addresses/my/:id`

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| id        | string | Yes      | Address ID  |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Address deleted",
  "data": null
}
```

---

## 7. Set Default Address

**PATCH** `/addresses/my/:id/default`

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| id        | string | Yes      | Address ID  |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Default address updated",
  "data": {
    "id": "cm7x1a1...",
    "isDefault": true,
    "prefecture": {
      "id": 13,
      "code": "JP-13",
      "nameEn": "Tokyo",
      "nameBn": "টোকিও"
    }
  }
}
```

### Notes

- Setting a new default automatically unsets the previous default.
- Prefecture listing is public (no auth required).
- Addresses are soft-deleted (`isDeleted: true`).
