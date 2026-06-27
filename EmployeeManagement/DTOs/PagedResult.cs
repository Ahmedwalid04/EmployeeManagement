namespace EmployeeManagement.DTOs;

public class PagedResult<T>
{
    public IReadOnlyCollection<T> Items { get; set; } = [];

    public int PageNumber { get; set; }

    public int PageSize { get; set; }

    public int TotalCount { get; set; }
}
