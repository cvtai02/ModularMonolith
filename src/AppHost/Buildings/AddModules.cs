namespace AppHost.Buildings;

public  static partial class HostBuilderExtension
{
    extension (IHostApplicationBuilder builder)
    {
        public void AddModules()
        {
            // can not apply this for ef migration bundle
            // var assemblies = Directory.GetFiles(AppContext.BaseDirectory, "*.dll")
            //     .Where(f => !f.Contains("System") && !f.Contains("Microsoft"))
            //     .Select(Assembly.LoadFrom)
            //     .Where(a => a != null)
            //     .ToList();

            // var moduleTypes = assemblies
            //     .SelectMany(a => a.GetTypes())
            //     .Where(t => typeof(Module).IsAssignableFrom(t) && !t.IsInterface && !t.IsAbstract)
            //     .ToList();

            // ----

            //scan BaseModuleInjection faild because assembly is only loaded when something from it is actually used
            // var moduleTypes = AppDomain.CurrentDomain.GetAssemblies()
            //     .SelectMany(a => a.GetTypes())
            //     .Where(t => typeof(BaseModule).IsAssignableFrom(t) && !t.IsInterface && !t.IsAbstract)
            //     .ToList();

            var modules = ModuleList.Get(builder);
            foreach (var module in modules)
            {
                builder.Services.AddSingleton(module);
                module.RegisterModule();
            }

            return;
        }
    }
}
