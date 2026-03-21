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

- [ ] Create `gym_owner` table: `id`, `name`, `email`, `password_hash`, `created_at`
- [ ] Create `members` table: `id`, `name`, `phone`, `join_date`, `gym_id (FK)`
- [ ] Create `memberships` table: `id`, `member_id (FK)`, `plan_type`, `start_date`, `end_date`, `status`
- [ ] Create `payments` table: `id`, `member_id (FK)`, `amount`, `due_date`, `paid_date`, `status (PAID/UNPAID)`
- [ ] Add indexes on `due_date` and `member_id` for performance
- [ ] Write and run migrations

---

## Phase 3 — Backend: Auth Module

- [ ] Create `AuthModule`, `AuthService`, `AuthController`
- [ ] `POST /auth/login` — validate gym owner credentials, return JWT
- [ ] Implement JWT strategy (`JwtStrategy`)
- [ ] Implement `JwtAuthGuard` for protecting routes
- [ ] Hash passwords on register using `bcrypt`
- [ ] Validate inputs via DTOs (`LoginDto`)

---

## Phase 4 — Backend: Member Module

- [ ] Create `MemberModule`, `MemberService`, `MemberController`
- [ ] `POST /members` — add a new member
- [ ] `GET /members` — list all members (with pagination)
- [ ] `GET /members/:id` — get member by ID
- [ ] `PUT /members/:id` — update member details
- [ ] `DELETE /members/:id` — remove a member
- [ ] Validate all inputs with DTOs (`CreateMemberDto`, `UpdateMemberDto`)
- [ ] Protect all routes with `JwtAuthGuard`

---

## Phase 5 — Backend: Membership Module

- [ ] Create `MembershipModule`, `MembershipService`, `MembershipController`
- [ ] `POST /members/:id/membership` — assign/renew a plan
- [ ] `GET /members/:id/membership` — get active membership for a member
- [ ] Auto-update membership `status` (Active / Expired) based on `end_date`
- [ ] Validate plan types (monthly, quarterly, yearly)

---

## Phase 6 — Backend: Payment Module

- [ ] Create `PaymentModule`, `PaymentService`, `PaymentController`
- [ ] `POST /payments` — record a new payment
- [ ] `GET /payments/unpaid` — list all unpaid payments
- [ ] `GET /payments/history/:memberId` — payment history for a member
- [ ] Validate payment DTOs (`CreatePaymentDto`)
- [ ] Enforce data consistency (ACID via PostgreSQL)

---

## Phase 7 — Backend: Dashboard Module

- [ ] Create `DashboardModule`, `DashboardService`, `DashboardController`
- [ ] `GET /dashboard/summary` — return:
  - [ ] `total_members`
  - [ ] `active_members`
  - [ ] `pending_payments`
  - [ ] `expiring_soon` (memberships expiring within 7 days)
- [ ] Optimize query — avoid heavy joins, use indexed fields

---

## Phase 8 — Backend: Reminder Module (Cron Job)

- [ ] Create `ReminderModule`, `ReminderService`
- [ ] Set up `node-cron` to run daily at 9 AM
- [ ] Cron logic:
  - [ ] Fetch all payments where `due_date == today` → flag
  - [ ] Fetch all payments where `due_date == today + 2 days` → flag
  - [ ] Log all reminder targets
- [ ] `POST /reminders/send/:memberId` — manual trigger API
- [ ] Log reminder execution events (timestamp, member, status)
- [ ] ⚠️ Handle failures: retry logic, log errors

---

## Phase 9 — Backend: Security & Config

- [ ] Protect all API routes with `JwtAuthGuard`
- [ ] Enable global validation pipe (`class-validator`)
- [ ] Enable CORS (for Flutter app)
- [ ] Set up global exception filter for clean error responses
- [ ] Configure environment-based settings (dev vs. production)

---

## Phase 10 — Flutter: Auth Screen

- [ ] Build **Login Screen** UI
- [ ] Implement `AuthService` (calls `POST /auth/login`)
- [ ] Store JWT token securely (`shared_preferences`)
- [ ] Redirect to Dashboard on success
- [ ] Show error messages on failure

---

## Phase 11 — Flutter: Dashboard Screen

- [ ] Build **Dashboard Screen** UI
- [ ] Fetch `GET /dashboard/summary` on load
- [ ] Display cards:
  - [ ] Total Members
  - [ ] Active Memberships
  - [ ] Expiring Soon
  - [ ] Pending Payments
- [ ] Add chart using `fl_chart` (e.g., payment status pie chart)

---

## Phase 12 — Flutter: Members Module

- [ ] Build **Member List Screen** (paginated)
- [ ] Build **Add Member Screen** (form with validation)
- [ ] Build **Member Detail Screen** (membership + payment history)
- [ ] Build **Edit Member Screen**
- [ ] Implement `MemberService` (calls `/members` APIs)
- [ ] Add delete confirmation dialog

---

## Phase 13 — Flutter: Membership & Payment Screens

- [ ] Build **Assign Membership Screen** (plan type, dates)
- [ ] Build **Record Payment Screen** (amount, due date, status)
- [ ] Build **Unpaid Payments Screen** (list of all dues)
- [ ] Build **Payment History Screen** per member
- [ ] Implement `MembershipService` and `PaymentService`

---

## Phase 14 — Flutter: WhatsApp Reminder (Phase 1 MVP)

- [ ] On **Member Detail Screen**, add "Send Reminder" button
- [ ] Tap → open WhatsApp via deep link:
  ```
  https://wa.me/<phone>?text=Hi%20<name>%2C%20your%20payment%20of%20%E2%82%B9<amount>%20is%20due.
  ```
- [ ] Use `url_launcher` package to open the link
- [ ] Pre-fill message with member name, amount, due date

---

## Phase 15 — Testing

### Backend
- [ ] Write unit tests for `PaymentService` (due logic)
- [ ] Write unit tests for `ReminderService` (cron logic)
- [ ] Write integration tests for all API endpoints using Jest
- [ ] Test edge cases: expired memberships, unpaid users, empty data

### Frontend
- [ ] Manual test all user flows:
  - [ ] Login → Dashboard → Add Member → Assign Plan → Record Payment → Send Reminder
- [ ] Test WhatsApp deep link on a real device
- [ ] Test error states (network failure, invalid login)

---

## Phase 16 — Deployment

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
