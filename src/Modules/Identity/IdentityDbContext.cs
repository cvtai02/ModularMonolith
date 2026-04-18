using Identity.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Identity;

public class IdentityDbContext(DbContextOptions<IdentityDbContext> options)  :  Microsoft.AspNetCore.Identity.EntityFrameworkCore.IdentityDbContext<AppUser>(options)
{
}