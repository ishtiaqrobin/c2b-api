# C2B Backend — Admin Postman Test Guide

**Base URL:** `http://localhost:5000`

All admin routes are under `/api/v1/admins` and require:

- **Session cookie** (`better-auth.session_token`) — log in first via `/api/auth/sign-in/email`
- **Proper RBAC permission** — each endpoint lists the required permission

> **First-time setup:** Run `npm run seed:rbac` to create the `super_admin` role and owner account. Log in with the owner credentials to get a session with full permissions.

---

## Auth Flow (Prerequisite)

### Step 1: Login as Owner

**POST** `http://localhost:5000/api/auth/sign-in/email`

```json
{
  "email": "owner@gmail.com",
  "password": "owner1234"
}
```

> On success, Postman stores the `better-auth.session_token` cookie automatically. All subsequent admin requests will use it.

### Step 2: Verify Session

**GET** `http://localhost:5000/api/v1/auth/me`

Should return the owner's user object with `userType: "STAFF"`.

---

## 1. Promote User to Staff

**POST** `/api/v1/admins/staff`

**Permission:** `staff.manage`

```json
{
  "userId": "<target-user-id>",
  "displayName": "John Staff"
}
```

### Promote with role assignment (global)

```json
{
  "userId": "<target-user-id>",
  "displayName": "John Manager",
  "roleId": "<role-id>"
}
```

### Promote with role assignment (store-scoped)

```json
{
  "userId": "<target-user-id>",
  "displayName": "John Store Manager",
  "roleId": "<role-id>",
  "storeId": "<store-id>"
}
```

> **Note:** Omit `roleId` if you want to promote without assigning a role. Omit `storeId` (or set `null`) for global role scope.

---

## 2. Assign Role to User

**POST** `/api/v1/admins/users/:userId/roles`

**Permission:** `role.manage`

### Global role (no store scope)

```json
{
  "roleId": "<role-id>"
}
```

### Store-scoped role

```json
{
  "roleId": "<role-id>",
  "storeId": "<store-id>"
}
```

---

## 3. Revoke Role from User

**DELETE** `/api/v1/admins/roles/:userRoleId`

**Permission:** `role.manage`

> `:userRoleId` is the `id` of the `UserRole` record (not the `roleId`). Get it from the assign role response or by querying the DB.

---

## 4. List Users

**GET** `/api/v1/admins/users?page=1&limit=20&search=john&userType=CUSTOMER&isDeleted=false`

**Permission:** `user.view`

**Query params (all optional):**

| Param       | Type                     | Default | Description               |
| ----------- | ------------------------ | ------- | ------------------------- |
| `page`      | number                   | 1       | Page number               |
| `limit`     | number                   | 20      | Items per page (max 100)  |
| `search`    | string                   | —       | Searches `email` + `name` |
| `userType`  | `"CUSTOMER"` / `"STAFF"` | —       | Filter by user type       |
| `isDeleted` | `"true"` / `"false"`     | —       | Filter deleted users      |

---

## 5. Soft Delete User

**PATCH** `/api/v1/admins/users/:userId/soft-delete`

**Permission:** `user.manage`

> Cannot delete yourself. Also revokes all active sessions (force logout).

---

## 6. Restore User

**PATCH** `/api/v1/admins/users/:userId/restore`

**Permission:** `user.manage`

> Restores a soft-deleted user account.

---

## 7. Review eKYC

**PATCH** `/api/v1/admins/users/:userId/ekyc`

**Permission:** `ekyc.review`

### Approve

```json
{
  "status": "VERIFIED"
}
```

### Reject

```json
{
  "status": "REJECTED",
  "rejectReason": "Document image is blurry. Please resubmit."
}
```

> `rejectReason` is **required** when status is `REJECTED`.

---

## 8. Get Audit Logs

**GET** `/api/v1/admins/audit-logs?page=1&limit=20`

**Permission:** `audit.view`

**Query params (all optional):**

| Param   | Type   | Default |
| ------- | ------ | ------- |
| `page`  | number | 1       |
| `limit` | number | 20      |

---

## Permission Reference

| Permission Key | Description                 | Used In                                                                  |
| -------------- | --------------------------- | ------------------------------------------------------------------------ |
| `staff.manage` | Promote customers to staff  | `POST /admins/staff`                                                     |
| `role.manage`  | Assign/revoke roles         | `POST /admins/users/:id/roles`, `DELETE /admins/roles/:id`               |
| `user.view`    | List users                  | `GET /admins/users`                                                      |
| `user.manage`  | Soft delete / restore users | `PATCH /admins/users/:id/soft-delete`, `PATCH /admins/users/:id/restore` |
| `ekyc.review`  | Review eKYC submissions     | `PATCH /admins/users/:id/ekyc`                                           |
| `audit.view`   | View audit logs             | `GET /admins/audit-logs`                                                 |

---

## Postman Tips

1. **Cookie handling:** After login, Postman auto-sends cookies. No manual header needed.
2. **Environment variables:** Set `baseUrl = http://localhost:5000` as a collection variable.
3. **RBAC seeding:** Run `npm run seed:rbac` before testing to create the owner account and roles.
4. **Getting IDs:** Most admin operations need a `userId`. Register a user first via `POST /api/v1/users/register`, then use the returned `id`.
5. **Role ID:** To get a `roleId`, check the DB after seeding or look at the seed output. The `super_admin` role is created by `npm run seed:rbac`.
6. **eKYC testing:** A user must first submit an eKYC (via the eKYC module) before you can review it.
