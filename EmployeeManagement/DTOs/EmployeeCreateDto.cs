using System.ComponentModel.DataAnnotations;
using EmployeeManagement.Models;

namespace EmployeeManagement.DTOs;

public class EmployeeCreateDto
{
    [Required]
    [MaxLength(200)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [Phone]
    [MaxLength(50)]
    public string Phone { get; set; } = string.Empty;

    public DateTime HireDate { get; set; }

    [Range(typeof(decimal), "0", "79228162514264337593543950335")]
    public decimal Salary { get; set; }

    [EnumDataType(typeof(Department))]
    public Department Department { get; set; }

    public bool IsActive { get; set; }
}
