using Content.Core.DTOs.BlogPosts;
using Content.Core.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Extensions;
using SharedKernel.Exceptions;

namespace Content.Api;

[ApiController]
[Route($"api/{ModuleConstants.Key}/BlogPost")]
public class BlogPostController(ContentDbContext db) : ControllerBase
{
    private readonly ContentDbContext _db = db;
}
