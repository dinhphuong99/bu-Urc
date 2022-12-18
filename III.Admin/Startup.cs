using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.IdentityModel.Tokens.Jwt;
using ESEIM.Models;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Serialization;
using Microsoft.AspNetCore.Http;
using ESEIM.Utils;
using System.IO;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc.Razor;
using System.Globalization;
using Microsoft.AspNetCore.Localization;
using Microsoft.Extensions.Options;
using System.Linq;
using System.Collections.Generic;
using Microsoft.AspNetCore.ResponseCompression;
using III.Admin.Utils;

namespace ESEIM
{
    public class Startup
    {
        //private const string enUSCulture = "en-US";
        //private const string viVNCulture = "vi-VN";
        public static IHostingEnvironment _env;
        public Startup(IHostingEnvironment env)
        {
            _env = env;
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
            Configuration = builder.Build();
            Environment = env;
        }

        public IConfigurationRoot Configuration { get; }
        public IHostingEnvironment Environment { get; }
        public void ConfigureServices(IServiceCollection services)
     {
            services.AddHttpContextAccessor();
            //services.AddMvc();
            var appSettings = Configuration.GetSection("AppSettings");
            //var deCodeConnectionString = EncodeConnectString.DecryptString(Configuration.GetConnectionString("EIMConnection"));
            services.Configure<AppSettings>(appSettings);
            services.AddDbContext<EIMDBContext>(options =>
            {
                options.UseSqlServer(Configuration.GetConnectionString("EIMConnection"), opt => opt.UseRowNumberForPaging());
            });
            services.AddIdentity<AspNetUser, AspNetRole>(options =>
            options.Password = new PasswordOptions
            {
                RequiredLength = 6,
                RequireDigit = false,
                RequireLowercase = false,
                RequireUppercase = false,
                RequireNonAlphanumeric = false
            }).AddEntityFrameworkStores<EIMDBContext>().AddDefaultTokenProviders();
            services.AddLocalization(options => options.ResourcesPath = "Resources");
            services.AddResponseCaching();
            services.AddMvc()
           .AddViewLocalization(LanguageViewLocationExpanderFormat.Suffix)
           .AddDataAnnotationsLocalization();
            services.AddMvc().AddJsonOptions(options =>
            {
                options.SerializerSettings.ContractResolver = new DefaultContractResolver();
            });

            var dtf = new DateTimeFormatInfo
            {
                ShortDatePattern = "MM/dd/yyyy",
            };
            var numberFormart = new NumberFormatInfo
            {
                NumberDecimalSeparator = ".",
                CurrencyDecimalSeparator = "."
            };
            var cultureInfo = new CultureInfo("vi-VN");
            CultureInfo.DefaultThreadCurrentCulture = cultureInfo;
            CultureInfo.DefaultThreadCurrentUICulture = cultureInfo;
            cultureInfo.DateTimeFormat = dtf;
            cultureInfo.NumberFormat = numberFormart;
            services.Configure<RequestLocalizationOptions>(options =>
            {
                var supportedCultures = new[]
                {
                       new CultureInfo("vi-VN") {DateTimeFormat=dtf,NumberFormat = numberFormart  },
                       new CultureInfo("en-US"){DateTimeFormat=dtf,NumberFormat = numberFormart },
                       //new CultureInfo("ja-JA"){DateTimeFormat=dtf,NumberFormat = numberFormart },
                       //new CultureInfo("zh-TW"){DateTimeFormat=dtf,NumberFormat = numberFormart },
                       //new CultureInfo("ko-KR"){DateTimeFormat=dtf,NumberFormat = numberFormart },
                       //new CultureInfo("la-LA"){DateTimeFormat=dtf,NumberFormat = numberFormart },
                       //new CultureInfo("ca-CA"){DateTimeFormat=dtf,NumberFormat = numberFormart },
                       //new CultureInfo("my-MM"){DateTimeFormat=dtf,NumberFormat = numberFormart },
                       //new CultureInfo("fr-FR"){DateTimeFormat=dtf,NumberFormat = numberFormart },
                    };
                options.DefaultRequestCulture = new RequestCulture(cultureInfo);
                options.SupportedCultures = supportedCultures;
                options.SupportedUICultures = supportedCultures;
                options.RequestCultureProviders = new List<IRequestCultureProvider>
                    {
                        new QueryStringRequestCultureProvider(),
                        new CookieRequestCultureProvider()
                    };
            });
            services.Configure<FormOptions>(x =>
            {
                x.MultipartBodyLengthLimit = long.MaxValue;
            });

            services.AddSession();
            services.AddCors();
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddScoped<ILanguageService, LanguageService>();
            services.AddScoped<IUserLoginService, UserLoginService>();
            services.AddScoped<IParameterService, ParameterService>();
            services.AddScoped<IActionLogService, ActionLogService>();
            services.AddScoped<IUploadService, UploadService>();
            services.AddScoped<ICardJobService, CardJobService>();
            services.AddScoped<IFCMPushNotification, FCMPushNotification>();
            services.AddScoped<IGoogleAPIService, GoogleAPIService>();
            services.AddScoped<IRepositoryService, RepositoryService>();
            services.AddDataProtection().PersistKeysToFileSystem(new DirectoryInfo(Environment.WebRootPath + "\\tempKeys"));
            services.AddSignalR();
            #region Config Session
            services.AddDistributedMemoryCache();

            services.AddSession(options =>
            {
                // Set a short timeout for easy testing.
                //options.IdleTimeout = TimeSpan.FromDays(30);
                options.Cookie.HttpOnly = true;
            });
            services.ConfigureApplicationCookie(options =>
            {
                // Cookie settings
                options.Cookie.HttpOnly = true;
                //options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
                // Địa chỉ trả về khi chưa đăng nhập /Admin/Account/Login.
                options.LoginPath = "/Admin/Account/Login";
                // Địa chỉ trả về khi không cho phép truy cập /Admin/Account/AccessDenied.
                options.AccessDeniedPath = "/Account/AccessDenied";
                //options.SlidingExpiration = true;
            });
            services.AddAuthentication("LoginSecurityScheme")
                .AddCookie("LoginSecurityScheme", options =>
                {
                    options.AccessDeniedPath = new PathString("/Account/Access");
                    options.Cookie = new CookieBuilder
                    {
                        //Domain = "",
                        HttpOnly = true,
                        Name = ".swork.Security.Cookie",
                        Path = "/",
                        SameSite = SameSiteMode.Lax,
                        SecurePolicy = CookieSecurePolicy.SameAsRequest
                    };
                    options.Events = new CookieAuthenticationEvents
                    {
                        OnSignedIn = context =>
                        {
                            Console.WriteLine("{0} - {1}: {2}", DateTime.Now,
                                "OnSignedIn", context.Principal.Identity.Name);
                            return Task.CompletedTask;
                        },
                        OnSigningOut = context =>
                        {
                            Console.WriteLine("{0} - {1}: {2}", DateTime.Now,
                                "OnSigningOut", context.HttpContext.User.Identity.Name);
                            return Task.CompletedTask;
                        },
                        OnValidatePrincipal = context =>
                        {
                            Console.WriteLine("{0} - {1}: {2}", DateTime.Now,
                                "OnValidatePrincipal", context.Principal.Identity.Name);
                            return Task.CompletedTask;
                        }
                    };
                    //options.ExpireTimeSpan = TimeSpan.FromMinutes(10);
                    options.LoginPath = new PathString("/Admin/Account/Login");
                    options.ReturnUrlParameter = "returnUrl";
                });
            #endregion

            //services.AddCors(options =>
            //{
            //    options.AddPolicy("AllowSpecificOrigin",
            //        builder => builder.WithOrigins("*"));
            //});
        }
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory, IParameterService parameterService)
        {
            var appSettings = Configuration.GetSection("AppSettings");
            JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
            Syncfusion.Licensing.SyncfusionLicenseProvider.RegisterLicense("MjY2NjQyQDMxMzgyZTMxMmUzMG1DSVFmTkhjaUpMVS9XeEY4dGVUOTM4RDVTS1pZQUlYZEVvMVpIa2poRFU9");

            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();
            loggerFactory.AddContext(LogLevel.Information, app.ApplicationServices.GetService<IHttpContextAccessor>());

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseBrowserLink();
            }
            else
            {
                app.UseExceptionHandler("/Admmin/DashBoard/Index");
            }

