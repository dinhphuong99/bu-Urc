using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;

namespace III.Admin.Controllers
{
    public class VIBUIGPermissionModel
    {
        public string UserId { set; get; }
        public string UserName { set; get; }
        public string FullName { set; get; }
        public string Email { set; get; }
        public string RoleId { set; get; }
        public string GroupUserCode { set; get; }
    }
    public class ObjGetUserInGroupModel
    {
        public string Account { set; get; }
        public List<string> ListGUserId { set; get; }
    }
    public class ObjGetResourceModel
    {
        public int AppId { set; get; }
        public string AppCode { set; get; }
        public List<string> ListGUserId { set; get; }
        public List<string> ListFuncId { set; get; }
        public string RoleId { set; get; }
        public bool IsMultiple { get; set; }
    }
    [Area("Admin")]
    public class PermissionResourceController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly ILogger _logger;
        private readonly IActionLogService _actionLog;
        private readonly IStringLocalizer<PermissionResourceController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public PermissionResourceController(EIMDBContext context, ILogger<PermissionResourceController> logger, IActionLogService actionLog, IStringLocalizer<PermissionResourceController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _logger = logger;
            _actionLog = actionLog;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }

        //public IActionResult Index()
        //{
        //    return View();
        //}

        [HttpPost]
        public object GetApplication()
        {
            var a = _context.AdApplications.Select(x => new { Id = x.ApplicationId, x.Title, Code = x.ApplicationCode, });
            return Json(a);
        }

