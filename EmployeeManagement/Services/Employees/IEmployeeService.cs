using EmployeeManagement.DTOs;

namespace EmployeeManagement.Services.Employees;

public interface IEmployeeService
{
    Task<EmployeeReadDto> AddEmployeeAsync(EmployeeCreateDto employeeCreateDto, CancellationToken cancellationToken = default);

    Task<PagedResult<EmployeeReadDto>> RetrieveEmployeesAsync(
        string? searchTerm,
        int pageNumber,
        int pageSize,
        string? sortBy = null,
        string? sortDirection = null,
        CancellationToken cancellationToken = default);

    Task DeleteEmployeeByIdAsync(int employeeId, CancellationToken cancellationToken = default);

    Task<EmployeeReadDto> ToggleEmployeeActiveStatusAsync(
        int employeeId,
        CancellationToken cancellationToken = default);
}
