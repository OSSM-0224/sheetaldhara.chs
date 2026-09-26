# SHEETALDHARA CHS — Society Vehicle Owner Lookup & Management System

A production-grade, mobile-first web application built for residential cooperative housing societies (**SHEETALDHARA CHS**) to resolve parking disputes, identify vehicle owners instantly, and maintain an organized society registry.

---

## 📌 Problem & Purpose

In residential cooperative societies, cars and two-wheelers frequently block driveways, park in incorrect slots, or need to be moved for emergencies and maintenance. Residents often spend excessive time asking in society chat groups or tracking down security guards.

**Society Vehicle Owner Lookup** provides:
1. **Instant Vehicle Search**: Residents can search by entering the **full registration plate** or just the **last 4 digits**.
2. **Duplicate Disambiguation**: When multiple vehicles share the same last 4 digits (e.g., a car and a bike), the system displays vehicle models and types so residents can select the exact match.
3. **Direct 1-Click Calling**: Allows residents to call the owner via phone or copy their contact number with one tap.
4. **Car vs. Bike Parking Clarity**: Highlights designated parking numbers for cars (e.g., `P-24`), while clarifying society common parking rules for two-wheelers.
5. **Secure Admin Registry**: Society management can add, update, and remove residents, register vehicles, view real-time search audit logs, and reset demo data.
6. **Complete Multilingual Support**: Full localized interface in **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)**.

---

## 🚀 Key Features

### 🔍 1. Smart Vehicle Plate Search
- **Flexible Input**: Handles full plate inputs (e.g., `MH02AB4821`, `MH-02 AB 4821`) or 4-digit queries (e.g., `4821`, `9090`).
- **Automatic Normalization**: Strips spaces, dashes, special characters, and converts lowercase to uppercase.
- **Ambiguity Resolution**: When multiple vehicles share the last 4 digits, an interactive card selector lets the user pick between matching vehicles (e.g., Honda City vs Royal Enfield).
- **Owner Card Display**:
  - Registered plate number in large monospace font
  - Owner's full name & flat/room number (e.g., `B-304`)
  - Vehicle brand, model, color, and vehicle category (Car / Bike / Other)
  - Designated parking slot (for cars) or common parking notice (for two-wheelers)
  - **Call Owner Button** (`tel:` protocol for mobile devices)
  - **Copy Phone Number Button** with visual confirmation feedback

### 👤 2. Three-Tier Role-Based Architecture
- **Resident Sign-In (Passwordless)**:
  - Residents log in simply by verifying their **Flat/Room Number** (e.g., `B-304`) and **Registered Phone Number** (e.g., `9820022334`).
  - No complicated passwords or OTP dependencies.
- **Watchman Gate Console (Strictly Isolated)**:
  - Gate guards authenticate via **Phone** + **Password** (bcrypt-hashed).
  - Fast mobile entry form to register visitor/delivery vehicles (Plate, Type, Driver Phone, Visiting flat/note).
  - Can view recent outsider entries and mark vehicle exits.
  - **Zero Access to Resident Data**: Watchmen cannot view flat rosters, resident profiles, or registered society vehicles.
- **Administrator Login & Control Suite**:
  - Secure phone and bcrypt-hashed password login for society committee members.
  - Full management of residents, registered vehicles, watchman accounts, outsider vehicle registries, and search audit trails.
- **Session Management**:
  - Signed JWT stored in a 30-day `httpOnly` secure cookie with browser fallback.
  - Rate limiting on authentication and search endpoints to prevent abuse.

### 🛡️ 3. Watchman Console & Outsider Vehicle Registration
- **Gate Entry Logging**:
  - Quick input for outsider cars, bikes, and delivery vans parked inside society premises.
  - Captures plate number, owner/driver phone number, optional name, and visiting purpose (e.g., "Flat B-304 Delivery / Amazon").
  - Instant normalization (strips spaces, dashes, converts to uppercase).
- **Gate Exit Tracking**:
  - Watchmen can mark vehicles as "Exited" with a single tap.
- **Unified Resident Search Integration**:
  - When residents or admins search any plate or last 4 digits, results seamlessly search both society-registered vehicles and active outsider vehicles.
  - Outsider vehicles display a distinctive **"Visitor / Delivery Vehicle"** badge, along with the driver's phone, entry timestamp, and gate guard attribution.
  - 1-Click calling enables residents to immediately phone visitor drivers blocking common driveways.

### 🚗 4. Resident "My Vehicles" Portal
- Logged-in residents can view all vehicles officially registered under their flat.
- Shows vehicle specs, assigned parking bays, and society registration status.
- Prevents unauthorized edits while providing guidance on contacting society admin for registry updates.

### 🛡️ 5. Comprehensive Admin Management Suite
- **Residents & Flats Directory**:
  - Visual doorplate badge for each flat (`A-101`, `B-304`, `C-702`).
  - Add new residents, update contact info, or remove residents with confirmation safeguards.
  - View all vehicles currently linked to each resident directly on their card.
