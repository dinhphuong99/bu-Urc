using Host.Entities;
using IdentityServer4.Services;
using III.Domain.DbContexts;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace IdentityServer4.Quickstart.UI
{
    [SecurityHeaders]
    public class HomeController : Controller
    {
        private readonly IIdentityServerInteractionService _interaction;
        private readonly IDatabaseInitializer _databaseInitializer;
        private readonly UserManager<ApplicationUser> _userManager;

        public HomeController(IIdentityServerInteractionService interaction, UserManager<ApplicationUser> userManager)
        {
            _interaction = interaction;
            _userManager = userManager;
        }

        public IActionResult Index()
        {
            return View();
        }

        /// <summary>
        /// Shows the error page
        /// </summary>
        public async Task<IActionResult> Error(string errorId)
        {
            var vm = new ErrorViewModel(); 
            var message = await _interaction.GetErrorContextAsync(errorId);
            if (message != null)
            {
                vm.Error = message;
            }

            return View("Error", vm);
        }

        public async Task<IActionResult> CreateRootAsync()
        {
            try
            {
                var applicationUser = await _userManager.FindByNameAsync("admin");
                if (applicationUser == null)
                {
                    applicationUser = new ApplicationUser
                    {
                        UserName = "admin",
                        Email = "thaodn2@fpt.com.vn",
                        NormalizedUserName = "admin".ToUpper(),
                        NormalizedEmail = "thaodn2@fpt.com.vn".ToUpper(),
                        PhoneNumber = "0123456789",
                        EmailConfirmed = true,
                        GivenName = "Admin Root",
                        Active = true,
                        UserType = 1,
                        CreatedDate = DateTime.Now,
                    };

                    var result = await _userManager.CreateAsync(applicationUser, "Vietnam@3i");
                }
                //_databaseInitializer.CreateUserAsync("admin", "Vietnam@3i", "thaodn2@fpt.com.vn", "Admin Root", "0123456789");
            }
            catch (Exception e)
            {
            }

            return View("Index");
        }
    }
}