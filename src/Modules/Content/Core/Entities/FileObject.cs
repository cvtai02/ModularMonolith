namespace Content.Core.Entities;

public class FileObject : AuditableEntity
{
    public int Id { get; set; }
    public string Category { get; set; } = null!;   // const in  FileCategory.cs
    // public string Group { get; set; } = null!;  // by default is tenant-signature, this also is bucket name if using S3 compatible storage
    public string Key { get; set; } = null!;    // not unique, it can be the same with other tenant files.
    public string Name { get; set; } = null!;
    public string ContentType { get; set; } = string.Empty;
    public long Size { get; set; }
}
