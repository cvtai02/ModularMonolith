using System.Reflection;
using Module = SharedKernel.Abstractions.Contracts.Module;

namespace AppHost.Buildings;

public  static partial class HostBuilderExtension
{
    extension (IHostApplicationBuilder builder)
    {
        public void AddModules()
        {
            builder.Services.AddMediatR(cfg =>
            {
                cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
            });

            var assemblies = Directory.GetFiles(AppContext.BaseDirectory, "*.dll")
                .Where(f => !f.Contains("System") && !f.Contains("Microsoft"))
                .Select(Assembly.LoadFrom)
                .Where(a => a != null)
                .ToList();

            var moduleTypes = assemblies
                .SelectMany(a => a.GetTypes())
                .Where(t => typeof(Module).IsAssignableFrom(t) && !t.IsInterface && !t.IsAbstract)
                .ToList();

            //scan BaseModuleInjection faild because assembly is only loaded when something from it is actually used
            // var moduleTypes = AppDomain.CurrentDomain.GetAssemblies()
            //     .SelectMany(a => a.GetTypes())
            //     .Where(t => typeof(BaseModule).IsAssignableFrom(t) && !t.IsInterface && !t.IsAbstract)
            //     .ToList();


            foreach (var moduleType in moduleTypes)
            {
                var module = (Module)Activator.CreateInstance(moduleType, builder)!;
                builder.Services.AddSingleton(module);
                module.RegisterModule();
            }

            return;
        }
    }
}