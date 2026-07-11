# Address API Documentation

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

Address CRUD endpoints require a valid session cookie (`better-auth.session_token`). Division & district listing is public.

---

## 1. List Divisions

**GET** `/addresses/divisions`

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Divisions retrieved",
  "data": [
    {
      "id": 1,
      "code": "BD-1",
      "nameEn": "Dhaka",
      "nameBn": "ঢাকা"
    },
    {
      "id": 2,
      "code": "BD-2",
      "nameEn": "Chattogram",
      "nameBn": "চট্টগ্রাম"
    }
  ]
}
```

---

## 2. List Districts by Division

**GET** `/addresses/divisions/:divisionId/districts`

### Path Parameters

| Parameter  | Type | Required | Description       |
| ---------- | ---- | -------- | ----------------- |
| divisionId | int  | Yes      | Division ID (1–8) |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Districts retrieved",
  "data": [
    {
      "id": 1,
      "code": "BD-DHA",
      "nameEn": "Dhaka",
      "nameBn": "ঢাকা",
      "divisionId": 1
    }
  ]
}
```

---

## 3. List Districts (paginated, searchable)

**GET** `/addresses/districts`

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
  "message": "Districts retrieved",
  "data": [
    {
      "id": 1,
      "code": "BD-DHA",
      "nameEn": "Dhaka",
      "nameBn": "ঢাকা",
      "divisionId": 1
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 64,
    "totalPages": 2
  }
}
```

---

## 4. Get My Addresses

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
      "telephone": "01712345678",
      "postCode": "1207",
      "districtId": 1,
      "cityTownVillage": "Dhaka Kotwali",
      "streetAddress": "12/A Dhanmondi R/A",
      "apartment": "Flat 4B",
      "isDefault": true,
      "isDeleted": false,
      "deletedAt": null,
      "createdAt": "2026-06-21T10:00:00.000Z",
      "updatedAt": "2026-06-21T10:00:00.000Z",
      "district": {
        "id": 1,
        "code": "BD-DHA",
        "nameEn": "Dhaka",
        "nameBn": "ঢাকা"
      }
    }
  ]
}
```

---

## 5. Get Single Address

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
    "telephone": "01712345678",
    "postCode": "1207",
    "districtId": 1,
    "cityTownVillage": "Dhaka Kotwali",
    "streetAddress": "12/A Dhanmondi R/A",
    "apartment": "Flat 4B",
    "isDefault": true,
    "district": {
      "id": 1,
      "code": "BD-DHA",
      "nameEn": "Dhaka",
      "nameBn": "ঢাকা"
    }
  }
}
```

---

## 6. Create Address

**POST** `/addresses/my`

### Request Body

```json
{
  "type": "HOME",
  "label": "My Home",
  "recipientName": "John Doe",
  "telephone": "01712345678",
  "postCode": "1207",
  "districtId": 1,
  "cityTownVillage": "Dhaka Kotwali",
  "streetAddress": "12/A Dhanmondi R/A",
  "apartment": "Flat 4B",
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
| districtId      | number  | Yes      | District ID (from districts list)                 |
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
    "postCode": "1207",
    "districtId": 1,
    "cityTownVillage": "Dhaka Kotwali",
    "streetAddress": "12/A Dhanmondi R/A",
    "apartment": "Flat 4B",
    "isDefault": true,
    "district": {
      "id": 1,
      "code": "BD-DHA",
      "nameEn": "Dhaka",
      "nameBn": "ঢাকা"
    }
  }
}
```

---

## 7. Update Address

**PATCH** `/addresses/my/:id`

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| id        | string | Yes      | Address ID  |

### Request Body

```json
{
  "label": "Updated Label",
  "telephone": "01898765432",
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
    "telephone": "01898765432",
    "isDefault": false,
    "district": {
      "id": 1,
      "code": "BD-DHA",
      "nameEn": "Dhaka",
      "nameBn": "ঢাকা"
    }
  }
}
```

---

## 8. Delete Address (Soft Delete)

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

## 9. Set Default Address

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
    "district": {
      "id": 1,
      "code": "BD-DHA",
      "nameEn": "Dhaka",
      "nameBn": "ঢাকা"
    }
  }
}
```

### Notes

- Setting a new default automatically unsets the previous default.
- Division & district listing is public (no auth required).
- Addresses are soft-deleted (`isDeleted: true`).
