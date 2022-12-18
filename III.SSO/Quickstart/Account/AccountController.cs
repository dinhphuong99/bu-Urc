// Copyright (c) Brock Allen & Dominick Baier. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE in the project root for license information.


using IdentityModel;
using IdentityServer4.Services;
using IdentityServer4.Stores;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Authentication;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Principal;
using System.Threading.Tasks;
using Host.Configuration;
using Host.DbContexts;
using Host.Entities;
using Microsoft.AspNetCore.Authentication;
using Host.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Rendering;
using Hot.Models.AccountViewModels;
using Microsoft.Extensions.Options;
using Novell.Directory.Ldap;
using III.SSO.Services;

namespace IdentityServer4.Quickstart.UI
{
    /// <summary>
    /// This sample controller implements a typical login/logout/provision workflow for local and external accounts.
    /// The login service encapsulates the interactions with the user data store. This data store is in-memory only and cannot be used for production!
    /// The interaction service provides a way for the UI to communicate with identityserver for validation and context retrieval
    /// </summary>
    [Authorize]
    public class AccountController : Controller
    {
        private readonly IIdentityServerInteractionService _interaction;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IEmailSender _emailSender;
        private readonly ISmsSender _smsSender;
        private readonly ILogger _logger;
        private readonly AccountService _account;
        private readonly ApplicationDbContext _context;
        private readonly AppSettings _appSettings;
        private readonly IParameterService _parameterService;

