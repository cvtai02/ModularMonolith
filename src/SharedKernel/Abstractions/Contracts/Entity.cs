using System.ComponentModel.DataAnnotations.Schema;

namespace SharedKernel.Abstractions.Contracts;

public class Entity
{
    public int TenantId { get; set; }

    [NotMapped]
    public List<IntegrationEvent> Events { get; } = [];
}