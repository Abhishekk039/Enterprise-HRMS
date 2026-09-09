# 🏢 Enterprise HRMS — Smart Workforce Management System

An enterprise-grade, full-stack Human Resource Management System (HRMS) built with **Java 17**, **Spring Boot 3.5**, **Spring Security (Stateless JWT)**, **Flyway Database Migrations**, **MySQL**, and a modern **React + TypeScript + Vite** frontend.

---

## 🚀 Key Modules & Capabilities

1. **🔐 Authentication & Role-Based Access Control (RBAC)**
   - Stateless JWT tokens (HMAC-SHA256 signed, 24-hour expiration)
   - BCrypt password hashing & Spring Security filter chain
   - 4-Tier Roles: `ROLE_ADMIN`, `ROLE_HR`, `ROLE_MANAGER`, `ROLE_EMPLOYEE`
   - Default Administrator auto-provisioned on boot: `admin` / `admin123`

2. **👥 Employee Management**
   - Full CRUD with request/response DTO isolation and validation
   - Unique employee code and email checks
   - Relational mapping to Department with lazy loading and audit timestamps

3. **🏢 Department Administration**
   - Organizational units creation, modification, and listing
   - Safeguard protection against deleting departments with assigned active personnel

4. **🔍 Dynamic Search, Filtering & Pagination**
   - Spring Data JPA Specifications for multi-criteria search
   - Text search across `firstName`, `lastName`, `email`, and `employeeCode`
   - Filter by department, employment status (`ACTIVE`/`INACTIVE`), and date of joining

5. **⏰ Attendance & Shift Clock**
   - Real-time check-in and check-out terminal
   - Automatic shift duration calculation & half-day (< 4 hours) classification
   - Administrative manual shift recording and date-range history

6. **📅 Leave Management & Approvals**
   - Categories: Casual, Sick, Annual, Maternity, Paternity, Unpaid
   - Overlap prevention algorithm (ensures no conflicting active leaves)
   - Adjudication workflow (Approve / Reject with justification reason)

7. **💰 Payroll & Compensation**
   - Monthly salary disbursement computation: `Basic Salary + Allowances - Deductions`
   - Payment status tracking (`PENDING`, `PROCESSED`, `PAID`) with payment methods
   - Unique period protection against duplicate payroll generation

8. **⭐ Performance Reviews & Appraisals**
   - 5-Star rating system with qualitative manager assessments
   - Target goal setting for upcoming quarters
   - Employee review acknowledgment workflow

9. **✨ Luxury Dark Mode React Dashboard**
   - Built with Vite, React 19, TypeScript, and Lucide Icons
   - Glassmorphic card styling, responsive sidebar navigation, and live digital clock
   - One-click demo login pill

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Backend Framework** | Spring Boot 3.5.16, Spring Data JPA, Spring Web |
| **Language** | Java 17 |
| **Security** | Spring Security 6, JJWT (io.jsonwebtoken 0.12.6) |
| **Database** | MySQL 8.0, Flyway Migrations (V1 to V5) |
| **Build Tool** | Apache Maven 3.9+ |
| **Frontend Framework** | React 19, Vite, TypeScript |
| **Styling** | Vanilla CSS (Glassmorphism, Outfit & Plus Jakarta Sans) |
| **Containerization** | Docker, Docker Compose, Nginx |

---

## 📁 Repository Structure

```text
├── hrms/                        # Spring Boot Backend Project
│   ├── src/main/java/com/abhishek/hrms/
│   │   ├── config/              # Security, CORS, DataInitializer
│   │   ├── controller/          # REST API Controllers (Auth, Emp, Dept, Leave, Att, Pay, Perf)
│   │   ├── dto/                 # Request & Response DTOs
│   │   ├── entity/              # JPA Entities & Enums
│   │   ├── exception/           # Global Exception Handler & Custom Errors
│   │   ├── repository/          # Spring Data JPA Repositories
│   │   ├── security/            # JWT Utils, Filter, UserDetailsService
│   │   ├── service/             # Service Interfaces & Implementations
│   │   └── specification/       # Dynamic JPA Specifications
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── db/migration/        # Flyway Migrations (V1 to V5)
│   ├── src/test/java/           # Mockito & JUnit 5 Unit Tests
│   ├── Dockerfile
│   └── pom.xml
│
├── hrms-frontend/               # React + Vite Frontend Project
│   ├── src/
│   │   ├── components/          # Sidebar, Header, Dashboard, Employees, etc.
│   │   ├── context/             # AuthContext (JWT session management)
│   │   ├── services/            # api.ts (HTTP client with Bearer token)
│   │   ├── types/               # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── index.css            # Design system & glass styling
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
└── docker-compose.yml           # Multi-container orchestration (MySQL + App + Web)
```

---

## ⚡ Quick Start Options

### Option 1: Run with Docker Compose (Recommended)

Run the entire full stack (MySQL + Backend + Frontend) with one single command:

```bash
docker compose up --build -d
```

- **Frontend Portal**: `http://localhost`
- **Backend API**: `http://localhost:8080`
- **MySQL Database**: `localhost:3306`

---

### Option 2: Run Locally (Development Mode)

#### 1. Start MySQL & Create Database
```sql
CREATE DATABASE hrms;
```

#### 2. Start Spring Boot Backend
```bash
cd hrms
./mvnw spring-boot:run
```
*(On Windows PowerShell: `.\mvnw.cmd spring-boot:run`)*

The backend will automatically execute Flyway migrations (`V1` to `V5`), create database tables, seed the default administrator account, and run on `http://localhost:8080`.

#### 3. Start Vite React Frontend
In a separate terminal:
```bash
cd hrms-frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔑 Default Credentials

The system seeds an administrator on initial startup:
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `ROLE_ADMIN`

*(You can also use the one-click "Fill Admin" button on the login screen).*

---

## 📡 Core API Endpoints

| Category | Method | Endpoint | Description |
|---|---|---|---|
| **Auth** | POST | `/api/auth/login` | Authenticate & receive JWT token |
| **Auth** | POST | `/api/auth/register` | Register new user account |
| **Auth** | GET | `/api/auth/me` | Fetch current profile |
| **Employees** | GET | `/api/employees` | Paginated & filtered employees |
| **Employees** | POST | `/api/employees` | Onboard employee (Admin/HR) |
| **Employees** | PUT | `/api/employees/{id}` | Update employee |
| **Employees** | DELETE | `/api/employees/{id}` | Delete employee (Admin/HR) |
| **Departments** | GET | `/api/departments` | Paginated departments |
| **Departments** | POST | `/api/departments` | Create department (Admin/HR) |
| **Attendance** | POST | `/api/attendances/check-in` | Clock-in for today |
| **Attendance** | POST | `/api/attendances/check-out` | Clock-out & calculate hours |
| **Attendance** | POST | `/api/attendances/record` | Admin manual shift log |
| **Leaves** | POST | `/api/leaves` | Submit leave request |
| **Leaves** | PATCH | `/api/leaves/{id}/status` | Approve/Reject leave request |
| **Payroll** | POST | `/api/payrolls/generate` | Generate monthly payroll slip |
| **Payroll** | PATCH | `/api/payrolls/{id}/status` | Update payment status (PAID) |
| **Performance**| POST | `/api/performance-reviews` | Submit evaluation appraisal |
| **Performance**| PATCH | `/api/performance-reviews/{id}/acknowledge` | Employee acknowledges review |

---

## 🧪 Running Unit Tests

Run test suites with JUnit 5 and Mockito:

```bash
cd hrms
./mvnw test
```
*(Result: 13/13 passing unit tests with 0 failures).*
