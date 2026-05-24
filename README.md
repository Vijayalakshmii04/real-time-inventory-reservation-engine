# Real-Time Inventory Reservation Engine

A concurrency-safe inventory reservation platform designed for multi-warehouse commerce systems.

This project solves the classic overselling problem in ecommerce checkout systems by introducing temporary inventory reservations with automatic expiry handling.

Built using Next.js App Router, Prisma ORM, PostgreSQL, and transactional reservation workflows.

---

# Problem Statement

In modern ecommerce systems, payment confirmation can take several minutes due to:

- UPI redirects
- 3DS authentication
- Wallet confirmations
- Banking delays

If stock is decremented only after payment success, multiple customers may purchase the same final inventory unit simultaneously.

This system prevents overselling by introducing time-bound inventory reservations.

---

# Core Features

- Multi-warehouse inventory management
- Concurrency-safe stock reservation
- Atomic transactional allocation logic
- Reservation confirmation workflow
- Early reservation release
- Automatic reservation expiry handling
- Live reservation countdown
- Dynamic stock updates
- Error handling for:
  - 409 Conflict
  - 410 Gone
  - expired reservations
  - insufficient inventory

---

# Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 App Router |
| Backend | Next.js Route Handlers |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Styling | Tailwind CSS |
| Validation | Zod |
| Notifications | React Hot Toast |
| Deployment | Vercel |

---

# Data Model

## CatalogItem
Represents products available for reservation.

## FulfillmentCenter
Represents warehouse or fulfillment locations.

## StockLedger
Tracks inventory per product per warehouse.

Fields:
- physicalUnits
- allocatedUnits

Available inventory is computed as:

available = physicalUnits - allocatedUnits

## ReservationRecord
Tracks temporary inventory reservations.

States:
- ACTIVE
- CONFIRMED
- RELEASED
- EXPIRED

---

# Reservation Workflow

## 1. Reserve Inventory

When a user reserves inventory:

- inventory availability is validated
- stock allocation occurs inside a database transaction
- allocatedUnits is incremented
- reservation record is created with expiry timestamp

If insufficient inventory exists:
- API returns HTTP 409

---

## 2. Confirm Reservation

When payment succeeds:

- reservation state changes to CONFIRMED
- allocated inventory becomes permanently consumed

If reservation expired:
- API returns HTTP 410

---

## 3. Release Reservation

If user cancels checkout:

- allocatedUnits is decremented
- reservation state becomes RELEASED

---

# Concurrency Handling

Concurrency correctness is implemented using database transactions.

Reservation creation occurs atomically using Prisma transactional workflows to ensure:

- only one request can reserve the final inventory unit
- simultaneous requests cannot oversell stock

This prevents race conditions during high checkout traffic.

---

# Expiry Strategy

This implementation uses lazy expiration cleanup.

When a reservation is fetched:

- system checks expiry timestamp
- expired ACTIVE reservations are automatically released
- inventory allocation is restored
- reservation state changes to EXPIRED

This avoids the operational complexity of dedicated background workers while remaining scalable for moderate traffic systems.

Potential production alternatives:
- Vercel Cron Jobs
- Redis-backed workers
- Queue-based cleanup systems

---

# API Endpoints

## Products

GET /api/products

Returns products with warehouse inventory availability.

---

## Warehouses

GET /api/warehouses

Returns all fulfillment centers.

---

## Create Reservation

POST /api/reservations

Creates temporary inventory reservation.

Returns:
- 201 on success
- 409 if insufficient stock

---

## Confirm Reservation

POST /api/reservations/:id/confirm

Confirms reservation after payment success.

Returns:
- 200 on success
- 410 if reservation expired

---

## Release Reservation

POST /api/reservations/:id/release

Cancels reservation and restores inventory.

---

# Running Locally

## 1. Clone Repository

```bash
git clone <repository-url>