        public AccountController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IEmailSender emailSender,
            ISmsSender smsSender,
            ILoggerFactory loggerFactory,
            IIdentityServerInteractionService interaction,
            IClientStore clientStore,
            IHttpContextAccessor httpContextAccessor,
            ApplicationDbContext context,
            IOptions<AppSettings> appSettings,
            IParameterService parameterService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _emailSender = emailSender;
            _smsSender = smsSender;
            _logger = loggerFactory.CreateLogger<AccountController>();
            _account = new AccountService(interaction, httpContextAccessor, clientStore);
            _context = context;
            _appSettings = appSettings.Value;
            _parameterService = parameterService;
        }


        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> Login(string returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;
            var vm = await _account.BuildLoginViewModelAsync(returnUrl);
            vm.AuthenProvider = true;

            if (vm.IsExternalLoginOnly)
            {
                return await ExternalLogin(vm.ExternalLoginScheme, returnUrl);
            }
            //vm.ListCompany = _context.E_Companys.OrderBy(o => o.Id).Select(x => new SelectListItem
            //{
            //    Value = x.Company_Code,
            //    Text = x.Company_Name,
            //}).ToList();
            return View(vm);
        }

        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(LoginViewModel model, string returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;
            if (ModelState.IsValid)
            {
                //model.ListCompany = _context.E_Companys.OrderBy(o => o.Id).Select(x => new SelectListItem
                //{
                //    Value = x.Company_Code,
                //    Text = x.Company_Name,
                //}).ToList();

                try
                {
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
                        var authenProps = new Microsoft.AspNetCore.Authentication.AuthenticationProperties
                        {
                            IsPersistent = model.RememberLogin,
                            ExpiresUtc = DateTimeOffset.UtcNow.Add(AccountOptions.RememberMeLoginDuration)
                            //ExpiresUtc = DateTimeOffset.UtcNow.AddMinutes(model.RememberLogin ? (15 * 24 * 60) : _parameterService.GetSessionTimeoutAdmin()),
                        };

                        if (model.AuthenProvider)
                        {
                            int ldapPort = _appSettings.ADConfigs.Port;
                            int ldapVersion = LdapConnection.Ldap_V3;
                            string ldapHost = _appSettings.ADConfigs.Host;
                            string loginDN = _appSettings.ADConfigs.LoginDN;
                            string password = _appSettings.ADConfigs.Password;
                            string objectDN = _appSettings.ADConfigs.ObjectDN;
                            LdapConnection conn = new LdapConnection();
                            try
                            {
                                conn.Connect(ldapHost, ldapPort);
                                conn.Bind(ldapVersion, loginDN, password);
                                var entities = conn.Search(objectDN, LdapConnection.SCOPE_SUB, $"(sAMAccountName={model.Username})", new string[] { "sAMAccountName", "mail", "name", "givenName", "sn", "userAccountControl", "objectGUID" }, false);
                                string userDn = null, userAc = null;
                                while (entities.hasMore())
                                {
                                    var entity = entities.next();
                                    var account = entity.getAttribute("sAMAccountName");
                                    //var email = entity.getAttribute("mail");
                                    //var name = entity.getAttribute("name");
                                    //var givenName = entity.getAttribute("givenName");
                                    //var familyName = entity.getAttribute("sn");
                                    var userAccountControl = entity.getAttribute("userAccountControl");
                                    if (account != null && account.StringValue.ToLower() == model.Username.ToLower())
                                    {
                                        userAc = userAccountControl.StringValue;
                                        userDn = entity.DN;
                                        break;
                                    }
                                }
                                if (string.IsNullOrWhiteSpace(userDn))
                                {
                                    ModelState.AddModelError(string.Empty, "Invalid login attempt.");
                                    return View(await _account.BuildLoginViewModelAsync(model));
                                }
                                if (!string.IsNullOrEmpty(userAc) && userAc.Equals("514"))
                                {
                                    ModelState.AddModelError(string.Empty, "Username was disabled in AD. Please contact to AD admin.");
                                    return View(await _account.BuildLoginViewModelAsync(model));
                                }

                                conn.Bind(userDn, model.Password);
                                conn.Disconnect();

                                try
                                {
                                    await _signInManager.SignInAsync(user, authenProps);

                                    _logger.LogInformation(1, "User logged in.");
                                    // Insert access log
                                    var accessLog = new ESEIM.Models.AdAccessLog();
                                    accessLog.UserId = model.Username;
                                    accessLog.Action = "Login";
                                    accessLog.AccessDate = DateTime.Now;
                                    accessLog.IpAddress = HttpContext.Connection?.RemoteIpAddress?.ToString();
                                    accessLog.Description = $"{model.Username} login to system";
                                    //accessLog.Code = returnUrl;
                                    //accessLog.Application = Request.Headers["User-Agent"].ToString();
                                    accessLog.AccessLogApplication = "Admin";
                                    _context.AdAccessLogs.Add(accessLog);
                                    await _context.SaveChangesAsync();

                                    return RedirectToLocal(returnUrl);
                                }
                                catch (Exception ex)
                                {
                                    ModelState.AddModelError(string.Empty, "Username or password incorrect.");
                                    return View(await _account.BuildLoginViewModelAsync(model));
                                }
                            }
                            catch (LdapException e)
                            {
                                //if (e.ResultCode == LdapException.NO_SUCH_OBJECT)
                                //{
                                //    ModelState.AddModelError(string.Empty, "No such entry");
                                //    return View(await _account.BuildLoginViewModelAsync(model));
                                //}
                                //else if (e.ResultCode == LdapException.NO_SUCH_ATTRIBUTE)
                                //{
                                //    ModelState.AddModelError(string.Empty, "No such attribute");
                                //    return View(await _account.BuildLoginViewModelAsync(model));
                                //}
                                //else 
                                if (e.ResultCode == LdapException.INVALID_CREDENTIALS)
                                {
                                    ModelState.AddModelError(string.Empty, "Username or password incorrect.");
                                    return View(await _account.BuildLoginViewModelAsync(model));
                                }
                                else
                                {
                                    ModelState.AddModelError(string.Empty, "Login to AD failed.");
                                    return View(await _account.BuildLoginViewModelAsync(model));
                                }
                            }
                        }
                        else
                        {
                            var verify = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
                            //var result = await _signInManager.PasswordSignInAsync(model.Username, model.Password, model.RememberLogin, lockoutOnFailure: false);
                            if (verify.Succeeded)
                            {                                                                                              
                                    await _signInManager.SignInAsync(user, authenProps);
                                    //_logger.LogInformation(1, "User logged in.");
                                    // Insert access log
                                    //var accessLog = new ESEIM.Models.AdAccessLog();
                                    //accessLog.UserId = model.Username;
                                    //accessLog.Action = "Login";
                                    //accessLog.AccessDate = DateTime.Now;
                                    //accessLog.IpAddress = HttpContext.Connection?.RemoteIpAddress?.ToString();
                                    //accessLog.Description = $"{model.Username} login to system";
                                    ////accessLog.Resource = returnUrl;
                                    ////accessLog.Application = Request.Headers["User-Agent"].ToString();
                                    //accessLog.AccessLogApplication = "Admin";
                                    //_context.AdAccessLogs.Add(accessLog);
                                    //await _context.SaveChangesAsync();

                                    return RedirectToLocal(returnUrl);
                            }
                            if (verify.RequiresTwoFactor)
                            {
                                return RedirectToAction(nameof(SendCode), new { ReturnUrl = returnUrl, RememberMe = model.RememberLogin });
                            }
                            if (verify.IsLockedOut)
                            {
                                _logger.LogWarning(2, "User account locked out.");
                                return View("Lockout");
                            }
                            else
                            {
                                ModelState.AddModelError(string.Empty, "Username or password incorrect.");
                                return View(await _account.BuildLoginViewModelAsync(model));
                            }
                        }
                    }
                }
                catch (Exception e)
                {
                    _logger.LogError(3, e.Message);
                    ModelState.AddModelError(string.Empty, "An error occurred while login.");
                }
            }

