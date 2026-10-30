# ParkShare - Hourly Parking Slot Sharing Platform

ParkShare is a full-stack web application designed for residential apartment communities. It enables residents to monetise their unused parking spaces by renting them out on an hourly basis to neighbours and visitors, while providing community administrators with complete operational oversight, booking tracking, and verified financial reporting.

---

## 1. Key Features

### Resident Portal
- **Authentication & Profiles**: Secure JWT authentication with bcrypt password hashing; strict resident scoping.
- **Slot Listing & Management**: List parking slots with slot numbers, vehicle type (`car` or `bike`), hourly pricing in INR (`₹`), and custom availability windows; edit slot details and toggle active/inactive status.
- **Discovery & Search**: Browse community slots with multi-parameter filtering (vehicle type, location keyword search, price range) with self-owned slot exclusion.
- **Hourly Reservations**: Date/time selector with real-time duration and price estimation; overlap collision prevention with `409 Conflict` resolution; server-side authoritative pricing.
- **Simulated Digital Payments**: Modal interface simulating UPI (virtual VPA), Card, and Cash settlements; instant transition to `paid` status without harvesting sensitive financial credentials.
- **Cancellation & Automated Refunds**: Cancel reservations prior to slot start time; unpaid bookings remain `pending`, while paid bookings automatically transition to `refunded`.
- **Received Bookings & Earnings**: Slot hosts can track incoming reservations on their listed spaces, guest details, and settlement statuses.
- **Payment History**: Detailed personal ledger of all parking expenditures and refunds.

### Administrator Console
- **Executive Dashboard**: Real-time KPI summaries for community members, parking inventory, reservations, and financial settlements.
- **Financial Integrity**: Authoritative separation of **Gross Paid Revenue**, **Net Retained Revenue**, **Total Refunded Amount**, and **Pending Payment Pipeline** (pending funds are never counted as revenue).
- **User Directory**: Paginated member table with debounced search across names and emails, role-based filtering (`resident` vs `admin`), and flat number identification.
- **Reservation Audit Log**: Comprehensive, filterable audit log of all community reservations with booker details, slot information, time windows, and payment statuses.
- **Role-Based Access Control**: Strict `admin` route guards and backend authorization middleware returning `403 Forbidden` for non-administrative accounts.

---

## 2. Technology Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **Middleware**: CORS, Express JSON parser, custom auth & admin RBAC middleware

### Frontend
- **Build Tool**: Vite
- **UI Framework**: React (v18, JavaScript)
- **Routing**: React Router DOM (v6) with Protected and Admin Route Guards
- **Styling**: Tailwind CSS (v3)
- **Icons**: Lucide React
- **HTTP Client**: Axios with centralized request interceptors and 401 response handling
- **State Management**: React Context API (`AuthContext`)

---

## 3. Project Structure

