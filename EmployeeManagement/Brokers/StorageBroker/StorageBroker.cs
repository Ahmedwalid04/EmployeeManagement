using EmployeeManagement.Data;
using EmployeeManagement.Models;

namespace EmployeeManagement.Brokers.StorageBroker;

public class StorageBroker(AppDbContext appDbContext) : IStorageBroker
{
    public IQueryable<Employee> SelectAllEmployees() =>
        appDbContext.Employees;

    public async ValueTask<Employee?> SelectEmployeeByIdAsync(int employeeId) =>
        await appDbContext.Employees.FindAsync(employeeId);

    public async ValueTask<Employee> InsertEmployeeAsync(Employee employee)
    {
        await appDbContext.Employees.AddAsync(employee);
        await appDbContext.SaveChangesAsync();

        return employee;
    }

    public async ValueTask<Employee> UpdateEmployeeAsync(Employee employee)
    {
        appDbContext.Employees.Update(employee);
        await appDbContext.SaveChangesAsync();

        return employee;
    }

    public async ValueTask<Employee> DeleteEmployeeAsync(Employee employee)
    {
        appDbContext.Employees.Remove(employee);
        await appDbContext.SaveChangesAsync();

        return employee;
    }
}