            // If we got this far, something failed, redisplay form
            return View(await _account.BuildLoginViewModelAsync(model));
        }

        //
        // GET: /Account/SendCode
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult> SendCode(string returnUrl = null, bool rememberMe = false)
        {
            var user = await _signInManager.GetTwoFactorAuthenticationUserAsync();
            if (user == null)
            {
                return View("Error");
            }
            var userFactors = await _userManager.GetValidTwoFactorProvidersAsync(user);
            var factorOptions = userFactors.Select(purpose => new SelectListItem { Text = purpose, Value = purpose }).ToList();
            return View(new SendCodeViewModel { Providers = factorOptions, ReturnUrl = returnUrl, RememberMe = rememberMe });
        }

        //
        // POST: /Account/SendCode
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SendCode(SendCodeViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View();
            }

            var user = await _signInManager.GetTwoFactorAuthenticationUserAsync();
            if (user == null)
            {
                return View("Error");
            }

            // Generate the token and send it
            var code = await _userManager.GenerateTwoFactorTokenAsync(user, model.SelectedProvider);
            if (string.IsNullOrWhiteSpace(code))
            {
                return View("Error");
            }

            var message = "Your security code is: " + code;
            if (model.SelectedProvider == "Email")
            {
                await _emailSender.SendEmailAsync(await _userManager.GetEmailAsync(user), "Security Code", message);
            }
            else if (model.SelectedProvider == "Phone")
            {
                await _smsSender.SendSmsAsync(await _userManager.GetPhoneNumberAsync(user), message);
            }

            return RedirectToAction(nameof(VerifyCode), new { Provider = model.SelectedProvider, ReturnUrl = model.ReturnUrl, RememberMe = model.RememberMe });
        }

        //
        // GET: /Account/VerifyCode
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyCode(string provider, bool rememberMe, string returnUrl = null)
        {
            // Require that the user has already logged in via username/password or external login
            var user = await _signInManager.GetTwoFactorAuthenticationUserAsync();
            if (user == null)
            {
                return View("Error");
            }
            return View(new VerifyCodeViewModel { Provider = provider, ReturnUrl = returnUrl, RememberMe = rememberMe });
        }

        //
        // POST: /Account/VerifyCode
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> VerifyCode(VerifyCodeViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            // The following code protects for brute force attacks against the two factor codes.
            // If a user enters incorrect codes for a specified amount of time then the user account
            // will be locked out for a specified amount of time.
            var result = await _signInManager.TwoFactorSignInAsync(model.Provider, model.Code, model.RememberMe, model.RememberBrowser);
            if (result.Succeeded)
            {
                return RedirectToLocal(model.ReturnUrl);
            }
            if (result.IsLockedOut)
            {
                _logger.LogWarning(7, "User account locked out.");
                return View("Lockout");
            }
            else
            {
                ModelState.AddModelError(string.Empty, "Invalid code.");
                return View(model);
            }
        }


        /// <summary>
        /// Show logout page
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> Logout(string logoutId)
        {
            var vm = await _account.BuildLogoutViewModelAsync(logoutId);

            if (vm.ShowLogoutPrompt == false)
            {
                // no need to show prompt
                return await Logout(vm);
            }

            return View(vm);
        }

        /// <summary>
        /// Handle logout page postback
        /// </summary>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Logout(LogoutInputModel model)
        {
            var vm = await _account.BuildLoggedOutViewModelAsync(model.LogoutId);
            if (vm.TriggerExternalSignout)
            {
                string url = Url.Action("Logout", new { logoutId = vm.LogoutId });
                try
                {
                    // hack: try/catch to handle social providers that throw
                    await HttpContext.Authentication.SignOutAsync(vm.ExternalAuthenticationScheme, new Microsoft.AspNetCore.Http.Authentication.AuthenticationProperties { RedirectUri = url });
                }
                catch (NotSupportedException) // this is for the external providers that don't have signout
                {
                }
                catch (InvalidOperationException) // this is for Windows/Negotiate
                {
                }
            }

            var userName = HttpContext.User.Identity.Name;
            // Insert access log
            var accessLog = new ESEIM.Models.AdAccessLog();
            //accessLog.UserId = userName;
            //accessLog.Action = "Logout";
            //accessLog.AccessDate = DateTime.Now;
            //accessLog.IpAddress = HttpContext.Connection?.RemoteIpAddress?.ToString();
            //accessLog.Description = $"{userName} logout";
            //accessLog.AccessLogApplication = "Admin";
            //_context.AdAccessLogs.Add(accessLog);
            //await _context.SaveChangesAsync();
            foreach (var cookie in Request.Cookies.Keys)
            {
                HttpContext.Response.Cookies.Delete(cookie);
            }
            // delete local authentication cookie
            await HttpContext.Authentication.SignOutAsync();

            return View("LoggedOut", vm);
        }

        // GET: /Account/ConfirmEmail
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> ConfirmEmail(string userId, string code)
        {
            if (userId == null || code == null)
            {
                return View("Error");
            }
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return View("Error");
            }
            var result = await _userManager.ConfirmEmailAsync(user, code);
            return View(result.Succeeded ? "ConfirmEmail" : "Error");
        }

        //
        // GET: /Account/ForgotPassword
        [HttpGet]
        [AllowAnonymous]
        public IActionResult ForgotPassword()
        {
            return View();
        }

        //
        // POST: /Account/ForgotPassword
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordViewModel model)
        {
            if (ModelState.IsValid)
            {
                var user = await _userManager.FindByEmailAsync(model.Email);
                if (user == null || !(await _userManager.IsEmailConfirmedAsync(user)))
                {
                    // Don't reveal that the user does not exist or is not confirmed
                    return View("ForgotPasswordConfirmation");
                }

                // For more information on how to enable account confirmation and password reset please visit http://go.microsoft.com/fwlink/?LinkID=532713
                // Send an email with this link
                var code = await _userManager.GeneratePasswordResetTokenAsync(user);
                var callbackUrl = Url.Action("ResetPassword", "Account", new { userId = user.Id, code = code }, protocol: HttpContext.Request.Scheme);
                await _emailSender.SendEmailAsync(model.Email, "Reset Password",
                   $"Please reset your password by clicking here: <a href='{callbackUrl}'>link</a>");
                return View("ForgotPasswordConfirmation");
            }

            // If we got this far, something failed, redisplay form
            return View(model);
        }

        //
        // GET: /Account/ForgotPasswordConfirmation
        [HttpGet]
        [AllowAnonymous]
        public IActionResult ForgotPasswordConfirmation()
        {
            return View();
        }

        //
        // GET: /Account/ResetPassword
        [HttpGet]
        [AllowAnonymous]
        public IActionResult ResetPassword(string code = null)
        {
            return code == null ? View("Error") : View();
        }

        //
        // POST: /Account/ResetPassword
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ResetPassword(ResetPasswordViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            var user = await _userManager.FindByNameAsync(model.Email);
            if (user == null)
            {
                // Don't reveal that the user does not exist
                return RedirectToAction(nameof(AccountController.ResetPasswordConfirmation), "Account");
            }
            var result = await _userManager.ResetPasswordAsync(user, model.Code, model.Password);
            if (result.Succeeded)
            {
                return RedirectToAction(nameof(AccountController.ResetPasswordConfirmation), "Account");
            }
            AddErrors(result);
            return View();
        }

        //
        // GET: /Account/ResetPasswordConfirmation
        [HttpGet]
        [AllowAnonymous]
        public IActionResult ResetPasswordConfirmation()
        {
            return View();
        }

        #region ExternalLogin

        /// <summary>
        /// initiate roundtrip to external authentication provider
        /// </summary>
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> ExternalLogin(string provider, string returnUrl)
        {
            returnUrl = Url.Action("ExternalLoginCallback", new { returnUrl = returnUrl });

            // windows authentication is modeled as external in the asp.net core authentication manager, so we need special handling
            if (AccountOptions.WindowsAuthenticationSchemes.Contains(provider))
            {
                // but they don't support the redirect uri, so this URL is re-triggered when we call challenge
                if (HttpContext.User is WindowsPrincipal)
                {
                    var props = new Microsoft.AspNetCore.Http.Authentication.AuthenticationProperties();
                    props.Items.Add("scheme", AccountOptions.WindowsAuthenticationProviderName);

                    var id = new ClaimsIdentity(provider);
                    id.AddClaim(new Claim(ClaimTypes.NameIdentifier, HttpContext.User.Identity.Name));
                    id.AddClaim(new Claim(ClaimTypes.Name, HttpContext.User.Identity.Name));

                    await HttpContext.Authentication.SignInAsync(IdentityServerConstants.ExternalCookieAuthenticationScheme, new ClaimsPrincipal(id), props);
                    return Redirect(returnUrl);
                }
                else
                {
                    // this triggers all of the windows auth schemes we're supporting so the browser can use what it supports
                    return new ChallengeResult(AccountOptions.WindowsAuthenticationSchemes);
                }
            }
            else
            {
                // start challenge and roundtrip the return URL
                var props = new Microsoft.AspNetCore.Authentication.AuthenticationProperties
                {
                    RedirectUri = returnUrl,
                    Items = { { "scheme", provider } }
                };
                return new ChallengeResult(provider, props);
            }
        }

        /// <summary>
        /// Post processing of external authentication
        /// </summary>
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> ExternalLoginCallback(string returnUrl)
        {
            // read external identity from the temporary cookie
            var info = await HttpContext.Authentication.GetAuthenticateInfoAsync(IdentityServerConstants.ExternalCookieAuthenticationScheme);
            var tempUser = info?.Principal;
            if (tempUser == null)
            {
                throw new Exception("External authentication error");
            }

            // retrieve claims of the external user
            var claims = tempUser.Claims.ToList();

            // try to determine the unique id of the external user - the most common claim type for that are the sub claim and the NameIdentifier
            // depending on the external provider, some other claim type might be used
            var userIdClaim = claims.FirstOrDefault(x => x.Type == JwtClaimTypes.Subject);
            if (userIdClaim == null)
            {
                userIdClaim = claims.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier);
            }
            if (userIdClaim == null)
            {
                throw new Exception("Unknown userid");
            }

            // remove the user id claim from the claims collection and move to the userId property
            // also set the name of the external authentication provider
            claims.Remove(userIdClaim);
            var provider = info.Properties.Items["scheme"];
            var userId = userIdClaim.Value;

            // check if the external user is already provisioned
            //----------
            //var user = _users.FindByExternalProvider(provider, userId);
            //if (user == null)
            //{
            //    // this sample simply auto-provisions new external user
            //    // another common approach is to start a registrations workflow first
            //    user = _users.AutoProvisionUser(provider, userId, claims);
            //}

            var additionalClaims = new List<Claim>();

            // if the external system sent a session id claim, copy it over
            var sid = claims.FirstOrDefault(x => x.Type == JwtClaimTypes.SessionId);
            if (sid != null)
            {
                additionalClaims.Add(new Claim(JwtClaimTypes.SessionId, sid.Value));
            }

            // if the external provider issued an id_token, we'll keep it for signout
            Microsoft.AspNetCore.Authentication.AuthenticationProperties props = null;
            var id_token = info.Properties.Items["id_token"];
            if (id_token != null)
            {
                props = new Microsoft.AspNetCore.Authentication.AuthenticationProperties();
                props.StoreTokens(new[] { new AuthenticationToken { Name = "id_token", Value = id_token } });
            }

            // issue authentication cookie for user
            //await HttpContext.Authentication.SignInAsync(user.SubjectId, user.Username, provider, props, additionalClaims.ToArray());

            // delete temporary cookie used during external authentication
            await HttpContext.Authentication.SignOutAsync(IdentityServerConstants.ExternalCookieAuthenticationScheme);

            // validate return URL and redirect back to authorization endpoint
            if (_interaction.IsValidReturnUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }

            return Redirect("~/");
        }


        #endregion

        #region Helpers

        private void AddErrors(IdentityResult result)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(string.Empty, error.Description);
            }
        }

        private Task<ApplicationUser> GetCurrentUserAsync()
        {
            return _userManager.GetUserAsync(HttpContext.User);
        }

        private IActionResult RedirectToLocal(string returnUrl)
        {
            if (Url.IsLocalUrl(returnUrl))
            {
                return Redirect(returnUrl);
            }
            else
            {
                return RedirectToAction(nameof(HomeController.Index), "Home");
            }
        }

        #endregion
    }
}