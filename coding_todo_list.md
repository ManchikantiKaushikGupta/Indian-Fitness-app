# 🏋️ GymFlow — Coding To-Do List
> **App**: Gym Management & Payment Reminder App  
> **Stack**: Flutter (frontend) · NestJS (backend) · PostgreSQL (Supabase) · Render (hosting)  
> **Goal**: MVP — member management, payment tracking, dashboard, WhatsApp reminders

---

## Phase 1 — Project Scaffolding

### Backend (NestJS)
- [ ] Initialize NestJS project (`nest new gymflow-backend`)
- [ ] Configure TypeScript (`tsconfig.json`)
- [ ] Set up environment variables (`.env`) — DB URL, JWT secret, port
- [ ] Install core packages:
  - [ ] `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`
  - [ ] `class-validator`, `class-transformer`
  - [ ] `prisma` or `typeorm` (choose ORM)
  - [ ] `node-cron`
  - [ ] `bcrypt`
- [ ] Connect to PostgreSQL (Supabase)
- [ ] Set up Prisma/TypeORM and run initial migration

### Frontend (Flutter)
- [ ] Initialize Flutter project (`flutter create gymflow`)
- [ ] Add dependencies to `pubspec.yaml`:
  - [ ] `dio` (HTTP client)
  - [ ] `provider` or `riverpod` (state management)
  - [ ] `fl_chart` (dashboard charts)
  - [ ] `shared_preferences` (token storage)
  - [ ] `url_launcher` (WhatsApp deep links)
- [ ] Configure app theme (colors, fonts)
- [ ] Set up folder structure: `screens/`, `services/`, `models/`, `providers/`, `widgets/`

---

## Phase 2 — Database Schema (PostgreSQL)

- [x] Create `gym_owner` table: `id`, `name`, `email`, `password_hash`, `created_at`
- [x] Create `members` table: `id`, `name`, `phone`, `join_date`, `gym_id (FK)`
- [x] Create `memberships` table: `id`, `member_id (FK)`, `plan_type`, `start_date`, `end_date`, `status`
- [x] Create `payments` table: `id`, `member_id (FK)`, `amount`, `due_date`, `paid_date`, `status (PAID/UNPAID)`
- [x] Add indexes on `due_date` and `member_id` for performance
- [x] Write and run migrations

---

## Phase 3 — Backend: Auth Module

- [x] Create `AuthModule`, `AuthService`, `AuthController`
- [x] `POST /auth/login` — validate gym owner credentials, return JWT
- [x] Implement JWT strategy (`JwtStrategy`)
- [x] Implement `JwtAuthGuard` for protecting routes
- [x] Hash passwords on register using `bcrypt`
- [x] Validate inputs via DTOs (`LoginDto`)

---

## Phase 4 — Backend: Member Module

- [x] Create `MemberModule`, `MemberService`, `MemberController`
- [x] `POST /members` — add a new member
- [x] `GET /members` — list all members (with pagination)
- [x] `GET /members/:id` — get member by ID
- [x] `PUT /members/:id` — update member details
- [x] `DELETE /members/:id` — remove a member
- [x] Validate all inputs with DTOs (`CreateMemberDto`, `UpdateMemberDto`)
- [x] Protect all routes with `JwtAuthGuard`

---

## Phase 5 — Backend: Membership Module

- [x] Create `MembershipModule`, `MembershipService`, `MembershipController`
- [x] `POST /members/:id/membership` — assign/renew a plan
- [x] `GET /members/:id/membership` — get active membership for a member
- [x] Auto-update membership `status` (Active / Expired) based on `end_date`
- [x] Validate plan types (monthly, quarterly, yearly)

---

## Phase 6 — Backend: Payment Module

- [x] Create `PaymentModule`, `PaymentService`, `PaymentController`
- [x] `POST /payments` — record a new payment
- [x] `GET /payments/unpaid` — list all unpaid payments
- [x] `GET /payments/history/:memberId` — payment history for a member
- [x] Validate payment DTOs (`CreatePaymentDto`)
- [x] Enforce data consistency (ACID via PostgreSQL)

---

## Phase 7 — Backend: Dashboard Module

- [x] Create `DashboardModule`, `DashboardService`, `DashboardController`
- [x] `GET /dashboard/summary` — return:
  - [x] `total_members`
  - [x] `active_members`
  - [x] `pending_payments`
  - [x] `expiring_soon` (memberships expiring within 7 days)
