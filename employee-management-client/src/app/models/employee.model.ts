export interface Employee {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  hireDate: string;
  salary: number;
  department: number;
  isActive: boolean;
}

export interface CreateEmployeeRequest {
  fullName: string;
  email: string;
  phone: string;
  hireDate: string;
  salary: number;
  department: number;
  isActive: boolean;
}
