using AppHost.Buildings;
using Infrastructure;
using Microsoft.AspNetCore.Identity;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);
// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi

builder.AddModules();
builder.Services.AddInfrastructure();
builder.AddWebServices();
builder.Services.AddOpenApi();

var app = builder.Build();

    app.MapOpenApi();
    app.MapScalarApiReference();
    app.MapGet("/", () => Results.Redirect("/scalar/v1", true));
    
    app.UseHttpsRedirection();

    // No need of cors if not using cookies or cookies samesite.
    app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()) 
    .UseAuthentication()
    .UseAuthorization()
    .UseExceptionHandler();

app.UseModules();
app.MapControllers();
app.MapGet("/health", () => { return Results.Ok("Healthy"); }).WithName("HealthCheck");

app.Run();