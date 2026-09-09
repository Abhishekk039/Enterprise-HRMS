# HRMS Backend

A Spring Boot-based Human Resource Management System backend for managing departments and employees. The project exposes REST APIs, uses MySQL for persistence, applies Flyway for database migration, and secures API endpoints with Spring Security.

## Overview

This application provides a backend service for:

- Managing departments
- Managing employees
- Storing employee records in MySQL
- Running database migrations automatically with Flyway
- Securing API access with HTTP Basic authentication

The project currently contains the backend only. A frontend can connect to this API through the exposed REST endpoints.

---

## Tech Stack

- Java 17
- Spring Boot 3.5.16
- Spring Web
- Spring Data JPA
- Spring Security
- MySQL
- Flyway
- Maven

---

## Project Structure

```text
hrms/
├── src/
│   ├── main/
│   │   ├── java/com/abhishek/hrms/
│   │   │   ├── config/
│   │   │   │   └── SecurityConfig.java
│   │   │   ├── controller/
│   │   │   │   ├── DepartmentController.java
│   │   │   │   └── EmployeeController.java
│   │   │   ├── entity/
│   │   │   │   ├── Department.java
│   │   │   │   └── Employee.java
│   │   │   ├── repository/
│   │   │   │   ├── DepartmentRepository.java
│   │   │   │   └── EmployeeRepository.java
│   │   │   ├── service/
│   │   │   │   ├── DepartmentService.java
│   │   │   │   └── EmployeeService.java
│   │   │   └── HrmsApplication.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── db/migration/
│   │           ├── V1__create_departments.sql
│   │           └── V2__create_employees.sql
│   └── test/java/com/abhishek/hrms/
│       └── HrmsApplicationTests.java
├── pom.xml
├── mvnw
├── mvnw.cmd
├── .gitignore
└── README.md
```

---

## Prerequisites

Before running the project, ensure you have:

- Java 17 or newer
- Maven
- MySQL Server installed and running
- A MySQL database named `hrms`

---

## Database Setup

Create the database in MySQL:

```sql
CREATE DATABASE hrms;
```

