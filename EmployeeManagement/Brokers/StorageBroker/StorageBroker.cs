using EmployeeManagement.Data;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.Brokers.StorageBroker;

public class StorageBroker(DbContextOptions<AppDbContext> options)
    : AppDbContext(options), IStorageBroker
{
}
