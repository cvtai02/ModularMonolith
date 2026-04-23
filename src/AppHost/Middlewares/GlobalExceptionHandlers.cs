using System.Diagnostics;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using SharedKernel.Exceptions;

namespace WebAPI.ExceptionHandlers;
public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger, IHostEnvironment environment) : IExceptionHandler
{
    private const bool IsLastStopInPipeline = true;

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext,
        Exception exception, CancellationToken cancellationToken)
    {
        var traceId = Activity.Current?.Id ?? httpContext.TraceIdentifier;
        logger.LogError(exception, "Could not process a request on machine {MachineName} with trace id {TraceId}",
            Environment.MachineName, traceId);

        if (exception is ValidationException validationException)
        {
            var vproblemDetails = new ValidationProblemDetails(validationException.Errors)
            {
                Title = validationException.Message,
                Status = StatusCodes.Status400BadRequest,
                Extensions = { ["traceId"] = traceId },
                Instance = $"{httpContext.Request.Method} {httpContext.Request.Path}",
                Errors = validationException.Errors
            };

            httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;

            await httpContext.Response
                .WriteAsJsonAsync(vproblemDetails, cancellationToken);
            return IsLastStopInPipeline;
        }

        (int statusCode, string title) = MapException(exception);

        var problemDetails = new ProblemDetails
        {
            Title = title,
            Status = statusCode,
            Extensions = { ["traceId"] = traceId },
            Instance = $"{httpContext.Request.Method} {httpContext.Request.Path}"
        };
        if (!environment.IsProduction())
        {
            problemDetails.Detail = exception.Message + "\n" + exception.InnerException?.Message;
        }

        httpContext.Response.StatusCode = statusCode;

        await httpContext.Response
            .WriteAsJsonAsync(problemDetails, cancellationToken);
        return IsLastStopInPipeline;
    }

    private static (int statusCode, string title) MapException(Exception exception)
    {
        return exception switch
        {
            NotFoundException => (StatusCodes.Status404NotFound, exception.Message),
            UnauthorizedAccessException => (StatusCodes.Status403Forbidden, $"Forbidden: {exception.Message}"),
            
            // Catch-all for other DbUpdateExceptions
            DbUpdateException => (StatusCodes.Status500InternalServerError, "Database operation failed. " + exception.InnerException?.Message),
            
            _ => (StatusCodes.Status500InternalServerError, "Unexpected Error")
        };
    }
}