- [x] Optimize query — avoid heavy joins, use indexed fields

---

## Phase 8 — Backend: Reminder Module (Cron Job)

- [x] Create `ReminderModule`, `ReminderService`
- [x] Set up `node-cron` to run daily at 9 AM
- [x] Cron logic:
  - [x] Fetch all payments where `due_date == today` → flag
  - [x] Fetch all payments where `due_date == today + 2 days` → flag
  - [x] Log all reminder targets
- [x] `POST /reminders/send/:memberId` — manual trigger API
- [x] Log reminder execution events (timestamp, member, status)
- [x] ⚠️ Handle failures: retry logic, log errors

---

## Phase 9 — Backend: Security & Config

- [x] Protect all API routes with `JwtAuthGuard`
- [x] Enable global validation pipe (`class-validator`)
- [x] Enable CORS (for Flutter app)
- [x] Set up global exception filter for clean error responses
- [x] Configure environment-based settings (dev vs. production)

---

## Phase 10 — Flutter: Auth Screen

- [x] Build **Login Screen** UI
- [x] Implement `AuthService` (calls `POST /auth/login`)
- [x] Store JWT token securely (`shared_preferences`)
- [x] Redirect to Dashboard on success
- [x] Show error messages on failure

---

## Phase 11 — Flutter: Dashboard Screen

- [x] Build **Dashboard Screen** UI
- [x] Fetch `GET /dashboard/summary` on load
- [x] Display cards:
  - [x] Total Members
  - [x] Active Memberships
  - [x] Expiring Soon
  - [x] Pending Payments
- [x] Add chart using `fl_chart` (e.g., payment status pie chart)

---

## Phase 12 — Flutter: Members Module

- [x] Build **Member List Screen** (paginated)
- [x] Build **Add Member Screen** (form with validation)
- [x] Build **Member Detail Screen** (membership + payment history)
- [x] Build **Edit Member Screen**
- [x] Implement `MemberService` (calls `/members` APIs)
- [x] Add delete confirmation dialog

---

## Phase 13 — Flutter: Membership & Payment Screens

- [x] Build **Assign Membership Screen** (plan type, dates)
- [x] Build **Record Payment Screen** (amount, due date, status)
- [x] Build **Unpaid Payments Screen** (list of all dues)
- [x] Build **Payment History Screen** per member
- [x] Implement `MembershipService` and `PaymentService`

---

## Phase 14 — Flutter: WhatsApp Reminder (Phase 1 MVP)

- [x] On **Member Detail Screen**, add "Send Reminder" button
- [x] Tap → open WhatsApp via deep link:
  ```
  https://wa.me/<phone>?text=Hi%20<name>%2C%20your%20payment%20of%20%E2%82%B9<amount>%20is%20due.
  ```
- [x] Use `url_launcher` package to open the link
- [x] Pre-fill message with member name, amount, due date

---

## Phase 15 — Testing

### Backend
- [x] Write unit tests for `PaymentService` (due logic)
- [x] Write unit tests for `ReminderService` (cron logic)
- [x] Write integration tests for all API endpoints using Jest
- [x] Test edge cases: expired memberships, unpaid users, empty data

### Frontend
- [x] Manual test all user flows:
  - [x] Login → Dashboard → Add Member → Assign Plan → Record Payment → Send Reminder
- [x] Test WhatsApp deep link on a real device
- [x] Test error states (network failure, invalid login)

---

## Phase 16 — Deployment
- [x] Deploy the PostgreSQL database (Supabase).
- [x] Host the NestJS backend via Render.
- [x] Build the final Flutter app APK/AAB

- [ ] Push backend to GitHub repo
- [ ] Deploy NestJS backend to **Render** (free tier)
- [ ] Set environment variables on Render (DB URL, JWT secret)
- [ ] Set up **Render cron job** for daily reminder execution (or use `node-cron` inside app)
- [ ] Connect to **Supabase** PostgreSQL in production
- [ ] Run production database migrations
- [ ] Test all API endpoints via Postman in production
- [ ] Build Flutter APK (`flutter build apk --release`) and test on device

---

> **MVP Definition of Done**: Auth ✅ · Member CRUD ✅ · Membership Tracking ✅ · Payment Tracking ✅ · Dashboard ✅ · Manual WhatsApp Reminders ✅ · Cron-based Daily Alerts ✅
