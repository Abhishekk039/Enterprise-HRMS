import type {
  AuthResponse,
  Department,
  Employee,
  LeaveRequest,
  Attendance,
  Payroll,
  PerformanceReview,
  PagedResponse
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('hrms_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Error ${res.status}: ${res.statusText}`;
    try {
      const errJson = await res.json();
      errorMsg = errJson.message || errJson.error || errorMsg;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }
  if (res.status === 204) {
    return {} as T;
  }
  return res.json();
}

export const api = {
  // Auth
  async login(credentials: { usernameOrEmail: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse<AuthResponse>(res);
  },

  async register(data: any): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(res);
  },

  async getMe(): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<AuthResponse>(res);
  },

  // Departments
  async getDepartments(params?: { page?: number; size?: number; search?: string }): Promise<PagedResponse<Department>> {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.set('page', params.page.toString());
    if (params?.size !== undefined) query.set('size', params.size.toString());
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`${API_BASE}/departments?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<PagedResponse<Department>>(res);
  },

  async getAllDepartments(): Promise<Department[]> {
    const res = await fetch(`${API_BASE}/departments/all`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Department[]>(res);
  },

  async createDepartment(data: { name: string; description?: string }): Promise<Department> {
    const res = await fetch(`${API_BASE}/departments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Department>(res);
  },

  async deleteDepartment(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/departments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(res);
  },

  // Employees
  async getEmployees(params?: {
    page?: number;
    size?: number;
    search?: string;
    departmentId?: number;
    status?: string;
  }): Promise<PagedResponse<Employee>> {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.set('page', params.page.toString());
    if (params?.size !== undefined) query.set('size', params.size.toString());
    if (params?.search) query.set('search', params.search);
    if (params?.departmentId) query.set('departmentId', params.departmentId.toString());
    if (params?.status) query.set('status', params.status);

    const res = await fetch(`${API_BASE}/employees?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<PagedResponse<Employee>>(res);
  },

  async getAllEmployees(): Promise<Employee[]> {
    const res = await fetch(`${API_BASE}/employees/all`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Employee[]>(res);
  },

  async getEmployee(id: number): Promise<Employee> {
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Employee>(res);
  },

  async createEmployee(data: any): Promise<Employee> {
    const res = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Employee>(res);
  },

  async updateEmployee(id: number, data: any): Promise<Employee> {
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Employee>(res);
  },

  async deleteEmployee(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(res);
  },

  // Leaves
  async getLeaves(params?: {
    page?: number;
    size?: number;
    status?: string;
    employeeId?: number;
  }): Promise<PagedResponse<LeaveRequest>> {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.set('page', params.page.toString());
    if (params?.size !== undefined) query.set('size', params.size.toString());
    if (params?.status && params.status !== 'ALL' && params.status.trim() !== '') {
      query.set('status', params.status);
    }
    if (params?.employeeId) query.set('employeeId', params.employeeId.toString());

    const res = await fetch(`${API_BASE}/leaves?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<PagedResponse<LeaveRequest>>(res);
  },

  async applyLeave(data: {
    employeeId: number;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason?: string;
  }): Promise<LeaveRequest> {
    const res = await fetch(`${API_BASE}/leaves`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<LeaveRequest>(res);
  },

  async updateLeaveStatus(id: number, status: 'APPROVED' | 'REJECTED', rejectionReason?: string): Promise<LeaveRequest> {
    const res = await fetch(`${API_BASE}/leaves/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, rejectionReason }),
    });
    return handleResponse<LeaveRequest>(res);
  },

  async cancelLeave(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/leaves/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(res);
  },

  // Attendance
  async getAttendances(params?: {
    page?: number;
    size?: number;
    date?: string;
    employeeId?: number;
  }): Promise<PagedResponse<Attendance>> {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.set('page', params.page.toString());
    if (params?.size !== undefined) query.set('size', params.size.toString());
    if (params?.date) query.set('date', params.date);
    if (params?.employeeId) query.set('employeeId', params.employeeId.toString());

    const res = await fetch(`${API_BASE}/attendances?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<PagedResponse<Attendance>>(res);
  },

  async checkIn(employeeId: number, notes?: string): Promise<Attendance> {
    const res = await fetch(`${API_BASE}/attendances/check-in`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ employeeId, notes }),
    });
    return handleResponse<Attendance>(res);
  },

  async checkOut(employeeId: number, notes?: string): Promise<Attendance> {
    const res = await fetch(`${API_BASE}/attendances/check-out`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ employeeId, notes }),
    });
    return handleResponse<Attendance>(res);
  },

  async getTodayAttendance(employeeId: number): Promise<Attendance | null> {
    const res = await fetch(`${API_BASE}/attendances/today/${employeeId}`, {
      headers: getAuthHeaders(),
    });
    if (res.status === 204) return null;
    return handleResponse<Attendance>(res);
  },

  // Payroll
  async getPayrolls(params?: {
    page?: number;
    size?: number;
    year?: number;
    month?: number;
    status?: string;
  }): Promise<PagedResponse<Payroll>> {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.set('page', params.page.toString());
    if (params?.size !== undefined) query.set('size', params.size.toString());
    if (params?.year) query.set('year', params.year.toString());
    if (params?.month) query.set('month', params.month.toString());
    if (params?.status && params.status !== 'ALL' && params.status.trim() !== '') {
      query.set('status', params.status);
    }

    const res = await fetch(`${API_BASE}/payrolls?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<PagedResponse<Payroll>>(res);
  },

  async generatePayroll(data: {
    employeeId: number;
    payPeriodMonth: number;
    payPeriodYear: number;
    allowances?: number;
    deductions?: number;
    paymentMethod?: string;
    notes?: string;
  }): Promise<Payroll> {
    const res = await fetch(`${API_BASE}/payrolls/generate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Payroll>(res);
  },

  async updatePayrollStatus(id: number, paymentStatus: 'PENDING' | 'PROCESSED' | 'PAID', paymentMethod?: string): Promise<Payroll> {
    const res = await fetch(`${API_BASE}/payrolls/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ paymentStatus, paymentMethod }),
    });
    return handleResponse<Payroll>(res);
  },

  // Performance Reviews
  async getReviews(params?: {
    page?: number;
    size?: number;
    employeeId?: number;
    rating?: number;
  }): Promise<PagedResponse<PerformanceReview>> {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.set('page', params.page.toString());
    if (params?.size !== undefined) query.set('size', params.size.toString());
    if (params?.employeeId) query.set('employeeId', params.employeeId.toString());
    if (params?.rating) query.set('rating', params.rating.toString());

    const res = await fetch(`${API_BASE}/performance-reviews?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<PagedResponse<PerformanceReview>>(res);
  },

  async createReview(data: {
    employeeId: number;
    reviewPeriod: string;
    rating: number;
    feedback: string;
    goals?: string;
  }): Promise<PerformanceReview> {
    const res = await fetch(`${API_BASE}/performance-reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<PerformanceReview>(res);
  },

  async acknowledgeReview(id: number): Promise<PerformanceReview> {
    const res = await fetch(`${API_BASE}/performance-reviews/${id}/acknowledge`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse<PerformanceReview>(res);
  },
};
