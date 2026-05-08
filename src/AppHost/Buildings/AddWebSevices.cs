using System.Text;
using System.Text.Json.Serialization;
using AppHost.Specifications;
using Infrastructure;
using Microsoft.AspNetCore.Authentication.BearerToken;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using SharedKernel.Abstractions.Services;
using SharedKernel.Authorization;
using WebAPI.ExceptionHandlers;

namespace AppHost.Buildings;

public static partial class ServiceCollectionExtensions
{
    extension (IHostApplicationBuilder builder)
    {
        public IServiceCollection AddWebServices()
        { 
            var services = builder.Services;
            services.AddOpenApi(options =>
            {
                options.AddDocumentTransformer((document, context, ct) =>
                {
                    document.Components ??= new OpenApiComponents();
                    document.Components.SecuritySchemes = new Dictionary<string, IOpenApiSecurityScheme>
                    {
                        [JwtBearerDefaults.AuthenticationScheme] = new OpenApiSecurityScheme
                        {
                            // Name = "JWT Authentication",
                            // Description = "Enter your JWT token in this field",
                            // In = ParameterLocation.Header,
                            // Type = SecuritySchemeType.Http,
                            // Scheme = JwtBearerDefaults.AuthenticationScheme,
                            // BearerFormat = "JWT"
                            
                            Name = "Bearer Authentication",
                            Description = "Enter your access token in this field",
                            In = ParameterLocation.Header,
                            Type = SecuritySchemeType.Http,
                            Scheme = BearerTokenDefaults.AuthenticationScheme,
                            BearerFormat = "Bearer"
                        }
                    };

                    var securityRequirement = new OpenApiSecurityRequirement
                    {
                        {
                            new OpenApiSecuritySchemeReference(JwtBearerDefaults.AuthenticationScheme),
                            []
                        }
                    };

                    document.Security = [securityRequirement];
                    return Task.CompletedTask;
                });

                // Replaces CustomSchemaIds
                options.CreateSchemaReferenceId = (type) =>
                    type.Type.FullName!.Replace('+', '-');
            });

            services.AddScoped<IUser, User>();
            services.AddSingleton<ITenant, Tenant>();
            services.AddScoped<IModuleKeyRetrievable, EndpointModuleKeyRetriever>();

            var jwtSettings = SettingsProvider.GetInstance(builder).GetCommonSettings().Jwt;

            services.AddAuthentication();
            services.Configure<BearerTokenOptions>(IdentityConstants.BearerScheme, options =>
            {
                options.Events ??= new BearerTokenEvents();
                options.Events.OnMessageReceived = context =>
                {
                    var path = context.Request.Path;
                    if ((path.StartsWithSegments("/hubs/notifications") ||
                         path.StartsWithSegments("/hubs/orders")) &&
                        context.Request.Query.TryGetValue("access_token", out var accessToken))
                    {
                        context.Token = accessToken.ToString();
                    }

                    return Task.CompletedTask;
                };
            });

            // services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            //     .AddJwtBearer("Bearer", options =>
            //     {
            //         options.TokenValidationParameters = new TokenValidationParameters
            //         {
            //             ValidateIssuer = true,
            //             ValidateAudience = true,
            //             ValidateLifetime = true,
            //             ValidateIssuerSigningKey = true,

            //             ValidIssuer = jwtSettings.Issuer,
            //             ValidAudiences = jwtSettings.Audiences,
            //             IssuerSigningKey = new SymmetricSecurityKey(
            //                 Encoding.UTF8.GetBytes(jwtSettings.Secret))
            //         };
            //     });
            services.AddAuthorization(options =>
            {
                options.AddPolicies();
            });
            services.AddSignalR();

            services.AddExceptionHandler<GlobalExceptionHandler>()
                .AddProblemDetails()
                .AddHttpContextAccessor()
                .AddControllers()
                .AddJsonOptions(options =>
                {
                    //MVC's JSON
                    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                    options.JsonSerializerOptions.NumberHandling = JsonNumberHandling.Strict; 
                });

            services.ConfigureHttpJsonOptions(options =>
            {
                // Tell OpenApi generator to report number fields as integers/floats only, not strings
                options.SerializerOptions.NumberHandling = JsonNumberHandling.Strict;
                options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
            });

            return services;
        }
    }
}