```text
ParkShare/
|-- README.md                     # Comprehensive project documentation
|-- .gitignore                    # Root gitignore excluding dependencies and secrets
|-- server/                       # Backend Express API
|   |-- config/
|   |   +-- db.js                 # MongoDB Mongoose connection handler
|   |-- controllers/
|   |   |-- authController.js     # Register, Login, Me handlers
|   |   |-- slotController.js     # CRUD operations for parking slots
|   |   |-- bookingController.js  # Booking creation, cancellation, payments
|   |   |-- paymentController.js  # Payment transaction history
|   |   +-- adminController.js    # Statistics, users directory, booking audits
|   |-- middleware/
|   |   |-- auth.js               # Bearer JWT verification middleware
|   |   +-- admin.js              # Admin role authorization guard
|   |-- models/
|   |   |-- User.js               # User schema with bcrypt pre-save hook
|   |   |-- Slot.js               # Parking slot schema with compound unique index
|   |   +-- Booking.js            # Reservation schema with payment status enums
|   |-- routes/
|   |   |-- authRoutes.js         # /api/auth endpoints
|   |   |-- slotRoutes.js         # /api/slots endpoints
|   |   |-- bookingRoutes.js      # /api/bookings endpoints
|   |   |-- paymentRoutes.js      # /api/payments endpoints
|   |   +-- adminRoutes.js        # /api/admin endpoints
|   |-- .env.example              # Server environment variable template
|   |-- package.json              # Server dependencies and scripts
|   +-- server.js                 # Express server bootstrap
|
+-- client/                       # Frontend React + Vite application
    |-- public/                   # Static assets
    |-- src/
    |   |-- components/
    |   |   |-- auth/             # Route protection components
    |   |   |-- bookings/         # BookingCard, StatusBadges, Payment & Cancel Modals
    |   |   |-- common/           # LoadingSpinner, ErrorMessage, ConfirmationModal
    |   |   |-- layout/           # Sidebar, MobileNavigation, ResidentLayout, AdminLayout
    |   |   +-- slots/            # FilterPanel, ParkingSlotCard, SlotEditModal
    |   |-- context/
    |   |   +-- AuthContext.jsx   # Global user, token, login, logout state
    |   |-- pages/
    |   |   |-- auth/             # Login & Register views
    |   |   |-- resident/         # Dashboard, Discovery, CreateSlot, Bookings, Payments
    |   |   +-- admin/            # Executive Overview, User Management, Booking Audits
    |   |-- routes/               # ProtectedRoute, AdminRoute, PublicRoute
    |   |-- services/
    |   |   +-- api.js            # Centralized Axios instance with auth interceptors
    |   |-- App.jsx               # Application routes tree
    |   |-- index.css             # Tailwind base styles and font definitions
    |   +-- main.jsx              # React root DOM mount
    |-- .env.example              # Client environment variable template
    |-- package.json              # Client dependencies and scripts
    |-- tailwind.config.js        # Tailwind CSS theme configuration
    +-- vite.config.js            # Vite bundler configuration
```

---

## 4. Prerequisites

- **Node.js**: `v18.0.0` or higher (tested on Node v20/v24)
- **npm**: `v9.0.0` or higher
- **MongoDB**: Local MongoDB instance running at `mongodb://127.0.0.1:27017` (or MongoDB Atlas connection URI)

---

## 5. Local Installation Steps

### 1. Clone the repository
```bash
git clone <repository-url>
cd ParkShare
```

### 2. Configure Backend Environment
Create `server/.env` based on `server/.env.example`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/parkshare
JWT_SECRET=<your_jwt_secret_min_32_chars>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Install backend dependencies:
```bash
cd server
npm install
```

### 3. Configure Frontend Environment
Create `client/.env` based on `client/.env.example`:
```env
VITE_API_URL=http://localhost:5000/api
```

Install frontend dependencies:
```bash
cd ../client
npm install
```

---

## 6. Starting the Application

### Start the Backend Server
```bash
cd server
npm start
# or for development with hot-reload:
npm run dev
```
The server will start on `http://localhost:5000`. You can verify the health check endpoint:
```bash
curl http://localhost:5000/api/health
# Response: {"status":"ok","timestamp":"...","database":"connected"}
```

### Start the Frontend Application
In a separate terminal:
```bash
cd client
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 7. Creating an Administrator Account

Because public registration strictly creates resident accounts (`role: 'resident'`), an administrative user must be created using the secure one-time CLI script:

### Interactive Mode:
```bash
cd server
npm run create-admin
```
The script will prompt you for:
- Admin Name (e.g., `Community Administrator`)
- Admin Email (e.g., `admin@parkshare.local`)
- Admin Password ($\ge 6$ characters)
- Admin Flat/Office Identifier (default: `Admin Office`)

If the email already exists as a resident, the script offers a safe confirmation prompt to promote that account to `admin`. Password hashing is handled automatically by bcrypt via the User model pre-save hook.

### Non-Interactive / Environment Variable Mode:
You can also supply credentials via environment variables:
```bash
cd server
ADMIN_NAME="Super Admin" ADMIN_EMAIL="admin@parkshare.local" ADMIN_PASSWORD="<your_secure_password>" npm run create-admin
```

Once created, sign in at `http://localhost:5173/login`. You will be automatically redirected to the Executive Admin Console at `/admin`.

---

