# OGzz MC Store Security Rules Specification

This document details the security constraints, data invariants, and access control policies for our Firestore collections, based on a Zero-Trust architecture.

## 1. Data Invariants & Access Gates

* **Users (`/users/{userId}`)**: Users can create their profile only under their own authenticated UID during register. Email and Minecraft Username cannot be empty.
* **Admins (`/admins/{adminId}`)**: Privileged role mapping. Non-admins cannot designate themselves or modify this collection.
* **Ranks (`/ranks/{rankId}`)** & **Coins (`/coins/{coinId}`)**: Read access is fully public so anyone can view products. Write access requires authenticated `isAdmin()` status.
* **Orders (`/orders/{orderId}`)**: 
  * Customers can read only their own orders. Admin gets complete global visibility.
  * Customers can create orders labeled as `Pending`. They cannot self-approve or transition orders to `Confirmed`.
  * Admin can transition order status to `Confirmed` or `Rejected` (providing a required `rejectionReason` if `Rejected`).
  * Field immutability: `orderId`, `uid`, `email`, `minecraftUsername`, `productType`, `productName`, and `price` are strictly immutable once the order is submitted.

---

## 2. The Dirty Dozen Payloads (Red Team Tests)

These payloads represent malicious actions that must return `PERMISSION_DENIED` under our security gates:

1. **Self-Approve Order**: User `usr-888` posts an order with `"status": "Confirmed"`.
2. **Impersonate User Creation**: User `usr-888` attempts to create profile `/users/usr-999`.
3. **Hijack Order**: User `usr-888` queries or reads `/orders/ord-999` belonging to `usr-999`.
4. **Self-Promotion to Admin**: User `usr-888` attempts to write `/admins/usr-888` with `"role": "Admin"`.
5. **No-Price Rank/Coin Modification**: User attempts to update high-level products `/ranks/vip` to set price to `0`.
6. **Bypassing Discord Verification**: User posts order without checking `"Pending"` status.
7. **Junk ID Poisoning**: User creates an order with document ID `OGZZ-!!#$@%$^&*(^^%%$$$#_OVER_10K_CHARS...` to exhaust Firestore resources.
8. **Negative Cost Purchase Order**: User submits an order where `"price": -99.99`.
9. **Minecraft Username Spoofing**: User updates existing approved order's `minecraftUsername` to someone else's.
10. **Shadow Key Injection**: User appends a ghost field `"isVip": true` or `"overrideServerCheck": true` to user/orders document.
11. **Anomalous Type Forgery**: Submitting an order where `"price"` is a boolean `true` or string `"Free"`.
12. **Status Flipping After Completion**: Overwriting a `"Confirmed"` or `"Rejected"` order back to `"Pending"` or altering the rejected reason.

---

## 3. Recommended Security Guards

Our `firestore.rules` enforces:
1. `isAdmin()` via administrative uid exists-check.
2. Formatted ID validation: `isValidId(orderId)` checks characters and size.
3. Strictly structured helper gates for creating and updating states.
