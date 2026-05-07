using Intermediary.Events.Inventory;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Inventory.Core.Entities;

namespace Inventory.Core.BackgroundServices;

public class ReservationExpiryBackgroundService(
    IServiceScopeFactory scopeFactory,
    ILogger<ReservationExpiryBackgroundService> logger) : BackgroundService
{
    private static readonly TimeSpan PollInterval = TimeSpan.FromSeconds(30);
    private const int BatchSize = 100;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(PollInterval);

        while (!stoppingToken.IsCancellationRequested)
        {
            await ProcessExpiredReservations(stoppingToken);

            try
            {
                await timer.WaitForNextTickAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }
    }

    private async Task ProcessExpiredReservations(CancellationToken ct)
    {
        try
        {
            await using var scope = scopeFactory.CreateAsyncScope();
            var db = scope.ServiceProvider.GetRequiredService<InventoryDbContext>();
            var publisher = scope.ServiceProvider.GetRequiredService<IPublisher>();
            var now = DateTimeOffset.UtcNow;

            var expiredReservations = await db.Reservations
                .AsNoTracking()
                .Where(x => x.Status == ReservationStatus.Active && x.ExpiresAt <= now)
                .OrderBy(x => x.ExpiresAt)
                .Take(BatchSize)
                .Select(x => new
                {
                    x.Id,
                    x.OrderCode
                })
                .ToListAsync(ct);

            foreach (var reservation in expiredReservations)
            {
                await publisher.Publish(new ReservationExpired
                {
                    OrderCode = reservation.OrderCode,
                    ReservationId = reservation.Id
                }, ct);
            }
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to process expired inventory reservations.");
        }
    }
}