## 8. API Endpoint Summary

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register resident (role forced to `resident`) | No |
| `POST` | `/api/auth/login` | Login with email and password | No |
| `GET` | `/api/auth/me` | Fetch currently authenticated user profile | Yes (Bearer) |

### Parking Slots (`/api/slots`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/slots` | Create a parking slot (owner set from JWT) | Yes |
| `GET` | `/api/slots` | Discover active slots (excludes own slots) | Yes |
| `GET` | `/api/slots/mine` | List all slots created by authenticated resident | Yes |
| `GET` | `/api/slots/:id` | Get single slot details | Yes |
| `PUT` | `/api/slots/:id` | Update slot details (owner or admin only) | Yes |

### Bookings (`/api/bookings`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/bookings` | Book a parking slot (overlap collision check) | Yes |
| `GET` | `/api/bookings/mine` | List reservations created by authenticated user | Yes |
| `GET` | `/api/bookings/received` | List reservations on slots owned by user | Yes |
| `PUT` | `/api/bookings/:id/pay` | Process simulated payment (`UPI`, `Card`, `Cash`) | Yes |
| `PUT` | `/api/bookings/:id/cancel` | Cancel booking (triggers refund if paid) | Yes |

### Payments (`/api/payments`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/payments` | View user's payment transaction history | Yes |

### Admin Console (`/api/admin`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Aggregated platform metrics and revenues | Admin Only |
| `GET` | `/api/admin/users` | Paginated user management with search & filter | Admin Only |
| `GET` | `/api/admin/bookings` | Paginated booking audit log with dual filters | Admin Only |

---

## 9. Demo Walkthrough Workflow

### A. Resident Workflow
1. **Register Host**: Navigate to `/register` and sign up as "Alice" (Flat: Tower-1 101).
2. **Create Parking Slot**: Go to **My Slots** -> **List a Parking Space**. Add slot "A-12", ₹60/hr, available for the next 48 hours.
3. **Register Booker**: Log out. Register a second account "Bob" (Flat: Tower-2 404).
4. **Discover Slot**: Navigate to **Find Parking**. Filter by vehicle type or search by location. Select slot "A-12".
5. **Reserve Slot**: Click **Proceed to Book This Slot**. Choose a 3-hour window in the future. Submit reservation.
6. **Simulate Payment**: Navigate to **My Bookings**. The reservation is marked `Confirmed` and `Pending`. Click **Pay Now**, select **UPI**, and click **Simulate Successful Payment**. Payment badge immediately turns green (`Paid`).
7. **Verify Host View**: Log in as Alice. Open **Received Bookings** to see Bob's reservation, vehicle timing, and paid status.
8. **Cancellation & Refund**: Log back in as Bob. In **My Bookings**, click **Cancel Reservation**. Notice the prompt informing that funds will be refunded. Confirm cancellation. The payment status transitions to `Refunded` and booking status becomes `Cancelled`.

### B. Admin Workflow
1. **Create Administrator**: Run `npm run create-admin` in `server/` or promote an existing account.
2. **Access Admin Console**: Log in. The application automatically directs to `/admin`.
3. **Inspect Metrics**: Review Net Retained Revenue, Gross Paid Revenue, and Refunded amounts. Confirm that pending amounts are excluded from revenue.
4. **Manage Users**: Go to `/admin/users`. Search for "Alice" or filter by role.
5. **Audit Bookings**: Go to `/admin/bookings`. Filter reservations by status (`Cancelled`) or payment status (`Refunded`).

---

## 10. Testing & Production Build

### Running Frontend Production Build
```bash
cd client
npm run build
```
This runs Vite to transform modules and emit optimized bundles to `dist/`.

### Security Verification Highlights
- **Role Elevation Blocked**: Attempting to supply `{ role: 'admin' }` during public registration is discarded; public accounts are strictly `resident`.
- **Authoritative Calculations**: Duration, hourly pricing, and `totalAmount` are calculated on the server; tampering with request bodies has zero effect.
- **Privacy Assurance**: Password hashes are stripped at the query level (`.select('-password')` or explicit field whitelists) and are never transmitted to clients.
- **Zero Real Payment Exposure**: Simulated payments never collect CVVs, OTPs, or real card data.