Update your database credentials in `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/hrms
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

The project uses Flyway, so the tables will be created automatically from migration files:

- `V1__create_departments.sql`
- `V2__create_employees.sql`

---

## Application Configuration

The app is configured with:

```properties
spring.application.name=hrms
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
```

This means:

- Hibernate validates the schema instead of creating tables automatically
- Flyway handles schema creation through migration scripts
- SQL logs are visible in the console

---

## Security

The current security configuration is:

- All requests under `/api/**` require authentication
- Other routes are open to public access
- HTTP Basic Authentication is enabled
- CSRF is disabled for API use

Important note:

This app does not currently define custom users. Spring Boot will create a default user when the application starts, and the generated password will appear in the console logs.

Typical login pattern:

```text
Username: user
Password: <generated-password-from-console>
```

You can use this username/password in Postman, browser dev tools, or a frontend application while calling API endpoints.

---

## Run the Application

From the project root:

```bash
./mvnw spring-boot:run
```

On Windows PowerShell:

```powershell
mvnw.cmd spring-boot:run
```

The backend will run on:

```text
http://localhost:8080
```

---

## API Endpoints

### Department APIs

Base URL:

```text
http://localhost:8080/api/departments
```

#### Get all departments

```http
GET /api/departments
Authorization: Basic <base64(username:password)>
```

#### Create department

```http
POST /api/departments
Content-Type: application/json
Authorization: Basic <base64(username:password)>
```

Example body:

```json
{
  "name": "Engineering",
  "description": "Software development department"
}
```

---

### Employee APIs

Base URL:

```text
http://localhost:8080/api/employees
```

#### Get all employees

```http
GET /api/employees
Authorization: Basic <base64(username:password)>
```

#### Create employee

```http
POST /api/employees
Content-Type: application/json
Authorization: Basic <base64(username:password)>
```

Example body:

```json
{
  "department": {
    "id": 1
  },
  "employeeCode": "EMP-1001",
  "firstName": "Abhishek",
  "lastName": "Kumar",
  "email": "abhishek@example.com",
  "phone": "+91-9876543210",
  "dateOfJoining": "2025-01-15",
  "jobTitle": "Senior Developer",
  "salary": 850000.00,
  "status": "ACTIVE"
}
```

---

## Frontend Connection Guide

This repository is a backend API project. To connect a frontend, use the backend base URL:

```text
http://localhost:8080
```

### 1. Frontend API base URL

```js
const API_BASE_URL = 'http://localhost:8080';
```

### 2. Basic authentication

Because the app uses HTTP Basic auth, your frontend must send credentials for every protected API call.

Example JavaScript fetch:

```js
const username = 'user';
const password = 'your-generated-password';

const response = await fetch('http://localhost:8080/api/departments', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa(`${username}:${password}`)
  }
});

const data = await response.json();
console.log(data);
```

### 3. Create a department from frontend

```js
const username = 'user';
const password = 'your-generated-password';

const department = {
  name: 'Finance',
  description: 'Financial and accounting operations'
};

const response = await fetch('http://localhost:8080/api/departments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa(`${username}:${password}`)
  },
  body: JSON.stringify(department)
});

const result = await response.json();
console.log(result);
```

### 4. Create an employee from frontend

```js
const employee = {
  department: { id: 1 },
  employeeCode: 'EMP-2002',
  firstName: 'Priya',
  lastName: 'Sharma',
  email: 'priya@example.com',
  phone: '+91-9988776655',
  dateOfJoining: '2024-06-01',
  jobTitle: 'HR Specialist',
  salary: 650000.00,
  status: 'ACTIVE'
};

const response = await fetch('http://localhost:8080/api/employees', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa(`${username}:${password}`)
  },
  body: JSON.stringify(employee)
});

const createdEmployee = await response.json();
console.log(createdEmployee);
```

### 5. CORS note

This project does not currently configure CORS. If your frontend is running on a different port or domain, you may receive browser CORS errors.

To fix this, either:

- host frontend and backend under the same origin, or
- configure CORS in the backend

Example CORS configuration for Spring Boot:

```java
@Bean
public WebMvcConfigurer corsConfigurer() {
    return new WebMvcConfigurer() {
        @Override
        public void addCorsMappings(CorsRegistry registry) {
            registry.addMapping("/**")
                    .allowedOrigins("http://localhost:3000")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
        }
    };
}
```

If your frontend is a Vite app, a common proxy setup is:

```js
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
```

Then your frontend can call relative URLs like:

```js
fetch('/api/departments')
```

---

## Database Structure

### departments

```sql
CREATE TABLE departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### employees

```sql
CREATE TABLE employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    department_id BIGINT NOT NULL,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20),
    date_of_joining DATE NOT NULL,
    job_title VARCHAR(100),
    salary DECIMAL(12,2),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_employee_department
        FOREIGN KEY (department_id)
        REFERENCES departments(id)
);
```

---

## Notes

- This repository is a backend-first project.
- There is no frontend UI included in this repo.
- Authentication is currently basic and generated by Spring Boot.
- The app is ready to be connected to React, Angular, Vue, or any other frontend.
- The backend is suitable for CRUD operations on departments and employees.

---

## Quick Start

```bash
# 1. Create MySQL database
mysql -u root -p -e "CREATE DATABASE hrms;"

# 2. Start the app
./mvnw spring-boot:run
```

Then open the API with your frontend or browser tools and use the autogenerated Spring Boot credentials from the console.

---

## Useful Links

- Spring Boot: https://spring.io/projects/spring-boot
- Spring Security: https://spring.io/projects/spring-security
- MySQL: https://www.mysql.com/
- Flyway: https://flywaydb.org/
