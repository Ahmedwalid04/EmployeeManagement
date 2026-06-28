export interface Employee {
  id: number
  fullName: string
  email: string
  phone: string
  hireDate: string
  salary: number
  department: number
  isActive: boolean
}

export interface EmployeeCreate {
  fullName: string
  email: string
  phone: string
  hireDate: string
  salary: number
  department: number
  isActive: boolean
}

export interface Department {
  value: number
  name: string
}

export interface PagedResult<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalCount: number
}

export type EmployeeSortBy =
  | 'fullName'
  | 'email'
  | 'hireDate'
  | 'salary'
  | 'department'
  | 'isActive'

export type SortDirection = 'asc' | 'desc'
