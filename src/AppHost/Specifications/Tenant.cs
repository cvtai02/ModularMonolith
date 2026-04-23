using SharedKernel.Abstractions.Services;

namespace AppHost.Specifications;

// Currently one tenant only, so we return a fixed value. In the future, we can implement multi-tenancy and return the actual tenant information.
public class Tenant : ITenant
{
    public int Id => 1;
    public string Name => "Nekomin";    
    public string Signature => "nekomin"; 
    public string Domain => "nekomin.com"; 
}
