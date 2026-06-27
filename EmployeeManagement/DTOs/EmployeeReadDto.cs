using EmployeeManagement.Models;

namespace EmployeeManagement.DTOs;

public class EmployeeReadDto
{
    public int Id { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public DateTime HireDate { get; set; }

    public decimal Salary { get; set; }

    public Department Department { get; set; }

    public bool IsActive { get; set; }
}
