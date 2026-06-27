namespace EmployeeManagement.Brokers.FileLoggingBroker;

public interface IFileLoggingBroker
{
    Task LogErrorAsync(Exception exception, CancellationToken cancellationToken = default);
}
