using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using ESEIM.Models;
using static ESEIM.Startup;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using ESEIM;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
namespace III.Admin.Controllers
{

    [Area("Admin")]
    public class RoleController : BaseController
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        private readonly ILogger _logger;
        private readonly IActionLogService _actionLog;
        private readonly IStringLocalizer<RoleController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public class JTableModelCustom : JTableModel
        {
            public string Code { set; get; }
            public string Name { set; get; }
            public bool? Status { set; get; }
        }
        public RoleController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager, RoleManager<AspNetRole> roleManager, ILogger<RoleController> logger, IActionLogService actionLog, IStringLocalizer<RoleController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _userManager = userManager;
            _context = context;
            _roleManager = roleManager;
            _appSettings = appSettings.Value;
            _logger = logger;
            _actionLog = actionLog;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;

        }
        public IActionResult Index()
        {
            ViewData["Title"] = _stringLocalizer["ADM_ROLE_TITLE_ROLE"];
            return View();
        }
        [HttpPost]
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {
            ////_logger.LogInformation(LoggingEvents.LogDb, "Get list role");
            ////_actionLog.InsertActionLog("ASP_NET_ROLES", "Get list role", null, null, "JTable");

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = _context.Roles
                .Where(p => p.Code != "ROOT"
                && (string.IsNullOrEmpty(jTablePara.Code) || p.Code.ToLower().Contains(jTablePara.Code.ToLower()))
                && (string.IsNullOrEmpty(jTablePara.Name) || p.Title.ToLower().Contains(jTablePara.Name.ToLower()))
                && (jTablePara.Status == null || p.Status == jTablePara.Status))
                .Select(x => new { x.Id, x.Title, x.Name, x.Description, x.Ord, x.ConcurrencyStamp, x.Code, x.Status, x.CreatedDate })
                .OrderUsingSortExpression(jTablePara.QueryOrderBy)
                .AsNoTracking();
            var count = query.ToList().Count();
            var data = query
                .Skip(intBeginFor).Take(jTablePara.Length)
                .ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Title", "Description", "Name", "ConcurrencyStamp", "Code", "Status", "CreatedDate");
            return Json(jdata);
        }
        [HttpPost]
        public bool CheckRoleUsed([FromBody]AspNetRole obj)
        {
            var userInGroup = _context.AdUserInGroups.Where(x => x.RoleId == obj.Id).AsNoTracking().ToList();
            var permission = _context.AdPermissions.Where(x => x.RoleId == obj.Id).AsNoTracking().ToList();
            if (userInGroup.Count > 0 || permission.Count > 0)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        //[HttpPost]
        //public async Task<JsonResult> Insert([FromBody]AspNetRole obj)
        //{
        //    //_logger.LogInformation(LoggingEvents.LogDb, "Insert role");
        //    var msg = new JMessage() { Error = false };
        //    obj.NormalizedName = obj.Name.ToUpper();
        //    try
        //    {
        //        obj.CreatedDate = DateTime.Now;
        //        obj.CreatedBy = User.Identity.Name;
        //        await _roleManager.CreateAsync(obj);

        //        msg.Title = String.Format(_stringLocalizer["MSG_ADD_SUCCESS"), _stringLocalizer["ROLE").ToLower());
        //        //_logger.LogInformation(LoggingEvents.LogDb, "Insert role successfully");
        //    }
        //    catch (Exception)
        //    {
        //        msg.Error = true;
        //        msg.Title = String.Format(_stringLocalizer["MSG_ADD_FAIL"), _stringLocalizer["ROLE").ToLower());
        //        //_logger.LogError(LoggingEvents.LogDb, "Insert role fail");
        //    }
        //    return Json(msg);
        //}
        [HttpPost]
        public async Task<JsonResult> Insert([FromBody]AspNetRole obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var role = _context.Roles.FirstOrDefault(x => x.Code == obj.Code);
                if (role == null)
                {
                    var r = _context.Roles.FirstOrDefault(x => x.Title == obj.Title || x.Name == obj.Title);
                    if (r == null)
                    {
                        role = new AspNetRole();
                        role.Name = obj.Code;
                        role.NormalizedName = obj.Code.ToUpper();
                        role.Code = obj.Code;
                        role.Title = obj.Title;
                        role.Status = obj.Status;
                        role.Description = obj.Description;
                        role.CreatedDate = DateTime.Now;
                        role.CreatedBy = User.Identity.Name;

                        await _roleManager.CreateAsync(role);

                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["ADM_ROLE_LBL_ROLE"]);
                        ////_logger.LogInformation(LoggingEvents.LogDb, "Insert role successfully");
                        //_actionLog.InsertActionLog("ASP_NET_ROLES", "Insert role successfully", null, obj, "Insert");
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_stringLocalizer["COM_ERR_EXIST"], _stringLocalizer["ADM_ROLE_CURD_LBL_ROLE_CODE"]);
                        //_logger.LogError(LoggingEvents.LogDb, "Insert role fail");
                        //_actionLog.InsertActionLog("ASP_NET_ROLES", "Insert role failed: Role name is exists", null, null, "Error");
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_ERR_EXIST"], _stringLocalizer["ADM_ROLE_CURD_LBL_ROLE_CODE"]);
                    //_logger.LogError(LoggingEvents.LogDb, "Insert role fail");
                    //_actionLog.InsertActionLog("ASP_NET_ROLES", "Insert role failed: Role code is exists", null, null, "Error");

                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAIL"], _stringLocalizer["ADM_ROLE_LBL_ROLE"]);
                //_logger.LogError(LoggingEvents.LogDb, "Insert role fail");
                //_actionLog.InsertActionLog("ASP_NET_ROLES", "Insert role failed: " + ex.Message, null, null, "Error");

            }
            return Json(msg);
        }
        [HttpPost]
        public async Task<JsonResult> Update([FromBody]AspNetRole obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                ////_logger.LogInformation(LoggingEvents.LogDb, "Update role");
                AspNetRole objUpdate = await _roleManager.FindByIdAsync(obj.Id);
                var objOld = CommonUtil.Clone(objUpdate);
                if (objUpdate != null)
                {
                    var lstOther = _context.Roles.Where(x => x.Id != objUpdate.Id && (x.Title == obj.Title || x.Name == obj.Title));
                    if (lstOther.Any())
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_sharedResources["COM_ERR_EXIST"], _stringLocalizer["ADM_ROLE_CURD_LBL_ROLE_NAME"]);
                        //_logger.LogError(LoggingEvents.LogDb, "Update role fail");
                        //_actionLog.InsertActionLog("ASP_NET_ROLES", "Update role failed: Role name is exists", null, null, "Error");
                    }
                    else
                    {
                        if (objUpdate.Code != obj.Code)
                        {
                            msg.Error = true;
                            msg.Title = String.Format(_sharedResources["COM_ERR_CODE_CHANGE"], _stringLocalizer["ADM_ROLE_LBL_ROLE"]);
                            //_logger.LogError(LoggingEvents.LogDb, "Update group user fail");
                            //_actionLog.InsertActionLog("ASP_NET_ROLES", "Update role fail: Role code can't change", null, null, "Error");

                        }
                        else
                        {
                            //objUpdate.Name = obj.Title;
                            //objUpdate.NormalizedName = obj.Title.ToUpper();
                            //objUpdate.Code = obj.Code;
                            objUpdate.Title = obj.Title;
                            objUpdate.Status = obj.Status;
                            objUpdate.Description = obj.Description;

                            await _roleManager.UpdateAsync(objUpdate);
                            msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["ADM_ROLE_LBL_ROLE"]);
                            ////_logger.LogInformation(LoggingEvents.LogDb, "Update role successfully");
                            //_actionLog.InsertActionLog("ASP_NET_ROLES", "Update role successfully", objOld, obj, "Update");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer["ADM_ROLE_LBL_ROLE"]);
                //_logger.LogError(LoggingEvents.LogDb, "Update role fail");
                //_actionLog.InsertActionLog("ASP_NET_ROLES", "Update role failed: " + ex.Message, null, null, "Error");
            }
            return Json(msg);
        }
        //[HttpPost]
        //public async Task<JsonResult> Delete(AspNetRole obj)
        //{
        //    //_logger.LogInformation(LoggingEvents.LogDb, "Delete role");
        //    try
        //    {
        //        await _roleManager.DeleteAsync(obj);
        //        //_logger.LogInformation(LoggingEvents.LogDb, "Delete role successfully");
        //        return Json(new JMessage() { Error = false, Title = String.Format(_stringLocalizer["MSG_DELETE_SUCCESS"), _stringLocalizer["ROLE").ToLower()) });

        //    }
        //    catch (Exception ex)
        //    {
        //        //_logger.LogError(LoggingEvents.LogDb, "Delete role fail");
        //        return Json(new JMessage() { Error = true, Title = String.Format(_stringLocalizer["MSG_DELETE_FAIL"), _stringLocalizer["ROLE").ToLower()) });
        //    }
        //}
        [HttpPost]
        public async Task<JsonResult> Delete(string id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                ////_logger.LogInformation(LoggingEvents.LogDb, "Delete role");
                AspNetRole obj = await _roleManager.FindByIdAsync(id);
                if (obj != null)
                {
                    var lstRef = _context.AdUserInGroups.Where(x => x.RoleId == id);
                    if (lstRef.Any())
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_sharedResources["COM_ERR_OBJ_REF"], _stringLocalizer["ADM_ROLE_LBL_ROLE"]);
                        //_logger.LogError(LoggingEvents.LogDb, "Delete role fail");
                        //_actionLog.InsertActionLog("ASP_NET_ROLES", "Delete role failed", null, null, "Error");
                    }
                    else
                    {
                        var userRole = _context.UserRoles.FirstOrDefault(x => x.RoleId == id);
                        var userInGroup = _context.AdUserInGroups.FirstOrDefault(x => x.RoleId == id);
                        var permission = _context.AdPermissions.FirstOrDefault(x => x.RoleId == id);
                        if (userRole != null || userInGroup != null || permission != null)
                        {
                            msg.Error = true;
                            msg.Title = String.Format(_sharedResources["COM_ERR_OBJ_REF"], _stringLocalizer["ADM_ROLE_LBL_ROLE"]);
                            //_logger.LogError(LoggingEvents.LogDb, "Delete role fail");
                            //_actionLog.InsertActionLog("ASP_NET_ROLES", "Delete role failed", null, null, "Error");
                        }
                        else
                        {
                            await _roleManager.DeleteAsync(obj);
                            msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["ADM_ROLE_LBL_ROLE"]);
                            ////_logger.LogInformation(LoggingEvents.LogDb, "Delete role successfully");
                            //_actionLog.InsertActionLog("ASP_NET_ROLES", "Delete role successfully", obj, null, "Delete");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer["ADM_ROLE_LBL_ROLE"]);
                //_logger.LogError(LoggingEvents.LogDb, "Delete role fail");
                //_actionLog.InsertActionLog("ASP_NET_ROLES", "Delete role failed: " + ex.Message, null, null, "Error");

            }
            return Json(msg);
        }
        [HttpPost]
        public async Task<JsonResult> DeleteItems([FromBody]List<string> listId)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                ////_logger.LogInformation(LoggingEvents.LogDb, "Delete list role");
                List<string> listRef = new List<string>();
                List<string> listDel = new List<string>();
                List<AspNetRole> listAspNetRole = new List<AspNetRole>();
                foreach (var id in listId)
                {
                    AspNetRole obj = await _roleManager.FindByIdAsync(id);
                    if (obj != null)
                    {
                        var lstRef = _context.AdUserInGroups.FirstOrDefault(x => x.RoleId == id);
                        if (lstRef != null)
                        {
                            listRef.Add(id);
                        }
                        else
                        {
                            var p = _context.AdPermissions.FirstOrDefault(x => x.RoleId == id);
                            if (p != null)
                            {
                                listRef.Add(id);
                            }
                            else
                            {
                                listDel.Add(id);
                            }
                        }
                    }
                }
                if (listRef.Count > 0)
                {
                    if (listDel.Count > 0)
                    {
                        foreach (var id in listDel)
                        {
                            AspNetRole obj = await _roleManager.FindByIdAsync(id);
                            listAspNetRole.Add(obj);
                            await _roleManager.DeleteAsync(obj);
                        }
                        msg.Error = true;
                        msg.Title = String.Format(_sharedResources["COM_DEL_SUCCESS_LIST_ITEM_BUT_REF"], _stringLocalizer["ADM_ROLE_LBL_ROLE"]);
                        //_logger.LogError(LoggingEvents.LogDb, "Delete part of the role list successfully");
                        _actionLog.InsertActionLogDeleteItem("ASP_NET_ROLES", "Delete part of the role list successfully", listAspNetRole.ToArray(), null, "Delete");
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_sharedResources["COM_ERR_LIST_OBJ_REF"], _stringLocalizer["ADM_ROLE_LBL_ROLE"]);
                        //_logger.LogError(LoggingEvents.LogDb, "Delete list role fail");
                        _actionLog.InsertActionLogDeleteItem("ASP_NET_ROLES", "Delete list role fail", null, null, "Error");
                    }
                }
                else
                {
                    if (listDel.Count > 0)
                    {
                        foreach (var id in listDel)
                        {
                            AspNetRole obj = await _roleManager.FindByIdAsync(id);
                            listAspNetRole.Add(obj);
                            await _roleManager.DeleteAsync(obj);
                        }
                        msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_LIST_SUCCESS"], _stringLocalizer["ADM_ROLE_LBL_ROLE"]);
                        ////_logger.LogInformation(LoggingEvents.LogDb, "Delete list role successfully");
                        _actionLog.InsertActionLogDeleteItem("ASP_NET_ROLES", "Delete list role successfully", listAspNetRole.ToArray(), null, "Delete");
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_LIST_FAIL"], _stringLocalizer["ADM_ROLE_LBL_ROLE"]);
                //_logger.LogError(LoggingEvents.LogDb, "Delete list role fail");
                _actionLog.InsertActionLogDeleteItem("ASP_NET_ROLES", "Delete list role failed: " + ex.Message, null, null, "Error");
            }
            return Json(msg);
        }

        //[HttpPost]
        //public async Task<JsonResult> DeleteItems([FromBody]List<AspNetRole> obj)
        //{
        //    //_logger.LogInformation(LoggingEvents.LogDb, "Delete list role");
        //    try
        //    {
        //        foreach (var item in obj)
        //        {
        //            await _roleManager.DeleteAsync(item);
        //        }
        //        //_logger.LogInformation(LoggingEvents.LogDb, "Delete list role successfully");
        //        return Json(new JMessage() { Error = false, Title = String.Format(_stringLocalizer["MSG_DELETE_LIST_SUCCESS"), _stringLocalizer["ROLE").ToLower()) });
        //    }
        //    catch (Exception ex)
        //    {
        //        //_logger.LogError(LoggingEvents.LogDb, "Delete list role fail");
        //        return Json(new JMessage() { Error = true, Title = String.Format(_stringLocalizer["MSG_DELETE_LIST_FAIL"), _stringLocalizer["ROLE").ToLower()) });
        //    }
        //}
        [HttpPost]
        public object GetItem([FromBody]AspNetRole obj)
        {
            try
            {
                var temp = _roleManager.Roles.Select(x => new { x.Id, x.Title, x.Name, x.Code, x.Status, x.Description, x.Ord, x.ConcurrencyStamp }).Single(x => x.Id == obj.Id);
                return Json(temp);
            }
            catch (Exception ex)
            {
                return Json(new JMessage() { Error = true, Title = String.Format(_stringLocalizer["MSG_LOAD_FAIL"], _stringLocalizer["ROLE"]) });
            }
        }

        [HttpPost]
        public async Task<IActionResult> GetMapPermission([FromBody]List<string> listCode)
        {
            try
            {
                var result = await GetListPermission(listCode);
                return Json(result);
            }
            catch (Exception ex)
            {
                return Json(new JMessage() { Error = true, Title = "An error occurred while get map permission" });
            }
        }

        [HttpGet]
        public async Task<IActionResult> ExportMapPermision([FromQuery]List<string> code)
        {
            try
            {
                var result = await GetListPermission(code);

                return Json(result);
            }
            catch (Exception ex)
            {
                return Json(new JMessage() { Error = true, Title = "An error occurred while export map permission" });
            }
        }

        private async Task<List<MapOfRole>> GetListPermission(List<string> listCode)
        {
            List<MapOfRole> result = new List<MapOfRole>();

            var listRoles = await _context.Roles.Where(x => listCode.Any(y => y == x.Code)).ToListAsync();
            if (listRoles.Count > 0)
            {
                var listPermission = _context.AdPermissions
                                            .Include(i => i.GroupUser)
                                            .Include(i => i.Role)
                                            .Include(i => i.Application)
                                            .Include(i => i.Function)
                                            .Include(i => i.Resource)
                                            .Where(x => x.UserId == null && listRoles.Any(y => y.Id == x.RoleId))
                                            .ToList();

                var listGroupByRole = listPermission.OrderBy(o => o.Role.Code).GroupBy(g => g.RoleId).ToList();
                if (listGroupByRole.Count > 0)
                {
                    foreach (var groupRole in listRoles)
                    {
                        var mapOfRole = new MapOfRole();
                        mapOfRole.RoleCode = groupRole.Code;
                        mapOfRole.RoleName = groupRole.Title;
                        mapOfRole.MapOfApplication = new List<MapOfApplication>();

                        var listGroupByApp = listPermission.Where(x => x.RoleId == groupRole.Id).OrderBy(o => o.ApplicationCode).GroupBy(g => g.ApplicationCode).ToList();
                        if (listGroupByApp.Count > 0)
                        {
                            foreach (var groupApp in listGroupByApp)
                            {
                                var mapOfApplication = new MapOfApplication();

                                var groupFirst = groupApp.First();
                                mapOfApplication.ApplicationCode = groupFirst.Application.ApplicationCode;
                                mapOfApplication.ApplicationName = groupFirst.Application.Title;
                                mapOfApplication.MapOfGroupRole = new List<MapOfGroupRole>();

                                var listGroupByGroupRole = groupApp.OrderBy(o => o.GroupUser.Title).GroupBy(g => g.GroupUserCode).ToList();
                                if (listGroupByGroupRole.Count > 0)
                                {
                                    foreach (var groupGroupRole in listGroupByGroupRole)
                                    {
                                        var mapOfGroupRole = new MapOfGroupRole();

                                        var groupGroupFirst = groupGroupRole.First();
                                        mapOfGroupRole.GroupUserCode = groupGroupFirst.GroupUser.GroupUserCode;
                                        mapOfGroupRole.GroupUserName = groupGroupFirst.GroupUser.Title;
                                        mapOfGroupRole.MapOfFunction = new List<MapOfFunction>();

                                        var listGroupByFunc = groupGroupRole.OrderBy(o => o.Function.ParentCode).ThenBy(o => o.Function.Title).GroupBy(g => g.FunctionCode).ToList();
                                        if (listGroupByFunc.Count > 0)
                                        {
                                            foreach (var groupFunc in listGroupByFunc)
                                            {
                                                var mapOfFunction = new MapOfFunction();

                                                var funcFirst = groupFunc.First();
                                                mapOfFunction.FunctionCode = funcFirst.Function.FunctionCode;
                                                mapOfFunction.FunctionName = funcFirst.Function.Title;
                                                mapOfFunction.MapOfResource = groupFunc.OrderBy(o => o.Resource.Title)
                                                                                       .Select(x => new MapOfResource
                                                                                       {
                                                                                           ResourceCode = x.ResourceCode,
                                                                                           ResourceName = x.Resource.Title,
                                                                                           Api = x.Resource.Api,
                                                                                           Scope = x.Resource.Scope,
                                                                                           Status = x.Resource.Status
                                                                                       }).ToList();

                                                mapOfGroupRole.MapOfFunction.Add(mapOfFunction);
                                            }
                                        }

                                        mapOfApplication.MapOfGroupRole.Add(mapOfGroupRole);
                                    }
                                }

                                mapOfRole.MapOfApplication.Add(mapOfApplication);
                            }
                        }

                        result.Add(mapOfRole);
                    }
                }
            }

            return result;
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
}