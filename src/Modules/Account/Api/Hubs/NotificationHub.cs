using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using SharedKernel.Authorization;

namespace Account.Api.Hubs;

[Authorize(Policy = Policies.TenantAdminUp)]
public class NotificationHub : Hub
{
}
