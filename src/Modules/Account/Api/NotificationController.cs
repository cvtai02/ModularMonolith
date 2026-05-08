using Account.Core.Usecases.Notifications;
using Account.DTOs.Notifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedKernel.Authorization;
using SharedKernel.DTOs;

namespace Account.Api;

[ApiController]
[Authorize(Policy = Policies.TenantAdminUp)]
[Route($"api/{ModuleConstants.Key}/admin/notifications")]
public class NotificationController(
    ListAdminNotifications listAdminNotifications,
    MarkAdminNotificationRead markAdminNotificationRead,
    MarkAllAdminNotificationsRead markAllAdminNotificationsRead) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PaginatedList<NotificationResponse>>> GetAll(
        [FromQuery] ListNotificationsRequest request,
        CancellationToken cancellationToken)
        => Ok(await listAdminNotifications.ExecuteAsync(request, cancellationToken));

    [HttpPatch("{id:int}/read")]
    public async Task<ActionResult<NotificationResponse>> MarkRead(
        int id,
        CancellationToken cancellationToken)
    {
        var result = await markAdminNotificationRead.ExecuteAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPatch("read")]
    public async Task<ActionResult<PaginatedList<NotificationResponse>>> MarkAllRead(
        CancellationToken cancellationToken)
        => Ok(await markAllAdminNotificationsRead.ExecuteAsync(cancellationToken));
}
