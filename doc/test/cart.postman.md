# Cart API Documentation

## Base URL

```
http://localhost:5000/api/v1
```

## Authentication

All cart endpoints require a valid session cookie (`better-auth.session_token`) obtained from login.

---

## 1. Get My Cart

**GET** `/cart/my`

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Cart retrieved successfully",
  "data": {
    "id": "cm7x3a1...",
    "userId": "cm7x0f3...",
    "sessionId": null,
    "createdAt": "2026-06-21T10:00:00.000Z",
    "updatedAt": "2026-06-21T10:00:00.000Z",
    "items": [
      {
        "id": "cm7x4b2...",
        "cartId": "cm7x3a1...",
        "variantId": "cm7x5c3...",
        "condition": "USED",
        "quantity": 2,
        "notes": "Prefer original box",
        "expiresAt": "2026-06-21T10:30:00.000Z",
        "createdAt": "2026-06-21T10:00:00.000Z",
        "variant": {
          "id": "cm7x5c3...",
          "sku": "IP15-128-BLK",
          "storage": "128GB",
          "color": "Black",
          "product": {
            "id": "cm7x6d4...",
            "name": "iPhone 15",
            "slug": "iphone-15",
            "images": ["https://..."],
            "category": {
              "id": "cm7x7e5...",
              "name": "Smartphones"
            }
          }
        },
        "deductions": [
          {
            "deduction": {
              "id": "cm7x8f6...",
              "name": "Cracked Screen",
              "amount": "5000.00",
              "group": {
                "id": "cm7x9g7...",
                "name": "Screen Condition"
              }
            }
          }
        ]
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

---

## 2. Add Item to Cart

**POST** `/cart/items`

### Request Body

```json
{
  "variantId": "cm7x5c3...",
  "condition": "USED",
  "quantity": 1,
  "notes": "Prefer original box",
  "deductionIds": ["cm7x8f6..."]
}
```

### Body Fields

| Field        | Type   | Required | Description                    |
| ------------ | ------ | -------- | ------------------------------ |
| variantId    | string | Yes      | Product variant ID             |
| condition    | string | Yes      | `NEW` or `USED`                |
| quantity     | number | No       | Quantity (1-99, default: 1)    |
| notes        | string | No       | Item notes (max 500 chars)     |
| deductionIds | array  | No       | Array of variant deduction IDs |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Item added to cart",
  "data": {
    "id": "cm7x3a1...",
    "items": [...]
  }
}
```

---

## 3. Update Cart Item

**PATCH** `/cart/items/:itemId`

### Path Parameters

| Parameter | Type   | Required | Description  |
| --------- | ------ | -------- | ------------ |
| itemId    | string | Yes      | Cart item ID |

### Request Body

```json
{
  "quantity": 3,
  "condition": "USED",
  "notes": "Updated notes",
  "deductionIds": ["cm7x8f6...", "cm7x9g7..."]
}
```

### Body Fields

| Field        | Type   | Required | Description                    |
| ------------ | ------ | -------- | ------------------------------ |
| quantity     | number | No       | Quantity (1-99)                |
| condition    | string | No       | `NEW` or `USED`                |
| notes        | string | No       | Item notes (max 500 chars)     |
| deductionIds | array  | No       | Array of variant deduction IDs |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Cart item updated",
  "data": {
    "id": "cm7x3a1...",
    "items": [...]
  }
}
```

---

## 4. Remove Items from Cart

**DELETE** `/cart/items`

### Request Body

```json
{
  "itemIds": ["cm7x4b2...", "cm7x5c3..."]
}
```

### Body Fields

| Field   | Type  | Required | Description                      |
| ------- | ----- | -------- | -------------------------------- |
| itemIds | array | Yes      | Array of cart item IDs to remove |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Items removed from cart",
  "data": {
    "id": "cm7x3a1...",
    "items": []
  }
}
```

---

## 5. Clear Cart

**DELETE** `/cart/my`

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Cart cleared",
  "data": {
    "id": "cm7x3a1...",
    "items": []
  }
}
```

---

## 6. Merge Guest Cart

**POST** `/cart/merge`

### Request Body

```json
{
  "sessionId": "guest-session-abc123"
}
```

### Body Fields

| Field     | Type   | Required | Description              |
| --------- | ------ | -------- | ------------------------ |
| sessionId | string | Yes      | Guest session identifier |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Guest cart merged successfully",
  "data": {
    "id": "cm7x3a1...",
    "items": [...]
  }
}
```

### Notes

- Merges a guest cart (identified by `sessionId`) into the authenticated user's cart.
- After merge, the guest cart is deleted.
- Typically called right after user login.

---

## 7. Get Cart by ID (Admin)

**GET** `/cart/:id`

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| id        | string | Yes      | Cart ID     |

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Cart retrieved successfully",
  "data": {
    "id": "cm7x3a1...",
    "items": [...]
  }
}
```

---

## 8. Cleanup Expired Cart Items (Admin)

**DELETE** `/cart/cleanup/expired`

### Response (200)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "12 expired cart items removed",
  "data": {
    "removedCount": 12
  }
}
```

### Notes

- Removes all cart items that have passed their 30-minute expiry.
- Permission required: `cart.manage`
