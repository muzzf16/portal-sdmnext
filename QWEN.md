# PORTALS-SDM - HRMS (Human Resource Management System) - Development Context

## Project Overview

PORTALS-SDM is a comprehensive Human Resource Management System built as a full-stack application with a React frontend and Node.js/Express backend. The system is designed to manage all aspects of human resource operations including employee data, attendance, leave, payroll, performance, training, recruitment, contracts, and analytics.

The project follows a modern architecture using TypeScript throughout, with SQLite as the database. It's organized in a monorepo structure with separate backend and frontend applications under the `apps/` directory.

## Project Structure

```
sistem-manajemen-sdm/
├── apps/
│   ├── backend/           # Node/Express API (SQLite)
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   └── db.ts
│   │   │   ├── modules/
│   │   │   │   ├── employee/
│   │   │   │   │   ├── employee.controller.ts
│   │   │   │   │   ├── employee.service.ts
│   │   │   │   │   └── employee.repository.ts
│   │   │   │   └── ... (attendance, leave, payroll, performance, notifications)
│   │   │   ├── routes/
│   │   │   │   └── index.ts
│   │   │   ├── middleware/
│   │   │   │   ├── authMiddleware.ts
│   │   │   │   └── errorHandler.ts
│   │   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   └── frontend/
│       ├── package.json
│       ├── vite.config.ts
│       └── src/
│           ├── app/               # App root, providers, layout
│           ├── features/
│           │   ├── 01-employee/
│           │   ├── 02-attendance/
│           │   └── ... (03-10)
│           ├── shared/            # UI components, hooks, utils
│           ├── routes/
│           ├── styles/
│           └── main.tsx
├── docs/
├── .env
└── README.md
```

## Technologies Used

### Frontend
- React with TypeScript
- Vite as build tool
- Tailwind CSS for styling
- React Router for navigation
- Recharts for data visualization
- Lucide React for icons
- TanStack Query for data fetching
- React Hook Form for form management

### Backend
- Node.js with Express
- SQLite as database
- TypeScript for type safety
- bcrypt for password hashing
- jsonwebtoken for authentication
- express-validator for input validation
- Helmet for security
- CORS for cross-origin requests
- Multer for file uploads

## Implemented Modules

The system has completed implementation of all 10 planned modules:

### Core Modules
1. **Employee Management** - Complete employee profiles with history
2. **Attendance Management** - Clock-in/clock-out system with tracking
3. **Leave Management** - Leave requests with approval workflow
4. **Payroll Management** - Automated salary calculation
5. **Performance Review** - KPI-based performance tracking
6. **Training Management** - Training and certification tracking
7. **Contract & Position Management** - Contract and job history
8. **Recruitment & Onboarding** - Candidate and new hire management
9. **Reports & Analytics** - Comprehensive reporting with builder
10. **Notifications & Automated Reminders** - System notifications

### Enhanced Features
- **Dashboard Analytics** - Executive dashboards with real-time metrics
- **Custom Report Builder** - Flexible report creation capabilities
- **Automated Notification System** - Scheduled reminders and alerts
- **Job Scheduling System** - Automated task execution

## API Endpoints

### Auth
- `POST /auth/login` — login users
- `POST /auth/refresh` — refresh tokens

### Employee
- `GET /employees` — list employees
- `GET /employees/:id` — employee details
- `POST /employees` — create new employee
- `PUT /employees/:id` — update employee
- `DELETE /employees/:id` — delete employee

### Attendance
- `POST /attendance/clock-in` — clock in
- `POST /attendance/clock-out` — clock out
- `GET /attendance?employeeId=&month=YYYY-MM` — attendance records

### Leave
- `GET /leave-requests` — leave requests list
- `POST /leave-requests` — create new leave request
- `PUT /leave-requests/:id` — approve/deny request

### Payroll
- `GET /payrolls?period=YYYY-MM` — payroll records
- `POST /payrolls` — create payroll
- `PUT /payrolls/:id` — update payroll
- `DELETE /payrolls/:id` — delete payroll
- `POST /payrolls/:id/components` — add salary components

