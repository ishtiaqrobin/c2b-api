# C2B Backend — Product Postman Test Guide

**Base URL:** `http://localhost:5000`

All product routes are under `/api/v1/products`.

> **Auth note:** Admin routes require session cookie + corresponding permission.
>
> ⚠️ **Corrected from the previous version of this doc:** the actual
> `product.interface.ts` / `product.validation.ts` do **not** have a
> translations/locale system. `Product.name` and `VariantDeduction.label`
> are plain strings, not `translations: [{ locale, name }]` arrays. This
> doc has been rewritten to match the real code — don't send
> `translations` or `locale`, they'll just be ignored (no validation
> error, but they won't do anything).

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

**Content-Type:** `multipart/form-data` (image upload is handled by multer)
— if you're not attaching an image, plain `application/json` also works
since the image field is optional.

#### Minimal (JSON body, no image)

```json
{
  "slug": "iphone-15-pro",
  "categoryId": "<category-id>",
  "name": "iPhone 15 Pro"
}
```

#### With image (form-data fields)

| Key          | Type | Value                  |
| ------------ | ---- | ---------------------- |
| `image`      | File | (attach product photo) |
| `slug`       | Text | `iphone-15-pro`        |
| `categoryId` | Text | `<category-id>`        |
| `name`       | Text | `iPhone 15 Pro`        |
| `isActive`   | Text | `true`                 |

> Nested fields like `variants` are harder to send correctly as
> form-data (they'd need to be JSON-stringified and parsed server-side,
> which this module does **not** currently do). For product creation
> **with** variants in one call, send plain JSON (no image) — see below
> — then attach the product image afterward via `PATCH /:id` as
> form-data, or create variants separately via endpoint #7.

#### With variants & deductions (JSON body, no image)

```json
{
  "slug": "iphone-15-pro",
  "categoryId": "<category-id>",
  "isActive": true,
  "name": "iPhone 15 Pro",
  "variants": [
    {
      "sku": "IP15P-128-BLK",
      "storage": "128GB",
      "color": "Black",
      "newPrice": 149800,
      "usedPrice": 99800,
      "currency": "BDT",
      "maxQuantityPerOrder": 2,
      "dailyPurchaseLimit": 5,
      "deductions": [
        {
          "condition": "USED",
          "amount": 5000,
          "sortOrder": 1,
          "label": "Opened box"
        },
        {
          "condition": "USED",
          "amount": 10000,
          "sortOrder": 2,
          "label": "No box"
        }
      ]
    },
    {
      "sku": "IP15P-256-WHT",
      "storage": "256GB",
      "color": "White",
      "newPrice": 169800,
      "usedPrice": 119800,
      "currency": "BDT"
    }
  ]
}
```

> `currency` defaults to `"BDT"` if omitted — matches the schema default.
> `imageUrl`/`imagePublicId` inside a `variants[]` entry are accepted
> only if you already have a hosted URL (e.g. pre-uploaded to
> Cloudinary elsewhere); the nested create path does not run variants
> through multer.

---

### 2. List Products (Public)

**GET** `/api/v1/products?page=1&limit=20&search=iphone&categoryId=<id>&isActive=true`

| Param        | Type                 | Description          |
| ------------ | -------------------- | -------------------- |
| `page`       | number               | Default: 1           |
| `limit`      | number               | Default: 20          |
| `search`     | string               | Searches slug + name |
| `categoryId` | string               | Filter by category   |
| `isActive`   | `"true"` / `"false"` |                      |

> ⚠️ `locale` param removed — no locale system exists.
>
> Response now includes `category: { id, slug, name, parent: { id, slug, name } }`
> on every product (previously only `{ id, slug }`) so the frontend can
> build a full breadcrumb without a second call. Each product also
> carries `_count.variants` — **not** the full variant list. To browse
> actual variant cards (price, storage, color) for a category, use
> endpoint #8 with `categoryId` instead — see the note there.

---

### 3. Get Product by Slug (Public)

**GET** `/api/v1/products/slug/iphone-15-pro`

Returns the product with its full `variants[]` (including `deductions[]`)
and `category` (with `name` + `parent`).

---

### 4. Get Product by ID (Public)

**GET** `/api/v1/products/:id`

Same shape as #3.

---

### 5. Update Product (Admin)

**PATCH** `/api/v1/products/:id`

**Permission:** `product.manage`

**Content-Type:** `multipart/form-data` if replacing the image, otherwise
`application/json`.

```json
{
  "slug": "iphone-15-pro-max",
  "name": "iPhone 15 Pro Max"
}
```

> All fields optional. `translations` removed — just send `name`
> directly. If you attach a new `image` file, the old Cloudinary image
> is automatically deleted.

---

### 6. Delete Product (Admin) — Soft Delete

**DELETE** `/api/v1/products/:id`

**Permission:** `product.manage`

> **Behavior change:** deleting a product now also soft-deletes all of
> its variants (cascade) and removes the product's image **and every
> active variant's image** from Cloudinary. Previously only the
> product's own image was cleaned up and variants were left dangling.

---

## Variant

### 7. Create Variant (Admin)

**POST** `/api/v1/products/:productId/variants`

**Permission:** `variant.manage`

