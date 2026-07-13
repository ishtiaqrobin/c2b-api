# Category Module

All category routes are under `/api/v1/categories`.

> **Auth note:** Admin routes require `category.manage` permission + valid session cookie.

---

## 8. Get Category Tree (Public)

**GET** `/api/v1/categories/tree`

Returns the full nested category hierarchy (only active, non-deleted categories).

---

## 9. List Categories (Public)

**GET** `/api/v1/categories?page=1&limit=20&search=electronics&isPopular=true`

**Query params (all optional):**

| Param       | Type                 | Description                          |
| ----------- | -------------------- | ------------------------------------ |
| `page`      | number               | Default: 1                           |
| `limit`     | number               | Default: 20, max: 100                |
| `search`    | string               | Searches slug + name                 |
| `parentId`  | string               | Filter by parent (`"null"` for root) |
| `isPopular` | `"true"` / `"false"` |                                      |
| `isActive`  | `"true"` / `"false"` |                                      |

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

**Content-Type:** `multipart/form-data`

| Field       | Type                | Required | Description                               |
| ----------- | ------------------- | -------- | ----------------------------------------- |
| `slug`      | string              | Yes      | Unique slug                               |
| `name`      | string              | Yes      | Display name                              |
| `image`     | file                | No       | Category image (uploaded to Cloudinary)   |
| `parentId`  | string              | No       | Parent category ID (null for root)        |
| `isPopular` | `"true"` / `"false"` | No      | Default: `false`                          |
| `sortOrder` | number              | No       | Default: `0`                              |
| `isActive`  | `"true"` / `"false"` | No      | Default: `true`                           |

---

## 13. Update Category (Admin)

**PATCH** `/api/v1/categories/:id`

**Content-Type:** `multipart/form-data`

| Field       | Type                | Required | Description                                    |
| ----------- | ------------------- | -------- | ---------------------------------------------- |
| `slug`      | string              | No       | Unique slug                                    |
| `name`      | string              | No       | Display name                                   |
| `image`     | file                | No       | New category image (leave empty to keep current)|
| `parentId`  | string              | No       | Parent category ID (null for root)             |
| `isPopular` | `"true"` / `"false"` | No      |                                                |
| `sortOrder` | number              | No       |                                                |
| `isActive`  | `"true"` / `"false"` | No      |                                                |

> All fields optional. Omit `image` to keep the current image.

---

## 14. Delete Category (Admin) — Soft Delete

**DELETE** `/api/v1/categories/:id`

Also deletes the associated Cloudinary image if present.

---

## 15. Create Category Notice (Admin)

**POST** `/api/v1/categories/notices`

```json
{
  "categoryId": "<category-id>",
  "body": "Please read before purchasing electronics."
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
  "body": "Updated notice text."
}
```

---

## 18. Delete Category Notice (Admin)

**DELETE** `/api/v1/categories/:categoryId/notice`
