using EmployeeManagement.DTOs;
using EmployeeManagement.Services.Employees;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController(IEmployeeService employeeService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<EmployeeReadDto>>> GetEmployees(
        [FromQuery] string? searchTerm,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortDirection = null,
        CancellationToken cancellationToken = default)
    {
        pageNumber = Math.Max(pageNumber, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        PagedResult<EmployeeReadDto> employees = await employeeService.RetrieveEmployeesAsync(
            searchTerm,
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
            cancellationToken);

        return Ok(employees);
    }

    [HttpPost]
    public async Task<ActionResult<EmployeeReadDto>> PostEmployee(
        [FromBody] EmployeeCreateDto employeeCreateDto,
        CancellationToken cancellationToken = default)
    {
        EmployeeReadDto createdEmployee =
            await employeeService.AddEmployeeAsync(employeeCreateDto, cancellationToken);

        return Created(string.Empty, createdEmployee);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteEmployee(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            await employeeService.DeleteEmployeeByIdAsync(id, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
    }

    [HttpPatch("{id:int}/toggle-active")]
    public async Task<ActionResult<EmployeeReadDto>> ToggleEmployeeActiveStatus(
        int id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            EmployeeReadDto employee =
                await employeeService.ToggleEmployeeActiveStatusAsync(id, cancellationToken);

            return Ok(employee);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
    }
}
