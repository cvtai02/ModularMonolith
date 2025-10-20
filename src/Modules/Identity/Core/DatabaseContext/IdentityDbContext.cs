using Identity.Core.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Abstractions.Services;

namespace Identity.Core.DatabaseContext;

// simple db context name
public class ModuleDbContext(DbContextOptions<ModuleDbContext> options)  :  IdentityDbContext<AppUser>(options)
{
}