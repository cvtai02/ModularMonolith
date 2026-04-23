namespace Infrastructure;
public enum ObjectStorageProvider
{   
    None,
    CloudflareR2,
    LocalFileSystem,
    AzureBlobStorage,
}

public enum DatabaseProvider
{
    None,
    SqlServer,
    PostgreSQL,
}