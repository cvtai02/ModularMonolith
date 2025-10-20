using System.ComponentModel.DataAnnotations.Schema;

namespace SharedKernel.Abstractions.Contracts;

/// <summary>
/// Entities that inherit from this class will be audited automatically.
/// </summary>
public abstract class AuditableEntity : Entity
{
    public DateTimeOffset LastModified { get; set; }    //UTC
    public string? ModifiedBy { get; set; }
    public bool IsDeleted { get; set; } = false;
    [NotMapped]
    public bool IsSoftDeleted = true; 
}