        //[HttpPost]
        //public object GetFunction([FromBody]TempSub obj)
        //{
        //    try
        //    {
        //        if (obj.IdS.Length > 0)
        //        {
        //            var appCode = obj.IdS[0];
        //            var query = from af in _context.VIBAppFunctions
        //                join fu in _context.VIBFunctions on af.FunctionCode equals fu.FunctionCode
        //                where af.ApplicationCode == appCode
        //                orderby fu.Ord
        //                select new
        //                {
        //                    Id = fu.FunctionId,
        //                    Code = fu.FunctionCode,
        //                    Title = fu.Title,
        //                    ParentId = fu.ParentCode
        //                };
        //            //var a = _context.VIBFunctions.OrderBy(x => x.Id).Select(x => new { x.Id, x.Code, x.Title, x.ParentId }).AsNoTracking().ToList();
        //            return Json(query);
        //        }
        //        else
        //        {
        //            //if (obj.search == null) obj.search = "";
        //            //var Count = _context.VIBResources.Where(x => x.Title.Contains(obj.search)).Count();
        //            //var nextItems = (obj.bigCurrentPage - 1) * obj.itemsPerPage;
        //            //var a = _context.VIBResources.OrderBy(x => x.Id).Select(x => new { x.Id, x.Title, x.ParentId }).AsNoTracking().ToList();
        //            //Pagination objtemp = new Pagination() { bigTotalItems = Count, bigCurrentPage = obj.bigCurrentPage, Data = a };
        //            return Json("[]");
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        JMessage objex = new JMessage() { Error = true, Object = ex };
        //        return Json(objex);
        //    }
        //}
        [HttpPost]
        public async Task<IActionResult> GetFunction([FromBody]TempSub obj)
        {
            List<FunctionModel> result = new List<FunctionModel>();
            try
            {
                if (obj.IdS.Length > 0)
                {
                    if (obj.IdS.Length == 3)
                    {
                        var appCode = obj.IdS[0];
                        var groupCode = obj.IdS[1];
                        var roleId = obj.IdS[2];

                        var listGroupFunction = await _context.AdPermissions.Include(i => i.Function).Where(x => x.GroupUserCode == groupCode && x.RoleId == roleId && x.UserId == null).GroupBy(g => g.Function).ToListAsync();
                        //var listGroupFunction = await _context.AdPermissions.Include(i => i.Function).Where(x => x.ApplicationCode == appCode && x.GroupUserCode == groupCode && x.RoleId == roleId && x.UserId == null).GroupBy(g => g.Function).ToListAsync();
                        if (listGroupFunction.Count > 0)
                        {
                            foreach (var grpFunc in listGroupFunction)
                            {
                                var func = grpFunc.Key;
                                var function = new FunctionModel();
                                function.Id = func.FunctionId;
                                function.Title = func.Title;
                                function.Code = func.FunctionCode;
                                function.ParentCode = func.ParentCode;
                                result.Add(function);
                            }
                        }
                    }
                    else
                    {
                        var appCode = obj.IdS[0];
                        //var query = from af in _context.AdAppFunctions
                        //            join fu in _context.AdFunctions on af.FunctionCode equals fu.FunctionCode
                        //            where af.ApplicationCode == appCode
                        //            orderby fu.Title
                        //            select new FunctionModel
                        //            {
                        //                Id = fu.FunctionId,
                        //                Title = fu.Title,
                        //                Code = fu.FunctionCode,
                        //                ParentCode = fu.ParentCode
                        //            };
                        var query = from fu in _context.AdFunctions
                                    orderby fu.Title
                                    select new FunctionModel
                                    {
                                        Id = fu.FunctionId,
                                        Title = fu.Title,
                                        Code = fu.FunctionCode,
                                        ParentCode = fu.ParentCode
                                    };

                        //var data = query.OrderByDescending(x => x.Title).AsNoTracking();

                        var listFunction = query.ToList();
                        if (obj.IdS.Length == 2)
                        {
                            var funcCode = obj.IdS[1];
                            var listFunctionChild = listFunction.Where(x => x.Code == funcCode).OrderByDescending(x => x.Title);

                            foreach (var func in listFunctionChild)
                            {
                                var listChild = GetFunctionChild(listFunction, func.Code, 1);

                                var function = new FunctionModel();
                                function.Id = func.Id;
                                function.Title = func.Title;
                                function.Code = func.Code;
                                function.ParentCode = func.ParentCode;
                                result.Add(function);
                                if (listChild.Count > 0) result = result.Concat(listChild).ToList();
                            }
                            var res = result.ToList();
                            return Json(res);
                        }
                        else
                        {
                            foreach (var func in listFunction.Where(x => string.IsNullOrEmpty(x.ParentCode)).OrderByDescending(x => x.Title))
                            {
                                var listChild = GetFunctionChild(listFunction, func.Code, 1);

                                var function = new FunctionModel();
                                function.Id = func.Id;
                                function.Title = func.Title;
                                function.Code = func.Code;
                                function.ParentCode = func.ParentCode;
                                function.Ord = 1;
                                result.Add(function);
                                if (listChild.Count > 0) result = result.Concat(listChild).ToList();
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                JMessage objex = new JMessage() { Error = true, Object = ex };
            }

            return Json(result);
        }
        private static List<FunctionModel> GetFunctionChild(IList<FunctionModel> listFunction, string parentCode, int ord = 0)
        {
            ord++;
            var result = new List<FunctionModel>();
            var query = from func in listFunction
                        where func.ParentCode == parentCode
                        select new FunctionModel
                        {
                            Id = func.Id,
                            Title = func.Title,
                            Code = func.Code,
                            ParentCode = func.ParentCode,
                            Ord = ord,
                        };
            var listFunc = query as IList<FunctionModel> ?? query.OrderByDescending(x => x.Title).ToList();
            foreach (var func in listFunc)
            {
                var destination = GetFunctionChild(listFunction, func.Code, ord);
                result.Add(func);
                if (destination.Count > 0) result = result.Concat(destination).ToList();
            }
            return result;
        }

        ////Get Resource with only functionId
        //[HttpGet]
        //public async Task<IActionResult> GetResource(int appId, int funcId, string groupId)
        //{
        //    try
        //    {
        //        var listPermission = await _context.VIBPermissions.Where(x => x.ApplicationId == appId && x.FunctionId == funcId && x.GroupUserId == groupId).ToListAsync();
        //        var funcRes = await _context.VIBPrivileges.Include(x => x.Resource).Where(x => x.FunctionId == funcId).OrderBy(o => o.Resource.Title).ToListAsync();
        //        var query = from fr in funcRes
        //            select new VIBResourcePermission
        //            {
        //                Id = fr.ResourceId,
        //                Code = fr.Resource.Code,
        //                Title = fr.Resource.Title,
        //                Description = fr.Resource.Description,
        //                Api = fr.Resource.Api,
        //                Path = fr.Resource.Path,
        //                Ord = fr.Resource.Ord,
        //                ParentId = fr.Resource.ParentId,
        //                HasPermission = listPermission.Any(x => x.ResourceId == fr.ResourceId)
        //            };

        //        return Json(query);
        //    }
        //    catch (Exception ex)
        //    {
        //        JMessage objex = new JMessage() { Error = true, Object = ex };
        //        return Json(objex);
        //    }
        //}



        //Get Resource with multiple functionId
        [HttpPost]
        public async Task<IActionResult> GetResource([FromBody]ObjGetResourceModel obj)
        {
            try
            {
                List<AdResourcePermission> result = new List<AdResourcePermission>();
                foreach (var funcIdS in obj.ListFuncId)
                {
                    var funcId = funcIdS;
                    List<AdPermission> listPermission = new List<AdPermission>();
                    foreach (var groupId in obj.ListGUserId)
                    {
                        var pms = await _context.AdPermissions.Where(x => x.FunctionCode == funcId && x.GroupUserCode == groupId).ToListAsync(); /*x.ApplicationCode == obj.AppCode &&*/
                        listPermission.AddRange(pms);
                    }
                    var funcRes = await _context.AdPrivileges.Include(x => x.Resource).Where(x => x.FunctionCode == funcId).OrderBy(o => o.Resource.Title).ToListAsync();
                    var query = from fr in funcRes
                                select new AdResourcePermission
                                {
                                    Id = fr.PrivilegeId,
                                    Code = fr.Resource.ResourceCode,
                                    Title = fr.Resource.Title,
                                    Description = fr.Resource.Description,
                                    Api = fr.Resource.Api,
                                    Path = fr.Resource.Path,
                                    Ord = fr.Resource.Ord,
                                    ParentCode = fr.Resource.ParentCode,
                                    FunctionCode = fr.FunctionCode,
                                    HasPermission = listPermission.Any(x => x.ResourceCode == fr.ResourceCode)
                                };
                    result.AddRange(query);
                }
                return Json(result);
            }
            catch (Exception ex)
            {
                JMessage objex = new JMessage() { Error = true, Object = ex };
                return Json(objex);
            }
        }

        ////Get Resource with multiple functionId
        //[HttpPost]
        //public async Task<IActionResult> GetResource([FromBody]ObjGetResourceModel obj)
        //{
        //    try
        //    {
        //        List<VIBResourcePermission> result = new List<VIBResourcePermission>();
        //        foreach (var funcIdS in obj.ListFuncId)
        //        {
        //            var funcId = Int32.Parse(funcIdS);
        //            var listPermission = await _context.VIBPermissions.Where(x => x.ApplicationId == obj.AppId && x.FunctionId == funcId && x.GroupUserId == obj.GroupId).ToListAsync();
        //            var funcRes = await _context.VIBPrivileges.Include(x => x.Resource).Where(x => x.FunctionId == funcId).OrderBy(o => o.Resource.Title).ToListAsync();
        //            var query = from fr in funcRes
        //                        select new VIBResourcePermission
        //                        {
        //                            Id = fr.ResourceId,
        //                            Code = fr.Resource.Code,
        //                            Title = fr.Resource.Title,
        //                            Description = fr.Resource.Description,
        //                            Api = fr.Resource.Api,
        //                            Path = fr.Resource.Path,
        //                            Ord = fr.Resource.Ord,
        //                            ParentId = fr.Resource.ParentId,
        //                            HasPermission = listPermission.Any(x => x.ResourceId == fr.ResourceId)
        //                        };
        //            result.AddRange(query);
        //        }
        //        return Json(result);
        //    }
        //    catch (Exception ex)
        //    {
        //        JMessage objex = new JMessage() { Error = true, Object = ex };
        //        return Json(objex);
        //    }
        //}

        //[HttpPost]
        //public async Task<IActionResult> UpdatePermission([FromBody]PermissionModel model)
        //{
        //    JMessage msg = new JMessage { Error = true, Title = string.Format(_stringLocalizer["MSG_UPDATE_FAIL"), _stringLocalizer["PERMISSION").ToLower()) };
        //    try
        //    {
        //        if (model.UserInGroups.Count > 0 && model.Resources.Count > 0)
        //        {
        //            foreach (var user in model.UserInGroups)
        //            {
        //                foreach (var resource in model.Resources)
        //                {
        //                    var permission = await _context.AdPermissions.FirstOrDefaultAsync(x => x.FunctionCode == resource.FunctionCode && x.ResourceCode == resource.Code && x.GroupUserCode == user.GroupUserCode && x.UserId == user.UserId); /*x.ApplicationCode == model.ApplicationCode &&*/

        //                    if (permission == null)
        //                    {
        //                        if (resource.HasPermission)
        //                        {
        //                            // Add new permission
        //                            permission = new AdPermission();
        //                            //permission.ApplicationCode = model.ApplicationCode;
        //                            permission.ApplicationCode = "ADMIN";
        //                            permission.FunctionCode = resource.FunctionCode;
        //                            permission.ResourceCode = resource.Code;
        //                            permission.GroupUserCode = user.GroupUserCode;
        //                            permission.UserId = user.UserId;
        //                            permission.RoleId = user.RoleId;
        //                            _context.AdPermissions.Add(permission);
        //                            //_actionLog.InsertActionLog("VIB_PERMISSION", "Add permission successfully", null, permission, "Insert");
        //                        }
        //                    }
        //                    else
        //                    {
        //                        if (resource.HasPermission)
        //                        {
        //                            // Update permission
        //                            permission.RoleId = user.RoleId;
        //                            _context.AdPermissions.Update(permission);
        //                            //_actionLog.InsertActionLog("VIB_PERMISSION", "Update permission successfully", null, permission, "Insert");
        //                        }
        //                        else
        //                        {
        //                            _context.AdPermissions.Remove(permission);
        //                            await _context.SaveChangesAsync();
        //                        }
        //                    }
        //                }
        //                // Update role of user in group
        //                var userInGroup = await _context.AdUserInGroups.FirstOrDefaultAsync(x => x.GroupUserCode == user.GroupUserCode && x.UserId == user.UserId);
        //                if (userInGroup != null)
        //                {
        //                    userInGroup.RoleId = user.RoleId;
        //                    _context.AdUserInGroups.Update(userInGroup);
        //                }
        //            }

        //            var result = await _context.SaveChangesAsync();
        //            //if (result > 0)
        //            //{
        //            //_logger.LogInformation(LoggingEvents.LogDb, "Update permission success");
        //            ////_actionLog.InsertActionLog("VIBGroupUser", "Update permission success", objOld, model, "Update");

        //            //}
        //        }

        //        msg.Error = false;
        //        msg.Title = string.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"), _stringLocalizer["PERMISSION").ToLower());
        //        ////_actionLog.InsertActionLog("VIBPermissionResoure", "COM_MSG_UPDATE_SUCCESS", null, model, "Insert");
        //    }
        //    catch (Exception ex)
        //    {
        //        //_logger.LogError(LoggingEvents.LogDb, "Update permission failed");
        //        //_actionLog.InsertActionLog("VIB_PERMISSION", "Update permission failed", null, null, "Error");

        //        msg.Object = ex;
        //    }

        //    return Json(msg);
        //}

        [HttpPost]
        public object GetACtion([FromBody]TempSub obj)
        {
            try
            {
                List<string> liTemp = new List<string>();
                DataDynamic liAllTemp = new DataDynamic(2);
                var temp = _context.AdPrivileges.Where(x => obj.IdS[0] == x.FunctionCode).Select(x => new { x.ResourceCode, x.PrivilegeId });

                foreach (var item in temp)
                {
                    liTemp.Add(item.ResourceCode.ToString());
                    liAllTemp.Data[0].Add(item.PrivilegeId);
                }
                var query = _context.AdResources.Where(x => liTemp.Contains(x.ResourceCode.ToString())).Select(x => new { x.ResourceId, x.ResourceCode, x.Title, x.Description, x.Status });
                var sql = query.ToSql();

                liAllTemp.Data[1].Add(query);
                return Json(liAllTemp);
            }
            catch (Exception ex)
            {
                JMessage objex = new JMessage() { Error = true, Object = ex };
                return Json(objex);
            }
        }

        [HttpPost]
        public async Task<object> GetGUser([FromBody]GroupUserSearch search)
        {
            List<GroupUserModel> listResult;
            if (search.OnlyFunction)
            {
                //listResult = await _context.AdPermissions
                //                            .Where(x => x.ApplicationCode == search.AppCode
                //                                        && x.RoleId == search.RoleId && x.UserId == null)
                //                            .GroupBy(g => g.GroupUser)
                //                            .Select(x => new GroupUserModel
                //                            {
                //                                Id = x.Key.GroupUserId,
                //                                Code = x.Key.GroupUserCode,
                //                                Title = x.Key.Title,
                //                                ParentId = x.Key.ParentCode,
                //                                IsChecked = true,
                //                                IsEnabled = true,
                //                                Ord = x.Key.ParentCode == "D000" ? 3 : x.Key.ParentCode == "P000" ? 5 : x.Key.GroupUserCode == "G000" ? 1 : x.Key.GroupUserCode == "D000" ? 2 : x.Key.GroupUserCode == "P000" ? 4 : 6
                //                            }).AsNoTracking().ToListAsync();
                listResult = await _context.AdPermissions
                                            .Where(x => x.RoleId == search.RoleId && x.UserId == null)
                                            .GroupBy(g => g.GroupUser)
                                            .Select(x => new GroupUserModel
                                            {
                                                Id = x.Key.GroupUserId,
                                                Code = x.Key.GroupUserCode,
                                                Title = x.Key.Title,
                                                ParentId = x.Key.ParentCode,
                                                IsChecked = true,
                                                IsEnabled = true,
                                                Ord = x.Key.ParentCode == "D000" ? 3 : x.Key.ParentCode == "P000" ? 5 : x.Key.GroupUserCode == "G000" ? 1 : x.Key.GroupUserCode == "D000" ? 2 : x.Key.GroupUserCode == "P000" ? 4 : 6
                                            }).AsNoTracking().ToListAsync();
            }
            else
            {
                var list = _context.AdGroupUsers.Where(x => x.IsEnabled).AsNoTracking().ToList();
                listResult = GetSubTreeData(list, null, new List<GroupUserModel>(), 0);

            }

            return Json(listResult);
        }

        [HttpPost]
        public object GetGRole()
        {
            var a = _context.Roles.Where(x => x.Code != "ROOT" && x.Status).OrderBy(x => x.Ord).Select(x => new { x.Id, x.Title });
            return Json(a);
        }

        [HttpPost]
        public object GetUser([FromBody]Paging obj)
        {
            try
            {
                if (obj.search == null) obj.search = "";
                var count = _context.Users.Count(x => string.IsNullOrEmpty(obj.search) || x.UserName.Contains(obj.search));
                var nextItems = (obj.bigCurrentPage - 1) * obj.itemsPerPage;
                var a = _context.Users.Where(x => string.IsNullOrEmpty(obj.search) || x.UserName.Contains(obj.search)).OrderBy(x => x.UserName).Select(x => new { x.Id, x.UserName }).Skip(nextItems).Take(obj.itemsPerPage).AsNoTracking().ToList();
                Pagination objtemp = new Pagination() { bigTotalItems = count, bigCurrentPage = obj.bigCurrentPage, Data = a };
                return Json(objtemp);
            }
            catch (Exception ex)
            {
                JMessage objex = new JMessage() { Error = true, Object = ex };
                return Json(objex);
            }
        }

        ////Get UserInGroup with only GroupUserId
        //[HttpPost]
        //public IActionResult GetUserInGroup(string id, string account)
        //{
        //    try
        //    {
        //        var query = from uig in _context.VIBUserInGroups
        //                    where uig.GroupUserId == id
        //                    select new
        //                    {
        //                        UserId = uig.User.Id,
        //                        UserName = uig.User.UserName,
        //                        FullName = uig.User.FamilyName + " " + uig.User.GivenName,
        //                        Email = uig.User.Email,
        //                        RoleId = uig.RoleId,
        //                    };
        //        var query2 = query.ToList().Where(p => string.IsNullOrEmpty(account) || p.UserName.ToLower().Contains(account.ToLower()));
        //        return Json(query2);
        //    }
        //    catch (Exception ex)
        //    {
        //        JMessage objex = new JMessage() { Error = true, Object = ex };
        //        return Json(objex);
        //    }
        //}


        //Get UserInGroup with multiple GroupUserId
        [HttpPost]
        public IActionResult GetUserInGroup([FromBody]ObjGetUserInGroupModel obj)
        {
            try
            {
                var userId = ESEIM.AppContext.UserId;

                List<VIBUIGPermissionModel> result = new List<VIBUIGPermissionModel>();
                foreach (var id in obj.ListGUserId)
                {
                    var query = from uig in _context.AdUserInGroups
                                where uig.GroupUserCode == id && uig.UserId != userId
                                select new VIBUIGPermissionModel
                                {
                                    UserId = uig.User.Id,
                                    UserName = uig.User.UserName,
                                    FullName = uig.User.FamilyName + " " + uig.User.GivenName,
                                    Email = uig.User.Email,
                                    RoleId = uig.RoleId,
                                    GroupUserCode = uig.GroupUserCode,
                                };
                    result.AddRange(query);
                }
                var query2 = result.Where(p => string.IsNullOrEmpty(obj.Account) || p.UserName.ToLower().Contains(obj.Account.ToLower())).ToList();
                return Json(query2);
            }
            catch (Exception ex)
            {
                JMessage objex = new JMessage() { Error = true, Object = ex };
                return Json(objex);
            }
        }

        [HttpPost]
        public async Task<IActionResult> GetAllBranch([FromBody]SearchBranchModel search)
        {
            if (search.OnlySelected)
            {
                var listRef = new List<string>();
                //var user = await _context.Users.Include(i => i.Branch).FirstOrDefaultAsync(x => x.Id == search.UserId);
                //if (user != null && !string.IsNullOrEmpty(user.OrgReference))
                //{
                //    listRef = user.OrgReference.Split(',').ToList();
                //}
                var userInGroup = await _context.AdUserInGroups.FirstOrDefaultAsync(x => x.UserId == search.UserId); /*x.ApplicationCode == search.AppCode &&*/
                if (!string.IsNullOrEmpty(userInGroup?.BranchReference))
                {
                    listRef = userInGroup.BranchReference.Split(',').ToList();
                }

                return Json(listRef);
            }
            else
            {
                var listRef = new List<string>();
                var user = await _context.Users.Include(i => i.Branch).FirstOrDefaultAsync(x => x.Id == search.UserId);
                if (user != null && !string.IsNullOrEmpty(user.OrgReference))
                {
                    listRef = user.OrgReference.Split(',').ToList();
                }

                //var data = _context.VIBOrganizations
                //                   .Where(x => x.OrgGroup.HasValue && x.OrgGroup.Value == 2)//&& (string.IsNullOrEmpty(search.Name) || x.OrgCode.ToLower().Contains(search.Name) || x.OrgName.ToLower().Contains(search.Name)))
                //                                                                            //.OrderBy(x => x.OrgName)
                //                   .Select(x => new
                //                   {
                //                       OrgAddonCode = x.OrgAddonCode,
                //                       OrgCode = x.OrgCode,
                //                       OrgName = x.OrgName,
                //                       BranchName = string.Format("{0} - {1}", x.OrgCode, x.OrgName),
                //                       IsChecked = listRef.Any(y => y == x.OrgAddonCode)
                //                   });

                var allBranch = new OrganizationModel
                {
                    OrgId = 0,
                    OrgAddonCode = "b_000",
                    OrgCode = "b_000",
                    OrgName = "All Branch",
                    OrgParentCode = null,
                    OrgGroup = 4,
                    Ord = 0,
                    Company = "HO",
                    Division = null,
                    DisabledCheck = false,
                    IsMain = false,
                };

                var query = from x in _context.AdOrganizations
                            join gvd in _context.AdDivisions on x.Division equals gvd.Division into grp1
                            from vd in grp1.DefaultIfEmpty()
                            where (x.OrgGroup.HasValue && x.OrgGroup.Value == 2 && x.IsEnabled)
                            //&& (string.IsNullOrEmpty(jTablePara.Name) || x.OrgName.ToLower().Contains(jTablePara.Name.ToLower()) || x.OrgCode.ToLower().Contains(jTablePara.Name.ToLower()))
                            select new OrganizationModel
                            {
                                OrgId = x.OrgId,
                                OrgAddonCode = x.OrgAddonCode,
                                OrgCode = x.OrgCode,
                                OrgName = string.Format("{0} - {1}", x.OrgCode, x.OrgName),
                                OrgParentCode = x.Division == null ? null : string.Format("d_{0}", x.Division),
                                OrgGroup = x.OrgGroup,
                                Ord = x.Company == "HO" && x.Division == null ? 2 : x.Company == "DIV" ? 3 : x.Company == "BRA" ? 4 : 5,
                                Company = x.Company,
                                Division = vd == null ? "" : vd.DivisionDesc,
                                DisabledCheck = false,
                                IsMain = false,
                            };

                var queryDivision = from vd in _context.AdDivisions
                                    select new OrganizationModel
                                    {
                                        OrgId = 0,
                                        OrgAddonCode = string.Format("d_{0}", vd.Division),
                                        OrgCode = vd.Division,
                                        OrgName = string.Format("{0} - {1}", vd.Division, vd.DivisionDesc),
                                        OrgParentCode = "b_000",
                                        OrgGroup = 2,
                                        Ord = 1,
                                        Company = "DIV",
                                        Division = vd.Division,
                                        DisabledCheck = true,
                                        IsMain = false,
                                    };

                var data = query.Union(queryDivision).OrderBy(x => x.Ord).ThenBy(o => o.OrgAddonCode).AsNoTracking().ToList();
                data.Insert(0, allBranch);

                var result = data.Select(x => new
                {
                    OrgAddonCode = x.OrgAddonCode,
                    OrgCode = x.OrgCode,
                    OrgName = x.OrgName,
                    OrgParentCode = x.OrgParentCode,
                    Ord = x.Ord,
                    DisabledCheck = x.DisabledCheck,
                    IsMain = x.IsMain,
                    IsChecked = listRef.Any(y => y == x.OrgAddonCode) || (listRef.Count > 0 && listRef[0] == "b_000")
                }).ToList();

                return Json(result);
            }
        }

        [HttpPost]
        public async Task<IActionResult> GetBranchReference([FromBody]SearchBranchModel search)
        {
            var user = await _context.Users.Include(i => i.Branch).FirstOrDefaultAsync(x => x.Id == search.UserId);
            if (user != null)
            {
                var listBranchRef = new List<BranchModel>();
                if (!string.IsNullOrEmpty(user.OrgReference))
                {
                    if (user.OrgReference == "b_000")
                    {
                        var allBranch = new BranchModel();
                        allBranch.OrgAddonCode = "b_000";
                        allBranch.OrgCode = "b_000";
                        allBranch.OrgName = "All Branch";
                        listBranchRef.Add(allBranch);
                    }
                    else
                    {
                        var listRef = user.OrgReference.Split(',').ToList();
                        listBranchRef = _context.AdOrganizations.Where(x => x.OrgGroup.HasValue && x.OrgGroup.Value == 2 && listRef.Any(y => y == x.OrgAddonCode))
                            .Select(x => new BranchModel
                            {
                                OrgAddonCode = x.OrgAddonCode,
                                OrgCode = x.OrgCode,
                                OrgName = string.Format("{0} - {1}", x.OrgCode, x.OrgName)
                            }).ToList();
                    }
                }

                var result = new
                {
                    MainBranch = user.Branch != null ? string.Format("{0} - {1}", user.Branch.OrgCode, user.Branch.OrgName) : "",
                    ListBranchRef = listBranchRef,
                };

                return Json(result);
            }
            return Json("[]");
        }

        [HttpPost]
        public async Task<IActionResult> UpdateBranchReference([FromBody] SearchBranchModel search)
        {
            var msg = new JMessage() { Error = false };

            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == search.UserId);
                if (user != null)
                {
                    var oldBranchRef = user.OrgReference;
                    user.OrgReference = search.ListBranch.Count > 0 ? string.Join(",", search.ListBranch) : "";
                    user.UpdatedDate = DateTime.Now;
                    user.UpdatedBy = ESEIM.AppContext.UserName;
                    _context.Update(user);
                    await _context.SaveChangesAsync();

                    msg.Title = string.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["BRANCH"].Value.ToLower());
                    //_actionLog.InsertActionLog("ASP_NET_USERS", "Update success branch reference of user: " + user.UserName, oldBranchRef, user.OrgReference, "Update");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = string.Format(_stringLocalizer["NOT_EXIST_ITEM"], _stringLocalizer["USER"].Value.ToLower());
                }
            }
            catch (Exception e)
            {
                msg.Error = true;
                msg.Title = "An error occurred while update";
                //_actionLog.InsertActionLog("ASP_NET_USERS", "Update failed branch reference of user", null, null, "Error");
            }

            return Json(msg);
        }

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

        [NonAction]
        private List<GroupUserModel> GetSubTreeData(List<AdGroupUser> data, string parentCode, List<GroupUserModel> lstCategories, int tab)
        {
            var contents = parentCode == null
                ? data.Where(x => x.ParentCode == null).OrderBy(x => x.GroupUserId).ToList()
                : data.Where(x => x.ParentCode == parentCode).OrderBy(x => x.Title).ToList();
            foreach (var item in contents)
            {
                var category = new GroupUserModel
                {
                    Id = item.GroupUserId,
                    Code = item.GroupUserCode,
                    Title = item.Title,
                    ParentId = item.ParentCode,
                    IsChecked = false,
                    IsEnabled = false,
                    Level = tab,
                    HasChild = data.Any(x => x.ParentCode == item.GroupUserCode)
                };
                lstCategories.Add(category);
                if (category.HasChild) GetSubTreeData(data, item.GroupUserCode, lstCategories, tab + 1);
            }
            return lstCategories;
        }
    }

    public class SearchBranchModel
    {
        public string AppCode { get; set; }
        public string UserId { get; set; }
        public string Name { get; set; }
        public List<string> ListBranch { get; set; }
        public bool OnlySelected { get; set; }
    }

    public class BranchModel
    {
        public string OrgAddonCode { get; set; }
        public string OrgCode { get; set; }
        public string OrgName { get; set; }
        public string OrgParentCode { get; set; }
        public string BranchName { get; set; }
        public int OrgOrd { get; set; }
    }

    public class GroupUserSearch
    {
        public string RoleId { get; set; }
        public string AppCode { get; set; }
        public string Function { get; set; }
        public bool OnlyFunction { get; set; }
    }
}