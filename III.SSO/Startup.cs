using System.Reflection;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using IdentityServer4.Validation;
using System;
using Host.Services;
using Microsoft.Extensions.Configuration;
using Hangfire;
using IdentityServer4.Services;
using Host.Configuration;
using Host.DbContexts;
using Host.Entities;
using III.Domain.DbContexts;
using III.SSO.Services;
using Microsoft.AspNetCore.Identity;

namespace Host
{
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true);
            Configuration = builder.Build();
        }
        public IConfigurationRoot Configuration { get; }
        public IServiceProvider ConfigureServices(IServiceCollection services)
        {
            services.AddOptions();
            services.Configure<AppSettings>(Configuration.GetSection("AppSettings"));

            //services.Configure<MvcOptions>(options =>
            //{
            //    options.Filters.Add(new RequireHttpsAttribute());
            //});

            services.AddMvc();
            var connectionString = Configuration.GetConnectionString("DefaultConnection");
            var oracleConnection = Configuration.GetConnectionString("OracleConnection");

            var migrationsAssembly = typeof(Startup).GetTypeInfo().Assembly.GetName().Name;
            //services.AddDistributedSqlServerCache(options =>
            //{
            //    options.ConnectionString = oracleConnection;//Configuration.GetConnectionString("DefaultConnection");
            //    //options.SchemaName = "dbo";
            //    options.TableName = "AspNetSessions";
            //});

            services.AddSession(options =>
            {

            });
            //services.AddHangfire(x => x.UseSqlServerStorage(connectionString));



            services.AddDbContext<ApplicationDbContext>(builder =>
            {
                builder.UseSqlServer(connectionString, options => options.MigrationsAssembly(migrationsAssembly));
            });



            services.AddIdentity<ApplicationUser, AspNetRole>().AddEntityFrameworkStores<ApplicationDbContext>().AddDefaultTokenProviders()
                .AddIdentityServerUserClaimsPrincipalFactory();

            services.AddTransient<IDatabaseInitializer, DatabaseInitializer>();
            services.AddTransient<IEmailSender, AuthMessageSender>();
            services.AddTransient<ISmsSender, AuthMessageSender>();
            services.AddTransient<IProfileService, IdentityWithAdditionalClaimsProfileService>();
            services.AddTransient<IParameterService, ParameterService>();

            services.AddIdentityServer()
                .AddTemporarySigningCredential()
                .AddSecretParser<ClientAssertionSecretParser>()
                .AddSecretValidator<PrivateKeyJwtSecretValidator>()
                .AddInMemoryPersistedGrants()
                .AddInMemoryIdentityResources(Resources.GetIdentityResources())
                .AddInMemoryApiResources(Resources.GetApiResources())
                .AddInMemoryClients(Clients.Get())
                .AddAspNetIdentity<ApplicationUser>()
                .AddProfileService<IdentityWithAdditionalClaimsProfileService>();

            return services.BuildServiceProvider(validateScopes: true);
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env, IApplicationLifetime applicationLifetime, ILoggerFactory loggerFactory)
        {
            //var rewriteOptions = new RewriteOptions().AddRedirectToHttps();
            //app.UseRewriter(rewriteOptions);

            app.UseCors(policy =>
                                    policy.AllowAnyOrigin()
                                   .AllowAnyHeader()
                                   .AllowAnyMethod()
                                   .AllowCredentials()
                 );
            //app.UseHangfireDashboard();
            //var options = new BackgroundJobServerOptions { WorkerCount = 1 };
            //app.UseHangfireServer(options); 
            app.UseStaticFiles();
            app.UseSession();
            app.UseAuthentication();
            app.UseIdentityServer();
            app.UseStaticFiles();
            app.UseMvcWithDefaultRoute();



            //try
            //{
            //    databaseInitializer.SeedAsync().Wait();
            //}
            //catch (Exception ex)
            //{
            //    throw;
            //}
        }
    }


}