# C2B Backend — Store Postman Test Guide

**Base URL:** `http://localhost:5000`

All store routes are under `/api/v1/stores`.

> **Auth note:** Admin routes require `store.manage` permission + valid session cookie.

---

## Auth Flow (Prerequisite)

### Step 1: Login as Owner / Staff

**POST** `http://localhost:5000/api/auth/sign-in/email`

```json
{
  "email": "owner@gmail.com",
  "password": "owner1234"
}
```

---

## 1. Create Store (Admin)

**POST** `/api/v1/stores`

**Permission:** `store.manage`

### Minimal

```json
{
  "slug": "dhaka-flagship",
  "translations": [
    { "locale": "EN", "name": "Dhaka Flagship Store" },
    { "locale": "BN", "name": "ঢাকা ফ্ল্যাগশিপ স্টোর" }
  ]
}
```

### With business hours

```json
{
  "slug": "dhaka-flagship",
  "isActive": true,
  "translations": [
    {
      "locale": "EN",
      "name": "Dhaka Flagship Store",
      "address": "12/A Gulshan Avenue, Dhaka 1212"
    },
    {
      "locale": "BN",
      "name": "ঢাকা ফ্ল্যাগশিপ স্টোর",
      "address": "১২/এ গুলশান এভিনিউ, ঢাকা ১২১২"
    }
  ],
  "businessHours": [
    { "dayOfWeek": 0, "isClosed": true },
    {
      "dayOfWeek": 1,
      "openTime": "10:00",
      "closeTime": "20:00",
      "isClosed": false
    },
    {
      "dayOfWeek": 2,
      "openTime": "10:00",
      "closeTime": "20:00",
      "isClosed": false
    },
    {
      "dayOfWeek": 3,
      "openTime": "10:00",
      "closeTime": "20:00",
      "isClosed": false
    },
    {
      "dayOfWeek": 4,
      "openTime": "10:00",
      "closeTime": "20:00",
      "isClosed": false
    },
    {
      "dayOfWeek": 5,
      "openTime": "10:00",
      "closeTime": "20:00",
      "isClosed": false
    },
    {
      "dayOfWeek": 6,
      "openTime": "11:00",
      "closeTime": "18:00",
      "isClosed": false
    }
  ]
}
```

> **dayOfWeek:** 0 = Sunday, 1 = Monday, ..., 6 = Saturday

---

## 2. List Stores (Public)

**GET** `/api/v1/stores?page=1&limit=20&search=dhaka&isActive=true&locale=EN`

**Query params (all optional):**

| Param      | Type                 | Default | Description                       |
| ---------- | -------------------- | ------- | --------------------------------- |
| `page`     | number               | 1       | Page number                       |
| `limit`    | number               | 20      | Items per page (max 100)          |
| `search`   | string               | —       | Searches slug + translation names |
| `isActive` | `"true"` / `"false"` | —       | Filter by active status           |
| `locale`   | `"EN"` / `"BN"`      | —       | Filter translations               |

---

## 3. Get Store by Slug (Public)

**GET** `/api/v1/stores/slug/dhaka-flagship`

---

## 4. Get Store by ID (Public)

**GET** `/api/v1/stores/:id`

---

## 5. Update Store (Admin)

**PATCH** `/api/v1/stores/:id`

**Permission:** `store.manage`

### Update name / address

```json
{
  "translations": [
    {
      "locale": "EN",
      "name": "Dhaka Flagship Store — Updated",
      "address": "45/B Banani, Dhaka 1213"
    },
    {
      "locale": "BN",
      "name": "ঢাকা ফ্ল্যাগশিপ স্টোর — আপডেটেড",
      "address": "৪৫/বি বনানী, ঢাকা ১২১৩"
    }
  ]
}
```

### Update business hours (replaces all)

```json
{
  "businessHours": [
    { "dayOfWeek": 0, "isClosed": true },
    {
      "dayOfWeek": 1,
      "openTime": "09:00",
      "closeTime": "21:00",
      "isClosed": false
    },
    {
      "dayOfWeek": 2,
      "openTime": "09:00",
      "closeTime": "21:00",
      "isClosed": false
    },
    {
      "dayOfWeek": 3,
      "openTime": "09:00",
      "closeTime": "21:00",
      "isClosed": false
    },
    {
      "dayOfWeek": 4,
      "openTime": "09:00",
      "closeTime": "21:00",
      "isClosed": false
    },
    {
      "dayOfWeek": 5,
      "openTime": "09:00",
      "closeTime": "21:00",
      "isClosed": false
    },
    { "dayOfWeek": 6, "isClosed": true }
  ]
}
```

### Deactivate store

```json
{
  "isActive": false
}
```

> All fields optional. Translations and business hours are **replaced** entirely when provided.

---

## 6. Delete Store (Admin) — Soft Delete

**DELETE** `/api/v1/stores/:id`

**Permission:** `store.manage`

---

## Field Reference

### dayOfWeek

| Value | Day       |
| ----- | --------- |
| 0     | Sunday    |
| 1     | Monday    |
| 2     | Tuesday   |
| 3     | Wednesday |
| 4     | Thursday  |
| 5     | Friday    |
| 6     | Saturday  |

### openTime / closeTime

24-hour format string, e.g. `"09:00"`, `"21:30"`.

### locale

| Value | Language |
| ----- | -------- |
| `EN`  | English  |
| `BN`  | Bengali  |

---

## Postman Tips

1. **Cookie handling:** After login, Postman auto-sends cookies.
2. **RBAC seeding:** Run `npm run seed:rbac` before testing admin endpoints.
3. **Slug uniqueness:** Store slugs must be unique. If you get a `409 CONFLICT`, change the slug.
4. **Business hours:** When updating, provide the full week (all 7 days). Missing days will be deleted.
