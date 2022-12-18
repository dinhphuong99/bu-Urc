using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class AccountLoginController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly UserManager<AspNetUser> _userManager;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<AccountLoginController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public AccountLoginController(EIMDBContext context, UserManager<AspNetUser> userManager, IHostingEnvironment hostingEnvironment, IStringLocalizer<AccountLoginController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _userManager = userManager;
            _hostingEnvironment = hostingEnvironment;
            _context = context;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
        }
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> ChangePassword([FromBody]AccountLoginModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var us = await _context.Users.FirstOrDefaultAsync(x => x.Id == obj.Id);
            if (us != null)
            {
                var checkPassword = await _userManager.CheckPasswordAsync(us, obj.PasswordOld);
                if (checkPassword)
                {
                    string code = await _userManager.GeneratePasswordResetTokenAsync(us);
                    var result = await _userManager.ResetPasswordAsync(us, code, obj.PasswordNew);
                    if (result.Succeeded)
                    {
                        var a = await _context.SaveChangesAsync();
                        msg.Title = _stringLocalizer["ACL_MSG_UPDATE_PASS_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["ACL_MSG_ERR_UPDATE_PASS"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ACL_MSG_OLD_PASS_INCORRECT"];
                }
            }
            else
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["ACL_MSG_USER_NOT_EXIST"];
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<IActionResult> ChangeImage(AccountLoginModel obj, IFormFile image)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var us = await _context.Users.FirstOrDefaultAsync(x => x.Id == obj.Id);
                if (us != null)
                {
                    if (image != null && image.Length > 0)
                    {
                        var url = string.Empty;
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                        var fileName = Path.GetFileName(image.FileName);
                        fileName = Path.GetFileNameWithoutExtension(fileName)
                         + "_"
                         + Guid.NewGuid().ToString().Substring(0, 8)
                         + Path.GetExtension(fileName);
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await image.CopyToAsync(stream);
                        }
                        url = "/uploads/images/" + fileName;
                        us.Picture = url;
                        var result = await _context.SaveChangesAsync();
                        msg.Title = _stringLocalizer["ACL_MSG_UPDATE_AVATAR_SUCCESS"];
                    }
                }
                else
                {
                    msg.Title = _stringLocalizer["ACL_MSG_USER_NOT_EXIST"];
                    msg.Error = true;
                }
            }
            catch (Exception ex)
            {
                msg.Title = _stringLocalizer["ACL_MSG_UPDATE_AVATAR_ERR"];
                msg.Error = true;
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<object> GetItem()
        {
            try
            {
                var Id = ESEIM.AppContext.UserId;
                var user = await _context.Users.SingleAsync(x => x.Id == Id);
                var temp = new
                {
                    user.Id,
                    user.UserName,
                    user.GivenName,
                    user.Picture,
                };
                return Json(temp);
            }
            catch (Exception ex)
            {
                return Json(new JMessage() { Error = true, Title = String.Format(CommonUtil.ResourceValue("MSG_LOAD_FAIL"), CommonUtil.ResourceValue("USER_USERNAME").ToLower()), Object = ex });
            }
        }
        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }).Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
    public class AccountLoginModel
    {
        public string Id { get; set; }
        public string PasswordOld { get; set; }
        public string PasswordNew { get; set; }
        public string InputPasswordNew { get; set; }
    }
}