using Microsoft.EntityFrameworkCore;

namespace SharedKernel.Abstractions.Factories;

public interface IConfigureDbContextStrategy
{
    void ConfigureDbContext(IServiceProvider sprovider, DbContextOptionsBuilder options,  string moduleKey);
}