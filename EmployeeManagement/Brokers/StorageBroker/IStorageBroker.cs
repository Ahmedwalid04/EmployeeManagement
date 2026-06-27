using EmployeeManagement.Models;

namespace EmployeeManagement.Brokers.StorageBroker;

public interface IStorageBroker
{
    IQueryable<Employee> SelectAllEmployees();

    ValueTask<Employee?> SelectEmployeeByIdAsync(int employeeId);

    ValueTask<Employee> InsertEmployeeAsync(Employee employee);

    ValueTask<Employee> UpdateEmployeeAsync(Employee employee);

    ValueTask<Employee> DeleteEmployeeAsync(Employee employee);
}
