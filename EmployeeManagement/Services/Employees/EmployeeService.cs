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
        CancellationToken cancellationToken = default)
    {
        try
        {
            IQueryable<Employee> employeeQuery = storageBroker
                .SelectAllEmployees()
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                employeeQuery = employeeQuery.Where(employee =>
                    employee.FullName.Contains(searchTerm));
            }

            int totalCount = await employeeQuery.CountAsync(cancellationToken);

            List<Employee> employees = await employeeQuery
                .OrderBy(employee => employee.FullName)
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

            if (employee is null)
            {
                throw new KeyNotFoundException($"Employee with id {employeeId} was not found.");
            }

            await storageBroker.DeleteEmployeeAsync(employee);
        }
        catch (Exception exception)
        {
            await fileLoggingBroker.LogErrorAsync(exception, cancellationToken);
            throw;
        }
    }
}
