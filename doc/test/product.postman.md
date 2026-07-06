# C2B Backend — Product Postman Test Guide

**Base URL:** `http://localhost:5000`

All product routes are under `/api/v1/products`.

> **Auth note:** Admin routes require session cookie + corresponding permission.

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

## Product

### 1. Create Product (Admin)

**POST** `/api/v1/products`

**Permission:** `product.manage`

#### Minimal

```json
{
  "slug": "iphone-15-pro",
  "categoryId": "<category-id>",
  "translations": [
    { "locale": "EN", "name": "iPhone 15 Pro" },
    { "locale": "BN", "name": "আইফোন ১৫ প্রো" }
  ]
}
```

#### With variants & deductions

```json
{
  "slug": "iphone-15-pro",
  "categoryId": "<category-id>",
  "imageUrl": "https://example.com/iphone15pro.jpg",
  "isActive": true,
  "translations": [
    { "locale": "EN", "name": "iPhone 15 Pro" },
    { "locale": "BN", "name": "আইফোন ১৫ প্রো" }
  ],
  "variants": [
    {
      "sku": "IP15P-128-BLK",
      "storage": "128GB",
      "color": "Black",
      "newPrice": 149800,
      "usedPrice": 99800,
      "currency": "JPY",
      "maxQuantityPerOrder": 2,
      "dailyPurchaseLimit": 5,
      "deductions": [
        {
          "condition": "USED",
          "amount": 5000,
          "sortOrder": 1,
          "translations": [
            { "locale": "EN", "label": "Opened box" },
            { "locale": "BN", "label": "বক্স খোলা" }
          ]
        },
        {
          "condition": "USED",
          "amount": 10000,
          "sortOrder": 2,
          "translations": [
            { "locale": "EN", "label": "No box" },
            { "locale": "BN", "label": "বক্স নেই" }
          ]
        }
      ]
    },
    {
      "sku": "IP15P-256-WHT",
      "storage": "256GB",
      "color": "White",
      "newPrice": 169800,
      "usedPrice": 119800,
      "currency": "JPY"
    }
  ]
}
```

---

### 2. List Products (Public)

**GET** `/api/v1/products?page=1&limit=20&search=iphone&categoryId=<id>&isActive=true&locale=EN`

| Param        | Type                 | Description                       |
| ------------ | -------------------- | --------------------------------- |
| `page`       | number               | Default: 1                        |
| `limit`      | number               | Default: 20                       |
| `search`     | string               | Searches slug + translation names |
| `categoryId` | string               | Filter by category                |
| `isActive`   | `"true"` / `"false"` |                                   |
| `locale`     | `"EN"` / `"BN"`      | Filter translations               |

---

### 3. Get Product by Slug (Public)

**GET** `/api/v1/products/slug/iphone-15-pro`

---

### 4. Get Product by ID (Public)

**GET** `/api/v1/products/:id`

---

### 5. Update Product (Admin)

**PATCH** `/api/v1/products/:id`

**Permission:** `product.manage`

```json
{
  "slug": "iphone-15-pro-max",
  "translations": [
    { "locale": "EN", "name": "iPhone 15 Pro Max" },
    { "locale": "BN", "name": "আইফোন ১৫ প্রো ম্যাক্স" }
  ]
}
```

> All fields optional. Translations are **replaced** when provided.

---

### 6. Delete Product (Admin) — Soft Delete

**DELETE** `/api/v1/products/:id`

**Permission:** `product.manage`

---

## Variant

### 7. Create Variant (Admin)

**POST** `/api/v1/products/:productId/variants`

**Permission:** `variant.manage`

```json
{
  "sku": "IP15P-512-BLU",
  "storage": "512GB",
  "color": "Blue",
  "newPrice": 189800,
  "usedPrice": 139800,
  "currency": "JPY",
  "maxQuantityPerOrder": 1,
  "deductions": [
    {
      "condition": "USED",
      "amount": 8000,
      "sortOrder": 1,
      "translations": [
        { "locale": "EN", "label": "Scratches on body" },
        { "locale": "BN", "label": "বডিতে দাগ" }
      ]
    }
  ]
}
```

---

### 8. List Variants (Public)

