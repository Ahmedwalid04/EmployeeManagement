import type { Department, Employee, EmployeeCreate, PagedResult } from '../types/models'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5114'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export async function getEmployees(
  searchTerm: string,
  pageNumber: number,
  pageSize: number,
): Promise<PagedResult<Employee>> {
  const term = searchTerm?.trim() ?? ''
  const params = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
  })

  if (term.length > 0) {
    params.set('searchTerm', term)
  }

  return request<PagedResult<Employee>>(`/api/Employees?${params.toString()}`)
}

export async function createEmployee(employee: EmployeeCreate): Promise<Employee> {
  return request<Employee>('/api/Employees', {
    method: 'POST',
    body: JSON.stringify(employee),
  })
}

export async function deleteEmployee(employeeId: number): Promise<void> {
  await request<void>(`/api/Employees/${employeeId}`, {
    method: 'DELETE',
  })
}

export async function getDepartments(): Promise<Department[]> {
  return request<Department[]>('/api/Departments')
}
