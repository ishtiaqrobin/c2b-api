# C2B Backend — Postman Test Guide

**Base URL:** `http://localhost:5000`

All API routes are prefixed with `/api/v1`.

---

## 1. Register — Individual Account

**POST** `/api/v1/users/register`

```json
{
  "accountType": "INDIVIDUAL",
  "email": "john@example.com",
  "password": "password123",
  "name": "John Doe",
  "qualifiedInvoiceStatus": "NOT_APPLICABLE",
  "profile": {
    "fullName": "John Doe",
    "telephone": "01712345678",
    "dateOfBirth": "1995-06-15",
    "sex": "MALE",
    "occupation": "OTHERS",
    "postCode": "1207",
    "districtId": 1,
    "cityTownVillage": "Dhaka Kotwali",
    "streetAddress": "12/A Dhanmondi R/A",
    "apartment": "Flat 4B"
  }
}
```

### Minimal (required fields only)

```json
{
  "accountType": "INDIVIDUAL",
  "email": "john@example.com",
  "password": "password123",
  "name": "John Doe",
  "profile": {
    "fullName": "John Doe",
    "telephone": "01712345678",
    "dateOfBirth": "1995-06-15",
    "sex": "MALE",
    "postCode": "1207",
    "districtId": 1,
    "cityTownVillage": "Dhaka Kotwali",
    "streetAddress": "12/A Dhanmondi R/A"
  }
}
```

---

## 2. Register — Corporation Account

**POST** `/api/v1/users/register`

```json
{
  "accountType": "CORPORATION",
  "email": "contact@acme-corp.com",
  "password": "password123",
  "name": "Acme Corporation",
  "qualifiedInvoiceStatus": "TARGET_AUDIENCE",
  "company": {
    "companyName": "Acme Corporation Ltd.",
    "companyTelephone": "0212345678",
    "companyPostCode": "1000",
    "companyDistrictId": 1,
    "companyCityTownVillage": "Chiyoda",
    "companyStreetAddress": "1-2-3 Marunouchi",
    "companyApartment": "Tower A, 10F"
  },
  "contact": {
    "contactName": "Taro Yamada",
    "contactTelephone": "09012345678",
    "contactDateOfBirth": "1988-03-20",
    "contactSex": "MALE",
    "contactOccupation": "OTHERS",
    "contactPostCode": "1000",
    "contactDistrictId": 1,
    "contactCityTownVillage": "Chiyoda",
    "contactStreetAddress": "1-2-3 Marunouchi",
    "contactApartment": "Tower A, 10F",
    "bankAccount": "Dutch Bangla Bank",
    "bankAccountBranch": "Shinjuku Branch",
    "bankAccountType": "CURRENT",
    "bankAccountNumber": "1234567",
    "bankAccountName": "Acme Corporation Ltd."
  }
}
```

### Minimal (required fields only)

```json
{
  "accountType": "CORPORATION",
  "email": "contact@acme-corp.com",
  "password": "password123",
  "name": "Acme Corporation",
  "company": {
    "companyName": "Acme Corporation Ltd.",
    "companyTelephone": "0212345678",
    "companyPostCode": "1000",
    "companyDistrictId": 1,
    "companyCityTownVillage": "Chiyoda",
    "companyStreetAddress": "1-2-3 Marunouchi"
  },
  "contact": {
    "contactName": "Taro Yamada",
    "contactTelephone": "09012345678",
    "contactDateOfBirth": "1988-03-20",
    "contactSex": "MALE",
    "contactPostCode": "1000",
    "contactDistrictId": 1,
    "contactCityTownVillage": "Chiyoda",
    "contactStreetAddress": "1-2-3 Marunouchi",
    "bankAccount": "Dutch Bangla Bank",
    "bankAccountBranch": "Shinjuku Branch",
    "bankAccountType": "CURRENT",
    "bankAccountNumber": "1234567",
    "bankAccountName": "Acme Corporation Ltd."
  }
}
```

---

## 3. Login — Email & Password (better-auth session)

**POST** `/api/auth/sign-in/email`

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

> **Note:** This is a better-auth endpoint. On success it sets a `better-auth.session_token` cookie. Send subsequent authenticated requests with that cookie.

---

## 4. Change Password

**POST** `/api/v1/auth/change-password`

**Headers:** Cookie `better-auth.session_token=<token>`

```json
{
  "currentPassword": "password123",
  "newPassword": "newSecurePass456",
  "revokeOtherSessions": true
}
```

> Sets `needPasswordChange` to `false` on success.

---

## 5. Email Verification (OTP)

**POST** `/api/v1/auth/verify-email`

```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

> The OTP is sent via email after registration. In dev mode, check the server console logs for the OTP. Sets `emailVerified` to `true` on success.

---

## 6. Forget Password (Request OTP)

**POST** `/api/v1/auth/forget-password`

```json
{
  "email": "john@example.com"
}
```

> Sends a password-reset OTP to the user's email. The user must have a verified email.

---

## 7. Reset Password (Verify OTP + New Password)

**POST** `/api/v1/auth/reset-password`

```json
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "newSecurePass789"
}
```

> On success, clears all existing sessions (forces re-login).

---

## 8. Get Current User (Me — Auth Module)

**GET** `/api/v1/auth/me`

**Headers:** Cookie `better-auth.session_token=<token>`

Returns the authenticated user's profile from the auth module.

---

## 9. Get Current User (Me — User Module)

**GET** `/api/v1/users/me`

**Headers:** Cookie `better-auth.session_token=<token>`

Returns the authenticated user's profile from the user module (with profile details).

---

## 10. Logout

**POST** `/api/v1/auth/logout`

**Headers:** Cookie `better-auth.session_token=<token>`

Revokes the better-auth session server-side and clears the session cookie.

---

## Field Reference

### accountType

| Value         | Description                |
| ------------- | -------------------------- |
| `INDIVIDUAL`  | Personal / retail customer |
| `CORPORATION` | Business customer          |

### sex

| Value    |
| -------- |
| `MALE`   |
| `FEMALE` |
| `OTHER`  |

### qualifiedInvoiceStatus

| Value             | Description                           |
| ----------------- | ------------------------------------- |
| `NOT_APPLICABLE`  | Default — no qualified invoice needed |
| `TARGET_AUDIENCE` | Wants qualified invoice (適格請求書)  |

### dateOfBirth

ISO 8601 date string, e.g. `"1995-06-15"`.

### districtId

Integer ID referencing a `District` record. Run `npm run seed:district` first to seed Bangladesh divisions & districts. Use `1` for Dhaka (BD-DHA) as a default test value.

---

## Postman Tips

1. **Cookie handling:** After sign-in, Postman automatically stores and sends cookies. No manual header needed for authenticated routes.
2. **Environment variables:** Set `baseUrl = http://localhost:5000` as a collection variable.
3. **Seeding:** Run `npm run seed:district` before testing registration so `districtId` values exist.
4. **Email verification:** After registration, check the console log for the OTP (dev mode) or use the verification email link.
