namespace Infrastructure;
public enum FileStorageProvider
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