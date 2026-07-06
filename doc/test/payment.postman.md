# Payment API Documentation

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

All payment endpoints require a valid session cookie (`better-auth.session_token`) obtained from login.

---

## 1. List All Payments (Admin)

**GET** `/payments`

### Query Parameters

| Parameter | Type   | Required | Description                                   |
| --------- | ------ | -------- | --------------------------------------------- |
| page      | number | No       | Page number (default: 1)                      |
| limit     | number | No       | Items per page (default: 20, max 100)         |
| status    | string | No       | Filter by status: `PENDING`, `PAID`, `FAILED` |
| orderId   | string | No       | Filter by order ID                            |
| method    | string | No       | Filter by payment method                      |
| search    | string | No       | Search by reference or order number           |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Payments retrieved successfully",
  "data": [
    {
      "id": "cm7x2k9...",
      "orderId": "cm7x1a8...",
      "method": "STORE_CASH",
      "status": "PENDING",
      "amount": "15000.00",
      "currency": "JPY",
      "paidAt": null,
      "reference": null,
      "createdAt": "2026-06-21T10:00:00.000Z",
      "updatedAt": "2026-06-21T10:00:00.000Z",
      "order": {
        "id": "cm7x1a8...",
        "orderNumber": "ORD-20260621-00001",
        "status": "PAYMENT_PENDING",
        "user": {
          "id": "cm7x0f3...",
          "email": "customer@example.com",
          "name": "John Doe"
        }
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

## 2. Get Payment by ID (Admin)

**GET** `/payments/:id`

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| id        | string | Yes      | Payment ID  |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Payment retrieved successfully",
  "data": {
    "id": "cm7x2k9...",
    "orderId": "cm7x1a8...",
    "method": "STORE_CASH",
    "status": "PENDING",
    "amount": "15000.00",
    "currency": "JPY",
    "paidAt": null,
    "reference": null,
    "createdAt": "2026-06-21T10:00:00.000Z",
    "updatedAt": "2026-06-21T10:00:00.000Z",
    "order": {
      "id": "cm7x1a8...",
      "orderNumber": "ORD-20260621-00001",
      "status": "PAYMENT_PENDING",
      "items": [
        {
          "variant": {
            "sku": "IP15-128-BLK",
            "storage": "128GB",
            "color": "Black"
          }
        }
      ],
      "user": {
        "id": "cm7x0f3...",
        "email": "customer@example.com",
        "name": "John Doe"
      }
    }
  }
}
```

---

## 3. Get Payment by Order ID (Admin)

**GET** `/payments/order/:orderId`

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| orderId   | string | Yes      | Order ID    |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Payment retrieved successfully",
  "data": {
    "id": "cm7x2k9...",
    "orderId": "cm7x1a8...",
    "method": "STORE_CASH",
    "status": "PENDING",
    "amount": "15000.00",
    "currency": "JPY",
    "paidAt": null,
    "reference": null,
    "createdAt": "2026-06-21T10:00:00.000Z",
    "updatedAt": "2026-06-21T10:00:00.000Z",
    "order": {
      "id": "cm7x1a8...",
      "orderNumber": "ORD-20260621-00001",
      "status": "PAYMENT_PENDING",
      "items": [],
      "user": {
        "id": "cm7x0f3...",
        "email": "customer@example.com",
        "name": "John Doe"
      }
    }
  }
}
```

---

## 4. Update Payment Status (Admin)

**PATCH** `/payments/:id`

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| id        | string | Yes      | Payment ID  |

### Request Body

```json
{
  "status": "PAID",
  "method": "STORE_CASH",
  "reference": "CASH-20260621-001"
}
```

### Body Fields

| Field     | Type   | Required | Description                                          |
| --------- | ------ | -------- | ---------------------------------------------------- |
| status    | string | Yes      | `PAID` or `FAILED`                                   |
| method    | string | No       | Payment method (e.g., `STORE_CASH`, `BANK_TRANSFER`) |
| reference | string | No       | Payment reference / transaction ID                   |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Payment updated successfully",
  "data": {
    "id": "cm7x2k9...",
    "orderId": "cm7x1a8...",
    "method": "STORE_CASH",
    "status": "PAID",
    "amount": "15000.00",
    "currency": "JPY",
    "paidAt": "2026-06-21T12:00:00.000Z",
    "reference": "CASH-20260621-001",
    "createdAt": "2026-06-21T10:00:00.000Z",
    "updatedAt": "2026-06-21T12:00:00.000Z",
    "order": {
      "id": "cm7x1a8...",
      "orderNumber": "ORD-20260621-00001",
      "status": "PAID",
      "items": [],
      "user": {
        "id": "cm7x0f3...",
        "email": "customer@example.com",
        "name": "John Doe"
      }
    }
  }
}
```

### Notes

- When status is updated to `PAID`, the associated order status is automatically updated to `PAID` and a status history entry is created.
- Already completed (`PAID`) payments cannot be updated again.
- Permission required: `payment.manage`
