using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Common;

namespace SharedKernel.Abstractions.Contracts;

public class Entity
{
    // Events will be persist with entity in the same transaction 
    [NotMapped]
    public List<IntegrationEvent> Events { get; } = [];
}