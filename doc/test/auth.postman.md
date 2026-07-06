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
    "occupation": "Software Engineer",
    "postCode": "1207",
    "prefectureId": 1,
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
    "prefectureId": 1,
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
    "postCode": "1000",
    "prefectureId": 1,
    "cityTownVillage": "Chiyoda",
    "streetAddress": "1-2-3 Marunouchi",
    "apartment": "Tower A, 10F"
  },
  "contact": {
    "contactName": "Taro Yamada",
    "contactTelephone": "09012345678",
    "contactDateOfBirth": "1988-03-20",
    "contactSex": "MALE",
    "contactOccupation": "Director",
    "contactPostCode": "1000",
    "contactPrefectureId": 1,
    "contactCityTownVillage": "Chiyoda",
    "contactStreetAddress": "1-2-3 Marunouchi",
    "contactApartment": "Tower A, 10F",
    "bankAccount": "普通",
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
    "postCode": "1000",
    "prefectureId": 1,
    "cityTownVillage": "Chiyoda",
    "streetAddress": "1-2-3 Marunouchi"
  },
  "contact": {
    "contactName": "Taro Yamada",
    "contactTelephone": "09012345678",
    "contactDateOfBirth": "1988-03-20",
    "contactSex": "MALE",
    "contactPostCode": "1000",
    "contactPrefectureId": 1,
    "contactCityTownVillage": "Chiyoda",
    "contactStreetAddress": "1-2-3 Marunouchi",
    "bankAccount": "普通",
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

## 4. Login — Google OAuth

**GET** `/api/v1/auth/login/google`

> Opens the Google OAuth consent screen in the browser. After consent, better-auth redirects to `/api/v1/auth/google/success` and sets the session cookie.

---

## 5. Get Current User (Me)

**GET** `/api/v1/auth/me`

**Headers:** Cookie `better-auth.session_token=<token>` (set automatically by browser after login)

---

## 6. Get Current User (User module)

**GET** `/api/v1/users/me`

**Headers:** Cookie `better-auth.session_token=<token>`

---

## 7. Logout

**POST** `/api/v1/auth/logout`

**Headers:** Cookie `better-auth.session_token=<token>`

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

### prefectureId

Integer ID referencing a `Prefecture` record. Run `npm run seed:district` first to seed Bangladesh districts. Use `1` for Dhaka (BD-DHA) as a default test value.

---

## Postman Tips

1. **Cookie handling:** After sign-in, Postman automatically stores and sends cookies. No manual header needed for authenticated routes.
2. **Environment variables:** Set `baseUrl = http://localhost:5000` as a collection variable.
3. **Prefecture seeding:** Run `npm run seed:district` before testing registration so `prefectureId` values exist.
4. **Email verification:** After registration, check the console log for the OTP (dev mode) or use the verification email link.
