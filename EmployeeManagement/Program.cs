using EmployeeManagement.Brokers.FileLoggingBroker;
using EmployeeManagement.Brokers.StorageBroker;
using EmployeeManagement.Data;
using EmployeeManagement.Profiles;
using EmployeeManagement.Services.Employees;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

const string CorsPolicyName = "AllowFrontendApp";

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddAutoMapper(_ => { }, typeof(EmployeeProfile));
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<IStorageBroker, StorageBroker>();
builder.Services.AddScoped<IFileLoggingBroker, FileLoggingBroker>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        CorsPolicyName,
        policy => policy
            .WithOrigins("http://localhost:4200", "http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception exception)
    {
        IFileLoggingBroker fileLoggingBroker =
            context.RequestServices.GetRequiredService<IFileLoggingBroker>();

        await fileLoggingBroker.LogErrorAsync(exception, context.RequestAborted);

        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsJsonAsync(
            new { message = "An unexpected error occurred." },
            context.RequestAborted);
    }
});

app.MapOpenApi();
app.MapScalarApiReference();

app.UseCors(CorsPolicyName);
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
