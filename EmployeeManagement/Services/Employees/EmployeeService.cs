using AutoMapper;
using EmployeeManagement.Brokers.FileLoggingBroker;
using EmployeeManagement.Brokers.StorageBroker;
using EmployeeManagement.DTOs;
using EmployeeManagement.Models;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.Services.Employees;

public class EmployeeService(
    IStorageBroker storageBroker,
    IFileLoggingBroker fileLoggingBroker,
    IMapper mapper) : IEmployeeService
{
    public async Task<EmployeeReadDto> AddEmployeeAsync(
        EmployeeCreateDto employeeCreateDto,
        CancellationToken cancellationToken = default)
    {
        try
        {
            Employee employee = mapper.Map<Employee>(employeeCreateDto);

            await storageBroker.InsertEmployeeAsync(employee);

            return mapper.Map<EmployeeReadDto>(employee);
        }
        catch (Exception exception)
        {
            await fileLoggingBroker.LogErrorAsync(exception, cancellationToken);
            throw;
        }
    }

    public async Task<PagedResult<EmployeeReadDto>> RetrieveEmployeesAsync(
        string? searchTerm,
        int pageNumber,
        int pageSize,
        string? sortBy = null,
        string? sortDirection = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            IQueryable<Employee> employeeQuery = storageBroker
                .SelectAllEmployees()
                .AsNoTracking()
                .Where(employee => employee.IsDeleted == false);

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                employeeQuery = employeeQuery.Where(employee =>
                    employee.FullName.Contains(searchTerm));
            }

            employeeQuery = ApplySorting(employeeQuery, sortBy, sortDirection);

            int totalCount = await employeeQuery.CountAsync(cancellationToken);

            List<Employee> employees = await employeeQuery
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return new PagedResult<EmployeeReadDto>
            {
                Items = mapper.Map<List<EmployeeReadDto>>(employees),
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount
            };
        }
        catch (Exception exception)
        {
            await fileLoggingBroker.LogErrorAsync(exception, cancellationToken);
            throw;
        }
    }

    public async Task DeleteEmployeeByIdAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        try
        {
            Employee? employee = await storageBroker.SelectEmployeeByIdAsync(employeeId);

            if (employee is null || employee.IsDeleted)
            {
                throw new KeyNotFoundException($"Employee with id {employeeId} was not found.");
            }

            employee.IsDeleted = true;
            await storageBroker.UpdateEmployeeAsync(employee);
        }
        catch (Exception exception)
        {
            await fileLoggingBroker.LogErrorAsync(exception, cancellationToken);
            throw;
        }
    }

    public async Task<EmployeeReadDto> ToggleEmployeeActiveStatusAsync(
        int employeeId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            Employee? employee = await storageBroker.SelectEmployeeByIdAsync(employeeId);

            if (employee is null || employee.IsDeleted)
            {
                throw new KeyNotFoundException($"Employee with id {employeeId} was not found.");
            }

            employee.IsActive = !employee.IsActive;

            Employee updatedEmployee = await storageBroker.UpdateEmployeeAsync(employee);

            return mapper.Map<EmployeeReadDto>(updatedEmployee);
        }
        catch (Exception exception)
        {
            await fileLoggingBroker.LogErrorAsync(exception, cancellationToken);
            throw;
        }
    }

    private static IQueryable<Employee> ApplySorting(
        IQueryable<Employee> employeeQuery,
        string? sortBy,
        string? sortDirection)
    {
        bool sortDescending = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);

        return sortBy?.Trim().ToLowerInvariant() switch
        {
            "fullname" => sortDescending
                ? employeeQuery.OrderByDescending(employee => employee.FullName).ThenByDescending(employee => employee.Id)
                : employeeQuery.OrderBy(employee => employee.FullName).ThenBy(employee => employee.Id),
            "email" => sortDescending
                ? employeeQuery.OrderByDescending(employee => employee.Email).ThenByDescending(employee => employee.Id)
                : employeeQuery.OrderBy(employee => employee.Email).ThenBy(employee => employee.Id),
            "hiredate" => sortDescending
                ? employeeQuery.OrderByDescending(employee => employee.HireDate).ThenByDescending(employee => employee.Id)
                : employeeQuery.OrderBy(employee => employee.HireDate).ThenBy(employee => employee.Id),
            "salary" => sortDescending
                ? employeeQuery.OrderByDescending(employee => employee.Salary).ThenByDescending(employee => employee.Id)
                : employeeQuery.OrderBy(employee => employee.Salary).ThenBy(employee => employee.Id),
            "department" => sortDescending
                ? employeeQuery.OrderByDescending(employee => employee.Department).ThenByDescending(employee => employee.Id)
                : employeeQuery.OrderBy(employee => employee.Department).ThenBy(employee => employee.Id),
            "isactive" => sortDescending
                ? employeeQuery.OrderByDescending(employee => employee.IsActive).ThenByDescending(employee => employee.Id)
                : employeeQuery.OrderBy(employee => employee.IsActive).ThenBy(employee => employee.Id),
            _ => employeeQuery.OrderByDescending(employee => employee.Id)
        };
    }
}
