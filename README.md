# Employee Management System

Employee Management System built with ASP.NET Core Web API, EF Core, SQL Server, AutoMapper, Scalar, and a React + TypeScript + Tailwind frontend. React was approved by the company as a replacement for Angular.

## Features

### Required
- Employee CRUD flow for add, list/search, and delete
- Department dropdown loaded from backend
- Search by employee name
- Pagination
- Scalar API explorer
- File-based exception logging to `EmployeeManagement/Logs/errors.txt`

### Bonus
- Sorting by full name, email, hire date, salary, department, and active status
- Soft delete with `IsDeleted`
- Toggle active/inactive endpoint and UI
- Add employee modal

## Tech Stack

- Backend: ASP.NET Core Web API, EF Core, SQL Server, AutoMapper, Scalar
- Frontend: React, TypeScript, Vite, Tailwind CSS
- Architecture: Broker -> Service -> Controller

## Backend Setup

1. Update the connection string in `EmployeeManagement/appsettings.json` and `EmployeeManagement/appsettings.Development.json` if your local SQL Server instance differs from:

```json
"DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=EmployeeManagementDb;Trusted_Connection=True;TrustServerCertificate=True"
```

2. Restore the local EF Core tool:

```powershell
dotnet tool restore
```

3. Apply the database migrations:

```powershell
dotnet ef database update --project EmployeeManagement/EmployeeManagement.csproj --startup-project EmployeeManagement/EmployeeManagement.csproj
```

4. Run the backend:

```powershell
dotnet run --project EmployeeManagement/EmployeeManagement.csproj
```

5. Open Scalar:

```text
https://localhost:7168/scalar/v1
```

The exact backend URL may differ based on your local launch profile.

## Frontend Setup

1. Install dependencies:

```powershell
cd employee-management-client
npm install
```

2. If needed, update the API base URL in `employee-management-client/.env` or `employee-management-client/src/services/employeeApi.ts`. The current fallback URL is:

```text
http://localhost:5114
```

3. Start the frontend:

```powershell
npm run dev
```

4. Open:

```text
http://localhost:5173
```

## Build Commands

Backend:

```powershell
dotnet build EmployeeManagement.slnx
```

Frontend:

```powershell
cd employee-management-client
npm run build
```
