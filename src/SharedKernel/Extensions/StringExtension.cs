namespace SharedKernel.Extensions;

public static partial class StringExtension
{
    public static string ToSlug(this string value)
    {
        return value.ToLower().Replace(" ", "-");
    }
}
