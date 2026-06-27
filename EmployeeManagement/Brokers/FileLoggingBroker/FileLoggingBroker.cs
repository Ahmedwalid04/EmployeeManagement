using System.Text;

namespace EmployeeManagement.Brokers.FileLoggingBroker;

public class FileLoggingBroker(IWebHostEnvironment environment) : IFileLoggingBroker
{
    private readonly string logFilePath =
        Path.Combine(environment.ContentRootPath, "Logs", "errors.txt");

    public async Task LogErrorAsync(Exception exception, CancellationToken cancellationToken = default)
    {
        string? directoryPath = Path.GetDirectoryName(this.logFilePath);

        if (!string.IsNullOrWhiteSpace(directoryPath))
        {
            Directory.CreateDirectory(directoryPath);
        }

        string logEntry =
            $"[{DateTime.UtcNow:O}] {exception.Message}{Environment.NewLine}{exception}{Environment.NewLine}{Environment.NewLine}";

        await File.AppendAllTextAsync(
            path: this.logFilePath,
            contents: logEntry,
            encoding: Encoding.UTF8,
            cancellationToken: cancellationToken);
    }
}
