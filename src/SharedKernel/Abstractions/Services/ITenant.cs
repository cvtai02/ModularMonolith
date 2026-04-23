namespace SharedKernel.Abstractions.Services;

public interface ITenant
{
    int Id { get; } 
    string Name { get; } // used for display purposes, e.g. in the admin panel
    string Signature { get; }   //use for bucket name
    string Domain { get; }  // public domain
    string CdnBaseUrl { get => $"https://cdn.{Domain}"; } 
}