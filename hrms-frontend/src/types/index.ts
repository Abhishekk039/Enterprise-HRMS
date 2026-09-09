export interface User {
  id: number;
  username: string;
  email: string;
  role: 'ROLE_ADMIN' | 'ROLE_HR' | 'ROLE_MANAGER' | 'ROLE_EMPLOYEE';
  employeeId?: number;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  id: number;
  username: string;
  email: string;
  role: 'ROLE_ADMIN' | 'ROLE_HR' | 'ROLE_MANAGER' | 'ROLE_EMPLOYEE';
  employeeId?: number;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Employee {
  id: number;
  departmentId: number;
  departmentName: string;
  employeeCode: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  dateOfJoining: string;
  jobTitle?: string;
  salary?: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  departmentName?: string;
  leaveType: 'SICK_LEAVE' | 'CASUAL_LEAVE' | 'ANNUAL_LEAVE' | 'MATERNITY_LEAVE' | 'PATERNITY_LEAVE' | 'UNPAID_LEAVE';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  rejectionReason?: string;
  reviewedByUsername?: string;
  reviewedAt?: string;
  createdAt?: string;
}

export interface Attendance {
  id: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  departmentName?: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  workHours?: number;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'ON_LEAVE';
  notes?: string;
}

export interface Payroll {
  id: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  departmentName?: string;
  payPeriodMonth: number;
  payPeriodYear: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paymentStatus: 'PENDING' | 'PROCESSED' | 'PAID';
  paymentDate?: string;
  paymentMethod?: 'BANK_TRANSFER' | 'CHECK' | 'CASH' | 'DIRECT_DEPOSIT';
  notes?: string;
  createdAt?: string;
}

export interface PerformanceReview {
  id: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  departmentName?: string;
  reviewerId: number;
  reviewerUsername: string;
  reviewPeriod: string;
  rating: number;
  feedback: string;
  goals?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'ACKNOWLEDGED';
  createdAt?: string;
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