- **Vehicles Registry**:
  - Register new vehicles by selecting the resident, type (Car/Bike/Other), brand, model, plate, and parking bay.
  - Edit plate numbers, vehicle details, and parking slot assignments.
  - Instant validation of plate format and uniqueness.
- **Watchmen Management**:
  - Add, edit, activate/deactivate, or delete watchman accounts.
  - Set and reset watchman login passwords.
- **Outsider Vehicles Master Registry**:
  - Live dashboard tracking total outsider vehicles, vehicles currently inside, and exited vehicles.
  - Filter by status (All / Inside / Exited) and search by plate, driver phone, or visiting note.
  - Society admins can also mark vehicle exit if needed.
- **Search Audit Trail (Logs)**:
  - Real-time audit log tracking who searched which plate at what timestamp.
  - Shows searcher resident ID/name, query term, matched vehicle, and status.
- **Reset to Seed Data**:
  - One-click button in the admin interface to re-populate the sample society dataset for evaluations and demonstrations.

### 🌐 6. Multilingual Interface (Trilingual)
- **English**
- **Hindi (हिंदी)**
- **Marathi (मराठी)**
- Seamless switching via the header dropdown or slide-over navigation drawer.

### 📱 7. Mobile-First Responsive Design
- Optimized for all screen sizes: **320px (iPhone SE)**, **375px**, **414px**, **768px (Tablets)**, and **1024px+ (Desktop)**.
- **Touch Ergonomics**: All interactive buttons, inputs, and tab triggers meet the 44px minimum tap target guideline.
- **Slide-Out Drawer**: Clean mobile navigation drawer with resident/watchman details and language selector.
- **No Overflow**: Protected with strict boundary constraints (`overflow-x: hidden`) so no horizontal page jitter occurs.

---

## 🔑 Demo Accounts & Sample Search Data

For testing and evaluation, the application includes pre-seeded demo records:

### Admin Account
| Role | Phone | Password | Flat | Name |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `9820011223` | `admin123` | `A-101` | Ramesh Sharma |

### Watchman Account (Gate Security)
| Role | Phone | Password | Assigned Gate | Name |
| :--- | :--- | :--- | :--- | :--- |
| **Watchman** | `9820055667` | `watchman123` | Main Gate | Sanjay Yadav |

### Resident Accounts (Passwordless: Flat + Phone)
| Flat / Room | Registered Phone | Resident Name | Registered Vehicles |
| :--- | :--- | :--- | :--- |
| `B-304` | `9820022334` | Priya Nair | Honda City (`MH02AB4821`, Slot `P-24`) |
| `C-702` | `9820033445` | Amitabh Sen | Royal Enfield Classic 350 (`MH12CD4821`) |
| `A-502` | `9820044556` | Sneha Kulkarni | Hyundai Creta (`MH01EF9090`), Ather 450X (`MH47XY9090`), TVS Jupiter (`MH01GH3312`) |
| `D-201` | `9820077889` | Vikram Malhotra | Tata Nexon EV (`MH04JK1100`), Maruti Swift (`MH02MN7766`) |
| `B-103` | `9820066778` | Kavita Rao | None (can be assigned via Admin) |
| `G-201` | `7506380156` | Om Mhatre | Pre-registered resident profile |

### Pre-Seeded Outsider Vehicles
| Plate Number | Vehicle Type | Driver Phone | Driver Name | Visiting Purpose | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `MH04AX4821` | CAR | `9892011222` | Rajesh Verma | Guest visiting Flat B-304 | Inside |
| `MH03CC9090` | BIKE | `9819033444` | Quick Courier | Amazon delivery for C-702 | Inside |

### Sample Plate Numbers to Try in Search
- **`4821`**: Demonstrates multiple match disambiguation! Matches:
  1. **Priya Nair's Honda City** (`MH02AB4821` - Resident)
  2. **Amitabh Sen's Royal Enfield** (`MH12CD4821` - Resident)
  3. **Rajesh Verma's Guest Car** (`MH04AX4821` - Visitor/Outsider)
- **`9090`**: Matches Sneha Kulkarni's resident vehicles AND the Quick Courier delivery bike.
- **`1100`**: Matches Vikram Malhotra's **Tata Nexon EV** (`MH04JK1100`, Slot `P-09`).
- **`MH04AX4821`**: Direct match for the visitor guest car.

> **Tip**: When logged in, use the top **Demo Switcher Bar** to switch between personas (Resident, Admin, Watchman) in one click!

---

## 🛠️ Tech Stack

