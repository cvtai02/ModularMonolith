namespace SharedKernel.Abstractions.Contracts;

[AttributeUsage(AttributeTargets.Class, Inherited = false)]
public sealed class UsecaseInjectAttribute : Attribute
{
    public UsecaseInjectAttribute()
    {
    }

    public UsecaseInjectAttribute(Type serviceType)
    {
        ServiceType = serviceType;
    }

    public Type? ServiceType { get; }
    public UsecaseInjectLifetime Lifetime { get; init; } = UsecaseInjectLifetime.Scoped;
}

public enum UsecaseInjectLifetime
{
    Scoped,
    Transient,
    Singleton
}
