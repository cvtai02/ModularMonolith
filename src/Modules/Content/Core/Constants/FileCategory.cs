namespace Content.Core.Constants;

public static class FileCategory
{
    public const string Avatar = "avatar";
    public const string Review = "review";
    public const string Product = "product";
    public const string Content = "content";

    public static readonly IReadOnlyCollection<string> List = [Avatar, Review, Product, Content];
}