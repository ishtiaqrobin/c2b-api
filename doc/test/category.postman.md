# Category Module

All category routes are under `/api/v1/categories`.

> **Auth note:** Admin routes require `category.manage` permission + valid session cookie.

---

## 8. Get Category Tree (Public)

**GET** `/api/v1/categories/tree`

Returns the full nested category hierarchy (only active, non-deleted categories).

---

## 9. List Categories (Public)

**GET** `/api/v1/categories?page=1&limit=20&search=electronics&isPopular=true&locale=EN`

**Query params (all optional):**

| Param       | Type                 | Description                          |
| ----------- | -------------------- | ------------------------------------ |
| `page`      | number               | Default: 1                           |
| `limit`     | number               | Default: 20, max: 100                |
| `search`    | string               | Searches slug + translation names    |
| `parentId`  | string               | Filter by parent (`"null"` for root) |
| `isPopular` | `"true"` / `"false"` |                                      |
| `isActive`  | `"true"` / `"false"` |                                      |
| `locale`    | `"EN"` / `"BN"`      | Filter translations                  |

---

## 10. Get Category by Slug (Public)

**GET** `/api/v1/categories/slug/electronics`

---

## 11. Get Category by ID (Public)

**GET** `/api/v1/categories/:id`

---

## 12. Create Category (Admin)

**POST** `/api/v1/categories`

**Headers:** Cookie `better-auth.session_token=<token>`

```json
{
  "slug": "electronics",
  "isPopular": true,
  "sortOrder": 1,
  "isActive": true,
  "translations": [
    { "locale": "EN", "name": "Electronics" },
    { "locale": "BN", "name": "ইলেকট্রনিক্স" }
  ]
}
```

### With parent

```json
{
  "slug": "smartphones",
  "parentId": "<parent-category-id>",
  "translations": [
    { "locale": "EN", "name": "Smartphones" },
    { "locale": "BN", "name": "স্মার্টফোন" }
  ]
}
```

---

## 13. Update Category (Admin)

**PATCH** `/api/v1/categories/:id`

```json
{
  "slug": "electronics-updated",
  "isPopular": false,
  "sortOrder": 2,
  "translations": [
    { "locale": "EN", "name": "Electronics & Gadgets" },
    { "locale": "BN", "name": "ইলেকট্রনিক্স ও গ্যাজেটস" }
  ]
}
```

> All fields optional. Translations are **replaced** entirely when provided.

---

## 14. Delete Category (Admin) — Soft Delete

**DELETE** `/api/v1/categories/:id`

---

## 15. Create Category Notice (Admin)

**POST** `/api/v1/categories/notices`

```json
{
  "categoryId": "<category-id>",
  "translations": [
    { "locale": "EN", "body": "Please read before purchasing electronics." },
    { "locale": "BN", "body": "ইলেকট্রনিক্স কেনার আগে অনুগ্রহ করে পড়ুন।" }
  ]
}
```

---

## 16. Get Category Notice (Public)

**GET** `/api/v1/categories/:categoryId/notice`

---

## 17. Update Category Notice (Admin)

**PATCH** `/api/v1/categories/:categoryId/notice`

```json
{
  "translations": [
    { "locale": "EN", "body": "Updated notice text." },
    { "locale": "BN", "body": "আপডেট করা নোটিশ।" }
  ]
}
```

---

## 18. Delete Category Notice (Admin)

**DELETE** `/api/v1/categories/:categoryId/notice`
