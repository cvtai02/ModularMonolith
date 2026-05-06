namespace SharedKernel.Abstractions.Contracts;

[AttributeUsage(AttributeTargets.Class, Inherited = false)]
public sealed class UsecaseInjectAttribute : Attribute
{
    public UsecaseInjectAttribute()
    {
    }
}
