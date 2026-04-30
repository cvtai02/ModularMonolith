using Microsoft.EntityFrameworkCore;
using Payment.Core.DTOs;

namespace Payment.Core.Usecases;

public class GetPaymentTransactionById(PaymentDbContext db)
{
    public async Task<PaymentTransactionResponse?> ExecuteAsync(int id, CancellationToken ct)
    {
        var transaction = await db.Transactions
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted, ct);

        return transaction is null ? null : PaymentMapper.ToResponse(transaction);
    }
}
