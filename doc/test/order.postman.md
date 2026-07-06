# C2B Backend — Order Postman Test Guide

**Base URL:** `http://localhost:5000`

All order routes are under `/api/v1/orders` and require a valid session cookie.

> **Prerequisites:** Create a category → product → variant first. You need `variantId` to create an order.

---

## Auth Flow (Prerequisite)

**POST** `http://localhost:5000/api/auth/sign-in/email`

```json
{
  "email": "owner@gmail.com",
  "password": "owner1234"
}
```

---

## 1. Create Order — In-Store

**POST** `/api/v1/orders`

### Minimal

```json
{
  "method": "IN_STORE",
  "storeId": "<store-id>",
  "items": [
    {
      "variantId": "<variant-id>",
      "condition": "USED",
      "quantity": 1
    }
  ]
}
```

### With deductions

```json
{
  "method": "IN_STORE",
  "storeId": "<store-id>",
  "items": [
    {
      "variantId": "<variant-id>",
      "condition": "USED",
      "quantity": 1,
      "notes": "Screen has minor scratches",
      "deductionIds": ["<deduction-id-1>", "<deduction-id-2>"]
    }
  ]
}
```

### Multiple items

```json
{
  "method": "IN_STORE",
  "storeId": "<store-id>",
  "items": [
    {
      "variantId": "<variant-id-1>",
      "condition": "NEW",
      "quantity": 1
    },
    {
      "variantId": "<variant-id-2>",
      "condition": "USED",
      "quantity": 2,
      "deductionIds": ["<deduction-id>"]
    }
  ]
}
```

---

## 2. Create Order — Mail-In

**POST** `/api/v1/orders`

```json
{
  "method": "MAIL_IN",
  "shippingAddressId": "<address-id>",
  "courier": "STEADFAST",
  "items": [
    {
      "variantId": "<variant-id>",
      "condition": "USED",
      "quantity": 1
    }
  ]
}
```

> **Courier options:** `STEADFAST`, `PATHAO`, `REDX`, `PAPERFLY`, `E_DESH`, `SA_PARCEL`, `SUNDARBAN`

---

## 3. Create Order — Corporate

**POST** `/api/v1/orders`

```json
{
  "method": "CORPORATE",
  "items": [
    {
      "variantId": "<variant-id>",
      "condition": "USED",
      "quantity": 5
    }
  ]
}
```

---

## 4. List Orders

**GET** `/api/v1/orders?page=1&limit=20&status=PENDING&method=IN_STORE&search=BB-2026`

**Query params (all optional):**

| Param    | Type   | Default | Description                        |
| -------- | ------ | ------- | ---------------------------------- |
| `page`   | number | 1       | Page number                        |
| `limit`  | number | 20      | Items per page                     |
| `status` | string | —       | Filter by status                   |
| `method` | string | —       | `IN_STORE`, `MAIL_IN`, `CORPORATE` |
| `search` | string | —       | Search by order number             |

> **Note:** Non-admin users only see their own orders. Admins see all.

---

## 5. Get Order by ID

**GET** `/api/v1/orders/:id`

---

## 6. Get Order by Order Number

**GET** `/api/v1/orders/number/BB-2026-000001`

---

## 7. Update Order Status (Admin)

**PATCH** `/api/v1/orders/:id/status`

**Permission:** `order.update`

```json
{
  "status": "UNDER_INSPECTION",
  "note": "Items received, inspection started"
}
```

### Status flow

```
PENDING → SUBMITTED → SHIPPED → RECEIVED → UNDER_INSPECTION
  → APPROVED → PAYMENT_PENDING → PAID → COMPLETED

At any point:
  → REJECTED (with note)
  → CANCELLED (customer or admin)
  → RETURNED (after rejection)
```

---

## 8. Update Tracking Number (Admin)

**PATCH** `/api/v1/orders/:id/tracking`

**Permission:** `order.update`

```json
{
  "trackingNumber": "SF1234567890"
}
```

> Used for mail-in orders when the customer ships items.

---

## 9. Cancel Order

**PATCH** `/api/v1/orders/:id/cancel`

> Cannot cancel if status is `COMPLETED`, `CANCELLED`, or `PAID`.

---

## Field Reference

### method

| Value       | Description                      |
| ----------- | -------------------------------- |
| `IN_STORE`  | Customer visits a physical store |
| `MAIL_IN`   | Customer ships items via courier |
| `CORPORATE` | Bulk corporate buyback           |

### condition

| Value  | Description         |
| ------ | ------------------- |
| `NEW`  | Brand new, unopened |
| `USED` | Pre-owned item      |

### status

| Value              | Description                        |
| ------------------ | ---------------------------------- |
| `PENDING`          | Order created, awaiting submission |
| `SUBMITTED`        | Customer submitted the order       |
| `SHIPPED`          | Items shipped (mail-in)            |
| `RECEIVED`         | Items received at store/warehouse  |
| `UNDER_INSPECTION` | Being inspected                    |
| `APPROVED`         | Inspection passed                  |
| `REJECTED`         | Inspection failed                  |
| `PAYMENT_PENDING`  | Awaiting payment                   |
| `PAID`             | Payment completed                  |
| `COMPLETED`        | Order fully processed              |
| `RETURNED`         | Items returned to customer         |
| `CANCELLED`        | Order cancelled                    |

### courier

| Value       |
| ----------- |
| `STEADFAST` |
| `PATHAO`    |
| `REDX`      |
| `PAPERFLY`  |
| `E_DESH`    |
| `SA_PARCEL` |
| `SUNDARBAN` |

---

## Permission Reference

| Permission Key | Description             | Endpoints                                                |
| -------------- | ----------------------- | -------------------------------------------------------- |
| `order.view`   | List / view orders      | `GET /orders`, `GET /orders/:id`                         |
| `order.update` | Update status, tracking | `PATCH /orders/:id/status`, `PATCH /orders/:id/tracking` |

---

## Postman Tips

1. **Cookie handling:** After login, Postman auto-sends cookies.
2. **Variant ID:** Create a product with variants first, then use the variant `id` in order items.
3. **Deduction IDs:** Get deduction IDs from the variant response. Only deductions matching the item's `condition` are applied.
4. **Price snapshot:** Order items store price snapshots at creation time — price changes after order creation don't affect existing orders.
5. **Order number format:** `BB-YYYY-XXXXXX` (e.g. `BB-2026-000001`).
6. **Status history:** Every status change is recorded in `OrderStatusHistory` with who changed it and when.