### Frontend
- **React 19** (`react`, `react-dom`)
- **TypeScript 5.8**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Radix UI Primitives** (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-tabs`, `@radix-ui/react-label`, `@radix-ui/react-slot`)
- **Lucide React** (Vector icons)
- **Motion** (Smooth animations and transitions)

### Backend
- **Node.js** & **Express 4**
- **TypeScript** executed via `tsx` in development and bundled with `esbuild` for production
- **JWT (`jsonwebtoken`)** for secure stateless token authentication
- **Cookie Parser (`cookie-parser`)** for `httpOnly` cookie handling
- **Bcrypt.js (`bcryptjs`)** for secure administrator password hashing

### Persistence Layer
- **MongoDB via Mongoose** (MongoDB Atlas or a local `mongod`)
  - Mongoose schemas with unique constraints on `Resident.room_number`, `Resident.phone`, `Admin.phone`, `Watchman.phone`, and `Vehicle.plate`
  - Compound index on `(room_number, phone)` for passwordless resident sign-in
  - `backend/src/db/seed.ts` seeds a realistic Mumbai housing society dataset when the database is empty

> MongoDB is the only data store. `MONGODB_URI` must be set and reachable or the server refuses to start — there is no silent fallback to a local file.

---

## 📁 Project Directory Structure

```text
├── .env
├── .env.example
├── archive/
│   └── legacy-frontend/
│       └── src/                # Archived pre-frontend/ React source
├── backend/
│   └── src/                    # Express API, entrypoint, MongoDB models and controllers
│       ├── index.ts            # Single entrypoint: connectDB + createApp + listen
│       ├── app.ts              # Express app assembly
│       ├── config/             # env, db connection, cookie options
│       ├── controllers/        # Request handlers
│       ├── db/seed.ts          # Demo dataset seeding
│       ├── middleware/         # auth, cors, rate limiters, error handler
│       ├── models/             # Mongoose schemas
│       ├── routes/             # Route definitions
│       ├── types/
│       └── utils/
├── frontend/
│   ├── index.html              # Active frontend entry point
│   └── src/                    # Active React application
├── render.yaml                 # Render blueprint (API)
├── vercel.json                 # Vercel config (frontend)
├── vite.config.ts
├── package.json
├── tsconfig.json
└── tsconfig.base.json
```

Run all commands from the repository root. `backend/` holds the API (entrypoint `backend/src/index.ts`) and `frontend/` holds the React client. The two deploy independently: the API to Render, the client to Vercel.

---

## 🔌 API Endpoints Reference

### Authentication
- `POST /api/auth/resident-signin`: Sign in as resident with `{ room_number, phone }`.
- `POST /api/auth/admin-login`: Sign in as admin with `{ phone, password }`.
- `POST /api/auth/logout`: Clears session cookie.
- `GET /api/auth/me`: Retrieves current authenticated user or resident profile.

### Resident Operations
- `GET /api/search?q=:query`: Searches vehicles by plate or last 4 digits (Rate-limited).
- `GET /api/my-vehicles`: Returns all vehicles registered under the authenticated resident.

### Admin Operations (`requireAdmin` protected)
- `GET /api/admin/residents`: List all residents with their assigned vehicles.
- `POST /api/admin/residents`: Add a new resident (`full_name`, `room_number`, `phone`).
- `PATCH /api/admin/residents/:id`: Edit resident details.
- `DELETE /api/admin/residents/:id`: Remove resident and cascade-delete their registered vehicles.
- `GET /api/admin/vehicles`: List all vehicles with owner details and parking slots.
- `POST /api/admin/vehicles`: Register a vehicle (`resident_id`, `vehicle_type`, `brand`, `model`, `plate`, `parking_number`).
- `PATCH /api/admin/vehicles/:id`: Update vehicle details or assigned resident.
- `DELETE /api/admin/vehicles/:id`: Delete vehicle from registry.
- `GET /api/admin/search-logs`: Retrieve vehicle search audit logs.
- `POST /api/admin/reset-seed`: Reset society database back to initial demo seed.

---

## 💻 Local Setup & Development

### Prerequisites
- **Node.js** 18+ or 20+
- **npm** 9+

### 1. Clone & Install
```bash
git clone <repository-url>
cd society-vehicle-lookup
npm install
```

### 2. Configure Environment
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```
Key configuration items:
```env
JWT_SECRET="your-secure-jwt-secret"
ADMIN_PHONE="9820011223"
ADMIN_PASSWORD="your-admin-password"
MONGODB_URI="mongodb://127.0.0.1:27017/sheetaldhara_chs"
```

### 3. Run in Development Mode
```bash
npm run dev
```
The server will start at `http://localhost:3000` with hot code reloading enabled via Vite.

### 4. Build & Run for Production
```bash
# Compile client assets and bundle backend server
npm run build

# Start the compiled production server
npm start
```

### 5. Code Quality & Linting
```bash
npm run lint
```

---

## 🔒 Security & Data Integrity Highlights

1. **Input Normalization**: Removes non-alphanumeric noise to prevent mismatched queries.
2. **Rate Limiting**: Protects `/api/auth/resident-signin` and `/api/search` against brute-force scraping.
3. **Role Authorization**: Admin routes strictly check JWT claims before processing any mutations.
4. **Relational Deletion**: Removing a resident cleanly removes linked vehicle records, preventing orphaned data.
5. **No Passwords for Residents**: Eliminates password reuse vulnerabilities and friction for elderly residents.

---

## 📄 License
Created for **SHEETALDHARA Cooperative Housing Society Ltd.**
Distributed under the MIT License.