**GET** `/api/v1/products/variants?page=1&limit=20&productId=<id>&storage=128GB&isActive=true`

| Param       | Type                 | Description                    |
| ----------- | -------------------- | ------------------------------ |
| `page`      | number               | Default: 1                     |
| `limit`     | number               | Default: 20                    |
| `search`    | string               | Searches SKU + storage + color |
| `productId` | string               | Filter by product              |
| `storage`   | string               | Filter by storage              |
| `isActive`  | `"true"` / `"false"` |                                |

---

### 9. Get Variant by ID (Public)

**GET** `/api/v1/products/variants/:id`

---

### 10. Update Variant (Admin)

**PATCH** `/api/v1/products/variants/:id`

**Permission:** `variant.manage`

```json
{
  "newPrice": 144800,
  "usedPrice": 94800,
  "isActive": true
}
```

---

### 11. Delete Variant (Admin) — Soft Delete

**DELETE** `/api/v1/products/variants/:id`

**Permission:** `variant.manage`

---

## Deduction

### 12. Create Deduction (Admin)

**POST** `/api/v1/products/variants/:variantId/deductions`

**Permission:** `deduction.manage`

```json
{
  "condition": "USED",
  "amount": 15000,
  "sortOrder": 3,
  "translations": [
    { "locale": "EN", "label": "Cracked screen" },
    { "locale": "BN", "label": "স্ক্রিন ভাঙা" }
  ]
}
```

---

### 13. Update Deduction (Admin)

**PATCH** `/api/v1/products/deductions/:deductionId`

**Permission:** `deduction.manage`

```json
{
  "amount": 20000,
  "translations": [
    { "locale": "EN", "label": "Cracked screen (updated)" },
    { "locale": "BN", "label": "স্ক্রিন ভাঙা (আপডেট)" }
  ]
}
```

---

### 14. Delete Deduction (Admin) — Soft Delete

**DELETE** `/api/v1/products/deductions/:deductionId`

**Permission:** `deduction.manage`

---

## Price History

### 15. Update Price (Admin)

**PATCH** `/api/v1/products/variants/:variantId/price`

**Permission:** `price.manage`

```json
{
  "condition": "USED",
  "newPrice": 89800
}
```

> Automatically writes a `PriceHistory` entry with old price, new price, and who changed it.

---

### 16. Get Price History (Admin)

**GET** `/api/v1/products/variants/:variantId/price-history?page=1&limit=20`

**Permission:** `price.manage`

---

## Field Reference

### condition

| Value  | Description    |
| ------ | -------------- |
| `NEW`  | Brand new item |
| `USED` | Pre-owned item |

### locale

| Value | Language |
| ----- | -------- |
| `EN`  | English  |
| `BN`  | Bengali  |

### currency

ISO 4217 code. Default: `JPY`.

### sortOrder

Integer for ordering deductions (lower = shown first).

---

## Permission Reference

| Permission Key     | Description                         | Endpoints                                                                          |
| ------------------ | ----------------------------------- | ---------------------------------------------------------------------------------- |
| `product.manage`   | Create / update / delete products   | `POST /products`, `PATCH /products/:id`, `DELETE /products/:id`                    |
| `variant.manage`   | Create / update / delete variants   | `POST /products/:id/variants`, `PATCH /variants/:id`, `DELETE /variants/:id`       |
| `deduction.manage` | Create / update / delete deductions | `POST /variants/:id/deductions`, `PATCH /deductions/:id`, `DELETE /deductions/:id` |
| `price.manage`     | Update prices + view history        | `PATCH /variants/:id/price`, `GET /variants/:id/price-history`                     |

---

## Postman Tips

1. **Cookie handling:** After login, Postman auto-sends cookies.
2. **RBAC seeding:** Run `npm run seed:rbac` before testing admin endpoints.
3. **Category first:** Create a category before creating products (need `categoryId`).
4. **Product before variant:** Create a product before adding variants (need `productId`).
5. **Variant before deduction:** Create a variant before adding deductions (need `variantId`).
6. **SKU uniqueness:** SKUs must be unique across all variants. Use a clear naming convention like `IP15P-128-BLK`.
