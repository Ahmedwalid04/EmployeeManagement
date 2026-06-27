using EmployeeManagement.DTOs;

namespace EmployeeManagement.Services.Employees;

public interface IEmployeeService
{
    Task<EmployeeReadDto> AddEmployeeAsync(EmployeeCreateDto employeeCreateDto, CancellationToken cancellationToken = default);

    Task<PagedResult<EmployeeReadDto>> RetrieveEmployeesAsync(
        string? searchTerm,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);

    Task DeleteEmployeeByIdAsync(int employeeId, CancellationToken cancellationToken = default);
}