            AppContext.Configure(app.ApplicationServices.
                GetRequiredService<IHttpContextAccessor>(), appSettings
            );
            var localizationOptions = app.ApplicationServices.GetService<IOptions<RequestLocalizationOptions>>();
            app.UseRequestLocalization(localizationOptions.Value);
            app.UseStaticFiles();
            app.UseAuthentication();
            app.UseResponseCaching();
            app.UseSession();

            app.UseCors(builder => builder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());

            app.UseStaticFiles();
            app.UseSignalR(routes =>  // <-- SignalR 
            {
                routes.MapHub<ScheduleHub>("/scheduleHub");
            });
            app.UseMvc(routes =>
            {
                routes.MapRoute(
                   name: "default",
                   template: "{controller=CalendarRegistration}/{action=Index}");
                routes.MapRoute(
                    name: "admin",
                    template: "{area:exists}/{controller=DashBoard}/{action=Index}/{id?}");
                routes.MapRoute(
                 name: "angular",
                 template: "{*url}",
                 defaults: new { controller = "CalendarRegistration", action = "Index" });
            });
        }
    }

    public class AppSettings
    {
        public string Authority { get; set; }
        public string ClientId { get; set; }
        public string ClientSecret { get; set; }
        public string Host { get; set; }
        public string Api { get; set; }
        public string ClientScope { get; set; }
        public ADConfigs ADConfigs { get; set; }
        public OMSConfigs OMSConfigs { get; set; }
        public string UrlBase { get; set; }
        public string UrlEnterprise { get; set; }
    }

    public class ADConfigs
    {
        public string Host { get; set; }
        public int Port { get; set; }
        public string LoginDN { get; set; }
        public string Password { get; set; }
        public string ObjectDN { get; set; }
    }

    public class OMSConfigs
    {
        public string Url { get; set; }
        public string Domain { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class FormOptions
    {
        public long? ValueLengthLimit { get; set; }
        public long? MultipartBodyLengthLimit { get; set; }
    }
}
