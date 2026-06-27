using EmployeeManagement.DTOs;
using EmployeeManagement.Models;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DepartmentsController : ControllerBase
{
    [HttpGet]
    public ActionResult<IReadOnlyCollection<DepartmentReadDto>> GetDepartments()
    {
        IReadOnlyCollection<DepartmentReadDto> departments = Enum
            .GetValues<Department>()
            .Select(department => new DepartmentReadDto
            {
                Value = (int)department,
                Name = department.ToString()
            })
            .ToArray();

        return Ok(departments);
    }
}