**Content-Type:** `multipart/form-data` (variant image upload now
supported) — plain JSON still works if you're not attaching a photo.

#### With image (form-data fields)

| Key                   | Type | Value                                        |
| --------------------- | ---- | -------------------------------------------- |
| `image`               | File | (attach this variant's color-specific photo) |
| `sku`                 | Text | `IP15P-512-BLU`                              |
| `storage`             | Text | `512GB`                                      |
| `color`               | Text | `Blue`                                       |
| `newPrice`            | Text | `189800`                                     |
| `usedPrice`           | Text | `139800`                                     |
| `currency`            | Text | `BDT`                                        |
| `maxQuantityPerOrder` | Text | `1`                                          |

> If no image is attached, the frontend should fall back to displaying
> the parent product's `imageUrl` for this variant.

#### JSON body (no image)

```json
{
  "sku": "IP15P-512-BLU",
  "storage": "512GB",
  "color": "Blue",
  "newPrice": 189800,
  "usedPrice": 139800,
  "currency": "BDT",
  "maxQuantityPerOrder": 1,
  "deductions": [
    {
      "condition": "USED",
      "amount": 8000,
      "sortOrder": 1,
      "label": "Scratches on body"
    }
  ]
}
```

---

### 8. List Variants (Public)

**GET** `/api/v1/products/variants?page=1&limit=20&productId=<id>&categoryId=<id>&storage=128GB&isActive=true`

| Param        | Type                 | Description                    |
| ------------ | -------------------- | ------------------------------ |
| `page`       | number               | Default: 1                     |
| `limit`      | number               | Default: 20                    |
| `search`     | string               | Searches SKU + storage + color |
| `productId`  | string               | Filter by a single product     |
| `categoryId` | string               | **NEW** — filter by category   |
| `storage`    | string               | Filter by storage              |
| `isActive`   | `"true"` / `"false"` |                                |

> **`categoryId` is the key addition for storefront/homepage use.**
> Previously you could only list variants for one known `productId` at
> a time. Now you can pull _every_ variant across _every_ product in a
> category in one call — e.g. `?categoryId=<iPhone-sub-category-id>`
> returns variant cards for "iPhone 17 Pro Max 256GB Orange", "iPhone 17
> Pro 128GB Black", etc. all together, which is what the homepage
> product grid needs.
>
> Each variant in the response now includes:
>
> ```json
> {
>   "id": "...",
>   "sku": "...",
>   "storage": "256GB",
>   "color": "Orange",
>   "imageUrl": "...",       // variant's own photo, may be null
>   "newPrice": "191000",
>   "usedPrice": "160000",
>   "currency": "BDT",
>   "deductions": [...],
>   "product": {
>     "id": "...",
>     "slug": "iphone-17-pro-max",
>     "name": "iPhone 17 Pro Max",
>     "imageUrl": "...",     // fallback image if variant.imageUrl is null
>     "updateDate": "2026-07-14T00:00:00.000Z",
>     "category": {
>       "id": "...",
>       "slug": "iphone",
>       "name": "iPhone",
>       "parent": { "id": "...", "slug": "smartphone", "name": "Smartphone" }
>     }
>   }
> }
> ```

---

### 9. Get Variant by ID (Public)

**GET** `/api/v1/products/variants/:id`

Same enriched `product` + `category` shape as #8.

---

### 10. Update Variant (Admin)

**PATCH** `/api/v1/products/variants/:id`

**Permission:** `variant.manage`

**Content-Type:** `multipart/form-data` if replacing the image, otherwise
`application/json`.

```json
{
  "newPrice": 144800,
  "usedPrice": 94800,
  "isActive": true
}
```

> If you attach a new `image` file, the old variant image is
> automatically deleted from Cloudinary before the new one is saved.

---

### 11. Delete Variant (Admin) — Soft Delete

**DELETE** `/api/v1/products/variants/:id`

**Permission:** `variant.manage`

> Now also deletes the variant's own Cloudinary image (if it had one),
> in addition to the soft-delete flag.

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
  "label": "Cracked screen"
}
```

> ⚠️ `translations` removed — send `label` directly as a plain string.

---

### 13. Update Deduction (Admin)

**PATCH** `/api/v1/products/deductions/:deductionId`

**Permission:** `deduction.manage`

```json
{
  "amount": 20000,
  "label": "Cracked screen (updated)"
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

### currency

Plain string, max 10 chars. **Default: `BDT`** (not JPY — corrected from
the previous version of this doc, which didn't match the schema).

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
7. **File uploads:** For any request with an `image` field, switch Postman's Body tab to
   **form-data** (not raw JSON) — otherwise multer won't parse the file and
   `req.file` will be `undefined`.
8. **Testing the new `categoryId` variant filter:** create a Main category
   ("Smartphone") + Sub category ("iPhone") first, create 2-3 products
   under the sub-category, add variants to each, then call
   `GET /products/variants?categoryId=<iPhone-sub-category-id>` — you
   should see variants from _all_ those products in one response.
9. **Deleting a product with variants:** confirm the cascade — after
   `DELETE /products/:id`, check `GET /products/variants?productId=<id>`
   returns an empty list (all variants should now be soft-deleted too).
