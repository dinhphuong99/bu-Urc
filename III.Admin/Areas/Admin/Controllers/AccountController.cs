using System;
using System.Security.Claims;
using System.Threading.Tasks;
using ESEIM.Controllers;
using ESEIM.Models;
using Hot.Models.AccountViewModels;
using IdentityDemo.Models.AccountViewModels;
using III.Admin.Controllers;
using Localization.StarterWeb.ViewModels.Account;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ESEIM.Utils;
using System.Linq;
using Microsoft.AspNetCore.Hosting;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class AccountController : Controller
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly SignInManager<AspNetUser> _signInManager;
        private readonly EIMDBContext _context;
        private readonly IParameterService _parameterService;
        private readonly ILogger _logger;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly ILanguageService _languageService;


        public AccountController(
            UserManager<AspNetUser> userManager,
            SignInManager<AspNetUser> signInManager,
            EIMDBContext context,
            IParameterService parameterService,
            IHostingEnvironment hostingEnvironment,
            ILogger<AccountController> logger,
            ILanguageService languageService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _context = context;
            _parameterService = parameterService;
            _hostingEnvironment = hostingEnvironment;
            _languageService = languageService;
            _logger = logger;
        }

        [TempData]
        public string ErrorMessage { get; set; }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> Login(string returnUrl = null)
        {
            // Clear the existing external cookie to ensure a clean login process
            await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);

            ViewData["ReturnUrl"] = returnUrl;
            return View();
        }

        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(LoginViewModel model, string returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;
            if (ModelState.IsValid)
            {
                // This doesn't count login failures towards account lockout
                // To enable password failures to trigger account lockout, set lockoutOnFailure: true
                var user = await _userManager.FindByNameAsync(model.Username);
                if (user == null)
                {
                    ModelState.AddModelError(string.Empty, "Username or Password incorrect.");
                }
                else if (user.Active == false)
                {
                    ModelState.AddModelError(string.Empty, "Username is not active. Please contact to admin.");
                }
                else
                {
                    var result = await _signInManager.PasswordSignInAsync(model.Username, model.Password, model.RememberLogin, lockoutOnFailure: false);
                    if (result.Succeeded)
                    {
                        var authenProps = new AuthenticationProperties
                        {
                            IsPersistent = model.RememberLogin,
                            ExpiresUtc = DateTimeOffset.UtcNow.Add(AccountOptions.RememberMeLoginDuration)
                            //ExpiresUtc = DateTimeOffset.UtcNow.AddMinutes(model.RememberLogin ? (15 * 24 * 60) : _parameterService.GetSessionTimeoutAdmin()),
                        };

                        user.IsOnline = 1;
                        _context.Users.Update(user);
                        _context.SaveChanges();

                        await _signInManager.SignInAsync(user, authenProps);

                        var session = new SessionUserLogin();
                        session.UserId = user.Id;
                        session.UserName = user.UserName;
                        session.FullName = user.GivenName;
                        session.Email = user.Email;
                        session.EmployeeCode = user.EmployeeCode;
                        session.SessionTimeOut = _parameterService.GetSessionTimeout();
                        session.ExpireTimeSpan = DateTime.Now.AddMinutes(session.SessionTimeOut);
                        session.Picture = user.Picture;
                        session.BranchId = user.BranchId != null ? user.BranchId : null;
                        //session.CompanyCode = user.Company_Code;
                        //session.CompanyCode = "CO-3I";
                        //var permissions = _context.AdPermissions
                        //                            .Where(x => x.UserId == user.Id)
                        //                            .Select(x => new PermissionObject
                        //                            {
                        //                                //FunctionId = x.FunctionId,
                        //                                FunctionCode = x.Function.FunctionCode,
                        //                                FunctionTitle = x.Function.Title,
                        //                                //ResourceId = x.ResourceId,
                        //                                ResourceCode = x.Resource.ResourceCode,
                        //                                ResourceTitle = x.Resource.Title,
                        //                                ResourceApi = x.Resource.Api,
                        //                                GroupUserCode = x.GroupUserCode,
                        //                                GroupUserTitle = x.GroupUser.Title,
                        //                                RoleId = x.RoleId,
                        //                                RoleTitle = x.Role.Title,
                        //                            });
                        //session.Permissions = permissions.ToList();

                        //_logger.LogInformation("User logged in.");
                        return RedirectToLocal(returnUrl);
                    }
                    if (result.IsLockedOut)
                    {
                        _logger.LogWarning("User account locked out.");
                        return RedirectToAction(nameof(Lockout));
                    }
                    else
                    {
                        ModelState.AddModelError(string.Empty, "Invalid login attempt.");
                        return View(model);
                    }
                }
            }
            // If we got this far, something failed, redisplay form
            return View(model);
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult Lockout()
        {
            return View();
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult Register(string returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;
            return View();
        }

        public async Task<IActionResult> Logout()
        {
            var session = HttpContext.GetSessionUser();
            var user = _context.Users.FirstOrDefault(x => x.Active && x.UserName == session.UserName);
            user.IsOnline = 0;
            _context.Users.Update(user);
            _context.SaveChanges();

            await _signInManager.SignOutAsync();
            foreach (var cookie in Request.Cookies.Keys)
            {
                HttpContext.Response.Cookies.Delete(cookie);
            }
            _logger.LogInformation("User logged out.");
            return RedirectToAction(nameof(AccountController.Login), "/Admin/Account");
        }

        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public IActionResult ExternalLogin(string provider, string returnUrl = null)
        {
            // Request a redirect to the external login provider.
            var redirectUrl = Url.Action(nameof(ExternalLoginCallback), "Account", new { returnUrl });
            var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, redirectUrl);
            return Challenge(properties, provider);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> ExternalLoginCallback(string returnUrl = null, string remoteError = null)
        {
            if (remoteError != null)
            {
                ErrorMessage = $"Error from external provider: {remoteError}";
                return RedirectToAction(nameof(Login));
            }
            var info = await _signInManager.GetExternalLoginInfoAsync();
            if (info == null)
            {
                return RedirectToAction(nameof(Login));
            }

            // Sign in the user with this external login provider if the user already has a login.
            var result = await _signInManager.ExternalLoginSignInAsync(info.LoginProvider, info.ProviderKey, isPersistent: false, bypassTwoFactor: true);
            if (result.Succeeded)
            {
                _logger.LogInformation("User logged in with {Name} provider.", info.LoginProvider);
                return RedirectToLocal(returnUrl);
            }
            if (result.IsLockedOut)
            {
                return RedirectToAction(nameof(Lockout));
            }
            else
            {
                // If the user does not have an account, then ask the user to create an account.
                ViewData["ReturnUrl"] = returnUrl;
                ViewData["LoginProvider"] = info.LoginProvider;
                var email = info.Principal.FindFirstValue(ClaimTypes.Email);
                return View("ExternalLogin", new ExternalLoginViewModel { Email = email });
            }
        }

        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ExternalLoginConfirmation(ExternalLoginViewModel model, string returnUrl = null)
        {
            if (ModelState.IsValid)
            {
                // Get the information about the user from the external login provider
                var info = await _signInManager.GetExternalLoginInfoAsync();
                if (info == null)
                {
                    throw new ApplicationException("Error loading external login information during confirmation.");
                }
                var user = new AspNetUser { UserName = model.Email, Email = model.Email };
                var result = await _userManager.CreateAsync(user);
                if (result.Succeeded)
                {
                    result = await _userManager.AddLoginAsync(user, info);
                    if (result.Succeeded)
                    {
                        await _signInManager.SignInAsync(user, isPersistent: false);
                        _logger.LogInformation("User created an account using {Name} provider.", info.LoginProvider);
                        return RedirectToLocal(returnUrl);
                    }
                }
                AddErrors(result);
            }

            ViewData["ReturnUrl"] = returnUrl;
            return View(nameof(ExternalLogin), model);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> ConfirmEmail(string userId, string code)
        {
            if (userId == null || code == null)
            {
                return RedirectToAction(nameof(CalendarRegistrationController.Index), "EDMSCalendarRegistration");
            }
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                throw new ApplicationException($"Unable to load user with ID '{userId}'.");
            }
            var result = await _userManager.ConfirmEmailAsync(user, code);
            return View(result.Succeeded ? "ConfirmEmail" : "Error");
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult ForgotPassword()
        {
            return View();
        }

        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordViewModel model)
        {
            if (ModelState.IsValid)
            {
                var user = await _userManager.FindByEmailAsync(model.Email);
                //if (user == null || !(await _userManager.IsEmailConfirmedAsync(user)))
                if (user == null)
                {
                    // Don't reveal that the user does not exist or is not confirmed
                    //return RedirectToAction(nameof(ForgotPasswordConfirmation));
                    return Redirect("ForgotPasswordConfirmation");
                }

                // For more information on how to enable account confirmation and password reset please
                // visit https://go.microsoft.com/fwlink/?LinkID=532713
                var code = await _userManager.GeneratePasswordResetTokenAsync(user);
                var callbackUrl = Url.ResetPasswordCallbackLink(user.Id, code, Request.Scheme);

                var msg = CommonUtil.SendMail("support@3i.com.vn", user.Email, "Forgot password", callbackUrl, "mail.3i.com.vn", 587, "support@3i.com.vn", "Vietnam@3i");
                if (!msg.Error)
                    //return RedirectToAction(nameof(ForgotPasswordConfirmation));
                    return Redirect("ForgotPasswordConfirmation");
                else
                    return View();
            }

            // If we got this far, something failed, redisplay form
            return View(model);
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult ForgotPasswordConfirmation()
        {
            return View();
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult ResetPassword(string code = null)
        {
            if (code == null)
            {
                throw new ApplicationException("A code must be supplied for password reset.");
            }
            var model = new ResetPasswordViewModel { Code = code };
            return View(model);
        }

        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ResetPassword(ResetPasswordViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                // Don't reveal that the user does not exist
                return RedirectToAction(nameof(ResetPasswordConfirmation));
            }
            var result = await _userManager.ResetPasswordAsync(user, model.Code, model.Password);
            if (result.Succeeded)
            {
                //return RedirectToAction(nameof(ResetPasswordConfirmation));
                return Redirect("ResetPasswordConfirmation");
            }
            AddErrors(result);
            return View();
        }

        [HttpGet]
        [AllowAnonymous]
        public IActionResult ResetPasswordConfirmation()
        {
            return View();
        }


        [HttpGet]
        public IActionResult AccessDenied()
        {
            return View();
        }

        [HttpGet]
        public ActionResult DowloadApp()
        {
            string filePath = _hostingEnvironment.WebRootPath + "\\app\\";
            string fileName = "app-debug.apk";

            byte[] fileBytes = System.IO.File.ReadAllBytes(filePath + fileName);

            return File(fileBytes, "application/force-download", fileName);
        }

        #region Helpers

        private void AddErrors(IdentityResult result)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(string.Empty, error.Description);
            }
        }

        private IActionResult RedirectToLocal(string returnUrl)
        {
            if (Url.IsLocalUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }
            else
            {
                return Redirect("/admin");
            }
        }

        #endregion
    }
}