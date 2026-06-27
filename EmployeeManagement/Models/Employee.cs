using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.Models;

[Index(nameof(Email), IsUnique = true)]
public class Employee
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Phone { get; set; } = string.Empty;

    public DateTime HireDate { get; set; }

    [Precision(18, 2)]
    public decimal Salary { get; set; }

    public Department Department { get; set; }

    public bool IsActive { get; set; }
}
