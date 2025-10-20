using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;

namespace SharedKernel.Extensions;

public static class ControllerBaseExtension
{
    extension (ControllerBase controller)
    {
        public ISender Sender => controller.HttpContext.RequestServices.GetRequiredService<ISender>();
    }
}