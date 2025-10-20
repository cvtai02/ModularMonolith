using Module = SharedKernel.Abstractions.Contracts.Module;

namespace AppHost.Buildings;

public  static partial class WebApplicationExtension
{
    extension (WebApplication app)
    {
        public void UseModules()
        {
            var modules = app.Services.GetServices<Module>();
            foreach(var m in modules)
            {
                m.Run(app);
            }
        }
    }
}