### Performance
- `GET /performance-reviews` — performance reviews
- `GET /performance-reviews/:id` — review details
- `POST /performance-reviews` — create review
- `PUT /performance-reviews/:id` — update review
- `PUT /performance-reviews/:id/feedback` — add feedback
- `DELETE /performance-reviews/:id` — delete review

### Training
- `GET /pelatihan` — training list
- `GET /pelatihan/employee/:id` — training for specific employee
- `POST /pelatihan/employee/:id` — add training for employee

### Contracts
- `GET /contracts` — contracts list
- `GET /contracts/:id` — contract details
- `GET /contracts/employee/:employeeId` — employee contracts
- `POST /contracts` — create new contract
- `PUT /contracts/:id` — update contract
- `DELETE /contracts/:id` — delete contract

### Recruitment
- `GET /recruitment/candidates` — candidates list
- `GET /recruitment/candidates/:id` — candidate details
- `POST /recruitment/candidates` — add new candidate
- `PUT /recruitment/candidates/:id` — update candidate
- `DELETE /recruitment/candidates/:id` — delete candidate

### Reports
- `GET /reports/employees` — employee reports
- `GET /reports/attendance` — attendance reports
- `GET /reports/payroll` — payroll reports
- `GET /reports/leave` — leave reports
- `GET /reports/performance` — performance reports
- `GET /reports/turnover` — turnover reports
- `GET /reports/demographics` — demographic reports
- `GET /reports/employees/comprehensive` — comprehensive employee reports
- `GET /reports/attendance/analytics` — attendance analytics
- `GET /reports/payroll/analytics` — payroll analytics

### Dashboard
- `GET /dashboard/admin` — admin dashboard data
- `GET /dashboard/employee/:employeeId` — employee dashboard data

### Notifications
- `GET /notifikasi/employee/:employeeId` — employee notifications
- `GET /notifikasi/employee/:employeeId/unread` — unread notifications
- `POST /notifikasi/employee/:employeeId` — create new notification
- `PUT /notifikasi/:notificationId/read` — mark notification as read
- `GET /notifikasi/scheduled` — scheduled notifications

## Building and Running

### Backend
```bash
cd apps/backend
npm install
npm run dev
```
Server will run on `http://localhost:3333`

### Frontend
```bash
cd apps/frontend
npm install
npm run dev
```
Application will be available at `http://localhost:5173`

### Additional Scripts
Backend:
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run compiled JavaScript
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data

Frontend:
- `npm run build` - Build for production
- `npm run lint` - Check for linting errors
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Input validation and sanitization
- Protection against common attacks (XSS, CSRF)
- Prepared statements to prevent SQL injection
- Role-based access control (RBAC)
- Audit logging for activity tracking

## Architecture Patterns

The system follows several architectural patterns:

- **MVC + Service Layer**: Clear separation between controllers, services, and repositories
- **Feature-based Organization**: Frontend components organized by feature domain
- **Repository Pattern**: Data access abstraction layer
- **Middleware Pattern**: Cross-cutting concerns in Express middleware
- **Modular Monolith**: Clear module separation within a single deployable unit

## Database Schema

SQLite database with tables for:
- `users` - Authentication information
- `pegawai` - Employee data
- `absensi` - Attendance records
- `permintaan_cuti` - Leave requests
- `penggajian` - Payroll information
- `penilaian_kinerja` - Performance reviews
- `pelatihan` - Training records
- `kontrak` - Employment contracts
- `riwayat_jabatan` - Job history
- `kandidat` - Recruitment candidates
- `tugas_orientasi` - Onboarding tasks
- `notifikasi` - Notification system

## Development Conventions

- TypeScript is used throughout for type safety
- RESTful API design principles
- Feature-based directory organization in frontend
- Service layer for business logic separation
- Consistent error handling patterns
- Comprehensive input validation
- Proper separation of concerns

## Project Status

The HRMS system implementation is **COMPLETE** with all planned modules and features successfully delivered. The system provides a comprehensive, enterprise-grade human resource management solution that covers all aspects of HR operations with advanced reporting, automated notifications, and comprehensive dashboards.