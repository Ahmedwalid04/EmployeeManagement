import { useEffect, useMemo, useState } from 'react'

import {
  createEmployee,
  deleteEmployee as removeEmployee,
  getDepartments,
  getEmployees,
} from './services/employeeApi'
import type { Department, Employee, EmployeeCreate } from './types/models'

const pageSize = 10

interface EmployeeFormValues {
  fullName: string
  email: string
  phone: string
  hireDate: string
  salary: string
  department: string
  isActive: boolean
}

interface EmployeeFormErrors {
  fullName?: string
  email?: string
  phone?: string
  hireDate?: string
  salary?: string
  department?: string
}

const initialEmployeeForm: EmployeeFormValues = {
  fullName: '',
  email: '',
  phone: '',
  hireDate: '',
  salary: '',
  department: '',
  isActive: true,
}

function App() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [pageNumber, setPageNumber] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [showEmployeeForm, setShowEmployeeForm] = useState(false)
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false)
  const [isSubmittingEmployee, setIsSubmittingEmployee] = useState(false)
  const [deletingEmployeeId, setDeletingEmployeeId] = useState<number | null>(null)
  const [loadErrorMessage, setLoadErrorMessage] = useState('')
  const [formErrorMessage, setFormErrorMessage] = useState('')
  const [employeeForm, setEmployeeForm] = useState<EmployeeFormValues>(initialEmployeeForm)
  const [employeeFormErrors, setEmployeeFormErrors] = useState<EmployeeFormErrors>({})

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / pageSize)),
    [totalCount],
  )

  const resultsLabel = useMemo(() => {
    if (totalCount === 0) {
      return 'No employees found'
    }

    const startRecord = (pageNumber - 1) * pageSize + 1
    const endRecord = Math.min(pageNumber * pageSize, totalCount)

    return `Showing ${startRecord}-${endRecord} of ${totalCount} employees`
  }, [pageNumber, totalCount])

  useEffect(() => {
    void loadDepartments()
    void loadEmployees(1, '')
  }, [])

  async function loadDepartments() {
    setIsLoadingDepartments(true)
    setFormErrorMessage('')

    try {
      const departmentsResponse = await getDepartments()
      setDepartments(departmentsResponse)
    } catch {
      setFormErrorMessage('Unable to load departments right now.')
    } finally {
      setIsLoadingDepartments(false)
    }
  }

  async function loadEmployees(nextPageNumber = pageNumber, nextSearchTerm = searchTerm) {
    setIsLoadingEmployees(true)
    setLoadErrorMessage('')

    const term = nextSearchTerm?.trim() ?? ''

    try {
      const employeesResponse = await getEmployees(term, nextPageNumber, pageSize)
      setEmployees(employeesResponse.items)
      setPageNumber(employeesResponse.pageNumber)
      setTotalCount(employeesResponse.totalCount)
    } catch {
      setLoadErrorMessage('Unable to load employees right now.')
    } finally {
      setIsLoadingEmployees(false)
    }
  }

  function searchEmployees(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextPageNumber = 1
    setPageNumber(nextPageNumber)
    void loadEmployees(nextPageNumber, searchTerm)
  }

  function clearSearch() {
    const clearedSearchTerm = ''
    const nextPageNumber = 1
    setSearchTerm(clearedSearchTerm)
    setPageNumber(nextPageNumber)
    void loadEmployees(nextPageNumber, clearedSearchTerm)
  }

  function goToPreviousPage() {
    if (pageNumber <= 1) {
      return
    }

    const nextPageNumber = pageNumber - 1
    setPageNumber(nextPageNumber)
    void loadEmployees(nextPageNumber, searchTerm)
  }

  function goToNextPage() {
    if (pageNumber >= totalPages) {
      return
    }

    const nextPageNumber = pageNumber + 1
    setPageNumber(nextPageNumber)
    void loadEmployees(nextPageNumber, searchTerm)
  }

  function updateEmployeeForm<Key extends keyof EmployeeFormValues>(
    key: Key,
    value: EmployeeFormValues[Key],
  ) {
    setEmployeeForm((current) => ({
      ...current,
      [key]: value,
    }))

    setEmployeeFormErrors((current) => ({
      ...current,
      [key]: undefined,
    }))
  }

  function validateEmployeeForm(values: EmployeeFormValues): EmployeeFormErrors {
    const errors: EmployeeFormErrors = {}

    if (!values.fullName.trim()) {
      errors.fullName = 'This field is required.'
    }

    if (!values.email.trim()) {
      errors.email = 'This field is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = 'Enter a valid email address.'
    }

    if (!values.phone.trim()) {
      errors.phone = 'This field is required.'
    }

    if (!values.hireDate) {
      errors.hireDate = 'This field is required.'
    }

    if (!values.salary) {
      errors.salary = 'This field is required.'
    } else if (Number(values.salary) < 0) {
      errors.salary = 'Value must be 0 or greater.'
    }

    if (!values.department) {
      errors.department = 'This field is required.'
    }

    return errors
  }

  async function submitEmployee(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationErrors = validateEmployeeForm(employeeForm)

    if (Object.keys(validationErrors).length > 0) {
      setEmployeeFormErrors(validationErrors)
      return
    }

    setIsSubmittingEmployee(true)
    setFormErrorMessage('')

    const employeePayload: EmployeeCreate = {
      fullName: employeeForm.fullName.trim(),
      email: employeeForm.email.trim(),
      phone: employeeForm.phone.trim(),
      hireDate: employeeForm.hireDate,
      salary: Number(employeeForm.salary),
      department: Number(employeeForm.department),
      isActive: employeeForm.isActive,
    }

    try {
      await createEmployee(employeePayload)
      setEmployeeForm(initialEmployeeForm)
      setEmployeeFormErrors({})
      setSearchTerm('')
      setPageNumber(1)
      setShowEmployeeForm(false)
      await loadEmployees(1, '')
    } catch {
      setFormErrorMessage('Unable to add the employee right now.')
    } finally {
      setIsSubmittingEmployee(false)
    }
  }

  async function handleDeleteEmployee(employeeId: number) {
    setDeletingEmployeeId(employeeId)
    setLoadErrorMessage('')

    try {
      await removeEmployee(employeeId)
      const deletedLastRowOnPage = employees.length === 1 && pageNumber > 1
      const nextPageNumber = deletedLastRowOnPage ? pageNumber - 1 : pageNumber
      setPageNumber(nextPageNumber)
      await loadEmployees(nextPageNumber, searchTerm)
    } catch {
      setLoadErrorMessage('Unable to delete the employee right now.')
    } finally {
      setDeletingEmployeeId(null)
    }
  }

  function getDepartmentName(departmentValue: number) {
    return departments.find((department) => department.value === departmentValue)?.name ?? 'Unknown'
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-[2rem] border border-[var(--border)] bg-[color:rgb(23_25_27_/_0.92)] p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.75)] backdrop-blur">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
                Employee Management
              </p>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="font-['Trebuchet_MS','Gill_Sans',sans-serif] text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">
                    Workforce records without the clutter
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)] sm:text-base">
                    Add employees, search the directory, and manage records from one clean
                    dashboard.
                  </p>
                </div>
                <div className="rounded-2xl border border-[color:rgb(232_220_196_/_0.16)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--accent)]">
                  {resultsLabel}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--bg)] transition hover:bg-[var(--accent-hover)]"
                onClick={() => setShowEmployeeForm((current) => !current)}
              >
                {showEmployeeForm ? 'Hide Form' : 'Add Employee'}
              </button>

              <form
                className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-xl"
                onSubmit={searchEmployees}
              >
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search employees by name"
                  className="w-full rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text)] shadow-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--bg)] transition hover:bg-[var(--accent-hover)]"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--nardo-light)] hover:bg-[var(--surface-2)]"
                    onClick={clearSearch}
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>
          </div>
        </header>

        {showEmployeeForm ? (
          <section className="mb-6 rounded-[2rem] border border-[var(--border)] bg-[color:rgb(23_25_27_/_0.92)] p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.75)] backdrop-blur">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-['Trebuchet_MS','Gill_Sans',sans-serif] text-2xl font-bold text-[var(--text)]">
                  Add Employee
                </h2>
                <p className="text-sm text-[var(--text-muted)]">
                  Complete the required details to create a new employee record.
                </p>
              </div>
              {isLoadingDepartments ? (
                <span className="text-sm font-medium text-[var(--text-muted)]">
                  Loading departments...
                </span>
              ) : null}
            </div>

            {formErrorMessage ? (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {formErrorMessage}
              </div>
            ) : null}

            <form className="space-y-5" onSubmit={submitEmployee}>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--text)]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={employeeForm.fullName}
                    onChange={(event) => updateEmployeeForm('fullName', event.target.value)}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
                  />
                  {employeeFormErrors.fullName ? (
                    <p className="mt-2 text-xs font-medium text-rose-600">
                      {employeeFormErrors.fullName}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--text)]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={employeeForm.email}
                    onChange={(event) => updateEmployeeForm('email', event.target.value)}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
                  />
                  {employeeFormErrors.email ? (
                    <p className="mt-2 text-xs font-medium text-rose-600">
                      {employeeFormErrors.email}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--text)]">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={employeeForm.phone}
                    onChange={(event) => updateEmployeeForm('phone', event.target.value)}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
                  />
                  {employeeFormErrors.phone ? (
                    <p className="mt-2 text-xs font-medium text-rose-600">
                      {employeeFormErrors.phone}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--text)]">
                    Hire Date
                  </label>
                  <input
                    type="date"
                    value={employeeForm.hireDate}
                    onChange={(event) => updateEmployeeForm('hireDate', event.target.value)}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
                  />
                  {employeeFormErrors.hireDate ? (
                    <p className="mt-2 text-xs font-medium text-rose-600">
                      {employeeFormErrors.hireDate}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--text)]">
                    Salary
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={employeeForm.salary}
                    onChange={(event) => updateEmployeeForm('salary', event.target.value)}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
                  />
                  {employeeFormErrors.salary ? (
                    <p className="mt-2 text-xs font-medium text-rose-600">
                      {employeeFormErrors.salary}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--text)]">
                    Department
                  </label>
                  <select
                    value={employeeForm.department}
                    onChange={(event) => updateEmployeeForm('department', event.target.value)}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
                  >
                    <option value="">Select department</option>
                    {departments.map((department) => (
                      <option key={department.value} value={department.value}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                  {employeeFormErrors.department ? (
                    <p className="mt-2 text-xs font-medium text-rose-600">
                      {employeeFormErrors.department}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-end">
                  <label className="inline-flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm font-medium text-[var(--text)]">
                    <input
                      type="checkbox"
                      checked={employeeForm.isActive}
                      onChange={(event) => updateEmployeeForm('isActive', event.target.checked)}
                      className="h-4 w-4 rounded border-[var(--border)] accent-[var(--accent)]"
                    />
                    Active employee
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isSubmittingEmployee || isLoadingDepartments}
                  className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--bg)] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:bg-[var(--nardo-light)]"
                >
                  {isSubmittingEmployee ? 'Saving...' : 'Save Employee'}
                </button>
                <button
                  type="button"
                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--nardo-light)] hover:bg-[var(--surface-2)]"
                  onClick={() => setShowEmployeeForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        ) : null}

        <section className="flex-1 rounded-[2rem] border border-[var(--border)] bg-[color:rgb(23_25_27_/_0.95)] p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.75)] backdrop-blur">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-['Trebuchet_MS','Gill_Sans',sans-serif] text-2xl font-bold text-[var(--text)]">
                Employee Directory
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                Review current records and remove entries when needed.
              </p>
            </div>
            {isLoadingEmployees ? (
              <span className="text-sm font-medium text-[var(--text-muted)]">
                Loading employees...
              </span>
            ) : null}
          </div>

          {loadErrorMessage ? (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {loadErrorMessage}
            </div>
          ) : null}

          <div className="overflow-hidden rounded-3xl border border-[var(--border)]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--border)]">
                <thead className="bg-[var(--surface-2)] text-left text-xs font-semibold uppercase tracking-[0.2em] text-[var(--nardo-light)]">
                  <tr>
                    <th className="px-5 py-4">Employee</th>
                    <th className="px-5 py-4">Department</th>
                    <th className="px-5 py-4">Hire Date</th>
                    <th className="px-5 py-4">Salary</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text-muted)]">
                  {employees.length > 0 ? (
                    employees.map((employee) => (
                      <tr
                        key={employee.id}
                        className="transition hover:bg-[color:rgb(104_106_108_/_0.10)]"
                      >
                        <td className="px-5 py-4 align-top">
                          <div className="font-semibold text-[var(--text)]">
                            {employee.fullName}
                          </div>
                          <div className="mt-1 text-xs text-[var(--text-muted)]">
                            {employee.email}
                          </div>
                          <div className="mt-1 text-xs text-[var(--text-muted)]">
                            {employee.phone}
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span className="inline-flex rounded-full bg-[color:rgb(104_106_108_/_0.18)] px-3 py-1 text-xs font-semibold text-[var(--nardo-light)]">
                            {getDepartmentName(employee.department)}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-top">
                          {new Date(employee.hireDate).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 align-top">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(employee.salary)}
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              employee.isActive
                                ? 'bg-[color:rgb(232_220_196_/_0.18)] text-[var(--accent)]'
                                : 'bg-[color:rgb(104_106_108_/_0.16)] text-[var(--nardo-light)]'
                            }`}
                          >
                            {employee.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right align-top">
                          <button
                            type="button"
                            className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={deletingEmployeeId === employee.id}
                            onClick={() => void handleDeleteEmployee(employee.id)}
                          >
                            {deletingEmployeeId === employee.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-12 text-center text-sm text-[var(--text-muted)]"
                      >
                        No employees match the current search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--text-muted)]">{resultsLabel}</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={pageNumber <= 1}
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--nardo-light)] hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-40"
                onClick={goToPreviousPage}
              >
                Previous
              </button>
              <div className="rounded-full bg-[var(--surface-2)] px-4 py-2 text-sm font-semibold text-[var(--text)]">
                Page {pageNumber} of {totalPages}
              </div>
              <button
                type="button"
                disabled={pageNumber >= totalPages}
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--nardo-light)] hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-40"
                onClick={goToNextPage}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
